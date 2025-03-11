import { useState, useRef, useEffect } from 'react';
import { Box, Typography, IconButton, Button } from '@mui/material';
import {
  useDraggable,
  useDroppable,
  DragOverlay
} from '@dnd-kit/core';
import DeleteIcon from '@mui/icons-material/Delete';
import Widget from '../components/Widget';
import ExampleWidget from '../components/ExampleWidget';
import TextboxWidget from '../components/TextboxWidget';
import React from 'react';

// Draggable widget component
const DraggableWidget = ({ id, x, y, zIndex, children, onFocus }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: id
  });
  
  // Optimize the transform style
  const style = {};
  
  if (transform) {
    // Apply transform without transitions when dragging
    style.transform = `translate3d(${transform.x}px, ${transform.y}px, 0)`;
    style.zIndex = 9999; // Highest z-index while dragging
    
    if (isDragging) {
      // Add performance optimizations when actively dragging
      style.willChange = 'transform';
      style.pointerEvents = 'none';
    }
  }

  const handleWidgetFocus = (e) => {
    // Prevent event bubbling
    e.stopPropagation();
    // Call the onFocus handler with this widget's ID
    onFocus(id);
  };

  return (
    <Box
      ref={setNodeRef}
      style={{
        ...style,
        position: 'absolute',
        left: `${x}px`,
        top: `${y}px`,
        width: '300px', // Keep a consistent width of 300px
        // Apply the widget's z-index when not dragging
        zIndex: isDragging ? style.zIndex : zIndex,
        // Remove transition properties that could cause lag
        transition: isDragging ? 'none' : undefined,
      }}
      onClick={handleWidgetFocus}
      onMouseDown={handleWidgetFocus}
      {...attributes}
    >
      {React.cloneElement(children, { 
        dragListeners: listeners,
        isDragging: isDragging 
      })}
    </Box>
  );
};

// Component that shows a delete indicator when a widget is dragged offscreen
const DeleteIndicator = ({ isVisible, direction, position }) => {
  // Calculate position based on the direction
  const getIndicatorPosition = () => {
    switch (direction) {
      case 'top':
        return { top: 0, left: position, transform: 'translateX(-50%)' };
      case 'bottom':
        return { bottom: 0, left: position, transform: 'translateX(-50%)' };
      case 'left':
        return { left: 0, top: position, transform: 'translateY(-50%)' };
      case 'right':
        return { right: 0, top: position, transform: 'translateY(-50%)' };
      default:
        return {};
    }
  };

  // Get arrow rotation based on the direction
  const getArrowRotation = () => {
    switch (direction) {
      case 'top': return 'rotate(-90deg)';
      case 'bottom': return 'rotate(90deg)';
      case 'left': return 'rotate(180deg)';
      case 'right': return 'rotate(0deg)';
      default: return 'rotate(0deg)';
    }
  };

  if (!isVisible) return null;

  return (
    <Box 
      sx={{
        position: 'absolute',
        ...getIndicatorPosition(),
        display: 'flex',
        alignItems: 'center',
        padding: 1,
        zIndex: 10000,
        pointerEvents: 'none',
      }}
    >
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center',
          bgcolor: 'transparent',
          color: 'error.main',
          borderRadius: 2,
          p: 1
        }}
      >
        <DeleteIcon sx={{ color: 'error.main' }} />
        <Box 
          component="span" 
          sx={{ 
            transform: getArrowRotation(),
            display: 'inline-block',
            fontSize: '24px',
            color: 'error.main',
            ml: 1
          }}
        >
          ▶
        </Box>
      </Box>
    </Box>
  );
};

const Dashboard = () => {
  // State for tracking z-index counter
  const [zCounter, setZCounter] = useState(100);
  
  // Initial widgets with positions and z-indices
  const [widgets, setWidgets] = useState([
    { id: '1', x: 50, y: 50, type: 'example', zIndex: 1 },
    { id: '2', x: 350, y: 50, type: 'example', zIndex: 2 },
    { id: '3', x: 50, y: 200, type: 'textbox', zIndex: 3 },
    { id: '4', x: 350, y: 200, type: 'example', zIndex: 4 },
  ]);
  
  // Track drag offsets for precise positioning
  const [dragOffsets, setDragOffsets] = useState({ x: 0, y: 0 });
  
  const [isDraggingOffscreen, setIsDraggingOffscreen] = useState(false);
  const [deleteIndicator, setDeleteIndicator] = useState({
    visible: false,
    direction: '',
    position: 0
  });
  
  // Track mouse position for placing new widgets from toolkit
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  const canvasRef = useRef(null);
  const [canvasBounds, setCanvasBounds] = useState({ 
    left: 0, 
    right: 0, 
    top: 0, 
    bottom: 0 
  });

  // Listen for widget drag start events to track offsets
  useEffect(() => {
    const handleWidgetDragStart = (event) => {
      if (event.detail) {
        setDragOffsets({ 
          x: event.detail.offsetX || 0, 
          y: event.detail.offsetY || 0 
        });
      }
    };
    
    document.addEventListener('widget-drag-start', handleWidgetDragStart);
    
    return () => {
      document.removeEventListener('widget-drag-start', handleWidgetDragStart);
    };
  }, []);

  // Canvas dropzone setup
  const { setNodeRef: setDroppableRef } = useDroppable({
    id: 'canvas',
  });

  // Combine the refs
  const setCanvasRef = (element) => {
    canvasRef.current = element;
    setDroppableRef(element);
  };

  // Handler for bringing widget to front
  const bringWidgetToFront = (widgetId) => {
    const newZCounter = zCounter + 1;
    setZCounter(newZCounter);
    
    setWidgets(widgets.map(widget => {
      if (widget.id === widgetId) {
        return { ...widget, zIndex: newZCounter };
      }
      return widget;
    }));
  };

  // Update canvas bounds on mount and window resize
  useEffect(() => {
    const updateCanvasBounds = () => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        setCanvasBounds({
          left: rect.left,
          right: rect.right,
          top: rect.top,
          bottom: rect.bottom
        });
      }
    };

    updateCanvasBounds();
    window.addEventListener('resize', updateCanvasBounds);
    
    return () => {
      window.removeEventListener('resize', updateCanvasBounds);
    };
  }, []);

  // Track mouse position for toolkit widget placement
  useEffect(() => {
    const handleMouseMove = (event) => {
      setMousePosition({
        x: event.clientX,
        y: event.clientY
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Add a handler for DndContext's onDragMove event
  const handleDragMove = (event) => {
    const { active, delta } = event;
    
    if (!active) return;
    
    // Check if it's one of our canvas widgets (not from toolkit)
    // Toolkit items have IDs that start with "toolkit-"
    const isCanvasWidget = !active.id.toString().startsWith('toolkit-');
    
    if (isCanvasWidget) {
      // Bring the dragged widget to front
      bringWidgetToFront(active.id);
      
      const activeWidget = widgets.find(widget => widget.id === active.id);
      
      if (!activeWidget) return;
      
      // Calculate current widget position with the delta
      const currentX = activeWidget.x + delta.x;
      const currentY = activeWidget.y + delta.y;
      
      // Get widget dimensions (assuming 300px width and roughly 150px height)
      const widgetWidth = 300;
      const widgetHeight = 150;
      
      // Check if widget is offscreen
      const isOffLeft = currentX + widgetWidth / 2 < 0;
      const isOffRight = currentX + widgetWidth / 2 > canvasRef.current?.clientWidth;
      const isOffTop = currentY + widgetHeight / 2 < 0;
      const isOffBottom = currentY + widgetHeight / 2 > canvasRef.current?.clientHeight;
      
      const isOffscreen = isOffLeft || isOffRight || isOffTop || isOffBottom;
      
      setIsDraggingOffscreen(isOffscreen);
      
      // Update delete indicator
      if (isOffscreen) {
        let direction = '';
        let position = 0;
        
        if (isOffLeft) {
          direction = 'left';
          position = Math.max(0, Math.min(currentY, canvasRef.current?.clientHeight));
        } else if (isOffRight) {
          direction = 'right';
          position = Math.max(0, Math.min(currentY, canvasRef.current?.clientHeight));
        } else if (isOffTop) {
          direction = 'top';
          position = Math.max(0, Math.min(currentX, canvasRef.current?.clientWidth));
        } else if (isOffBottom) {
          direction = 'bottom';
          position = Math.max(0, Math.min(currentX, canvasRef.current?.clientWidth));
        }
        
        setDeleteIndicator({
          visible: true,
          direction,
          position
        });
      } else {
        setDeleteIndicator({ visible: false, direction: '', position: 0 });
      }
    }
  };

  // Add a handler for DndContext's onDragEnd event
  const handleDragEnd = (event) => {
    const { active, delta, over } = event;
    
    // Handle dragging from toolkit (create new widget)
    if (active.id.toString().startsWith('toolkit-')) {
      // Extract widget type from the data attribute
      const widgetType = active.data.current?.type || 'example';
      
      // Create a unique ID for the new widget
      const newId = `widget-${Date.now()}`;
      
      // Calculate position based on where it was dropped over the canvas
      if (canvasRef.current && over && over.id === 'canvas') {
        const canvasRect = canvasRef.current.getBoundingClientRect();
        
        // Calculate position relative to canvas - use exact position with offsets
        // Subtract the offsets to place the widget so the initial click point is preserved
        const x = mousePosition.x - canvasRect.left - dragOffsets.x;
        const y = mousePosition.y - canvasRect.top - dragOffsets.y;
        
        // Increment z-counter for the new widget
        const newZCounter = zCounter + 1;
        setZCounter(newZCounter);
        
        // Add the new widget
        const newWidget = {
          id: newId,
          x: Math.max(0, x),
          y: Math.max(0, y),
          type: widgetType,
          zIndex: newZCounter // Give it the highest z-index
        };
        
        setWidgets([...widgets, newWidget]);
      }
    } else {
      // Handle existing widget drag
      if (isDraggingOffscreen) {
        // Remove the widget
        setWidgets(widgets.filter(widget => widget.id !== active.id));
      } else if (delta) {
        // Update widget position
        setWidgets(widgets.map(widget => {
          if (widget.id === active.id) {
            return {
              ...widget,
              x: widget.x + delta.x,
              y: widget.y + delta.y,
              // Keep the highest z-index that was set during drag
              zIndex: Math.max(widget.zIndex, zCounter)
            };
          }
          return widget;
        }));
      }
    }
    
    // Reset states
    setIsDraggingOffscreen(false);
    setDeleteIndicator({ visible: false, direction: '', position: 0 });
    // Reset drag offsets after the drop
    setDragOffsets({ x: 0, y: 0 });
  };

  // Add event handlers to document to listen for drag events from the parent DndContext
  useEffect(() => {
    const handleDragMoveEvent = (event) => {
      if (event.detail && event.detail.active) {
        handleDragMove(event.detail);
      }
    };
    
    const handleDragEndEvent = (event) => {
      if (event.detail) {
        handleDragEnd(event.detail);
      }
    };
    
    document.addEventListener('dnd-drag-move', handleDragMoveEvent);
    document.addEventListener('dnd-drag-end', handleDragEndEvent);
    
    return () => {
      document.removeEventListener('dnd-drag-move', handleDragMoveEvent);
      document.removeEventListener('dnd-drag-end', handleDragEndEvent);
    };
  }, [widgets, canvasBounds, mousePosition, isDraggingOffscreen, zCounter, dragOffsets]);

  // Render the appropriate widget content based on type
  const renderWidgetContent = (widget) => {
    switch (widget.type) {
      case 'example':
        return <ExampleWidget />;
      case 'textbox':
        return <TextboxWidget />;
      default:
        return <Box>Widget Content</Box>;
    }
  };

  return (
    <Box sx={{ 
      height: '100%', // Fill parent container
      width: '100%',
      m: 0,
      p: 0,
      overflow: 'hidden',
      position: 'relative'
    }}>
      <Box 
        ref={setCanvasRef}
        sx={{ 
          height: '100%',
          width: '100%',
          bgcolor: 'background.default',
          position: 'relative',
          overflow: 'hidden', // Prevent scroll within the canvas
        }}
      >
        {widgets.map((widget) => (
          <DraggableWidget 
            key={widget.id} 
            id={widget.id}
            x={widget.x}
            y={widget.y}
            zIndex={widget.zIndex || 1}
            onFocus={bringWidgetToFront}
          >
            <Widget>
              {renderWidgetContent(widget)}
            </Widget>
          </DraggableWidget>
        ))}
        
        <DeleteIndicator 
          isVisible={deleteIndicator.visible}
          direction={deleteIndicator.direction}
          position={deleteIndicator.position}
        />
      </Box>
    </Box>
  );
};

export default Dashboard; 