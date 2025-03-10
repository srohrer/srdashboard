import { useState, useRef, useEffect } from 'react';
import { Box, Typography, IconButton, Button } from '@mui/material';
import {
  DndContext,
  useDraggable,
  useDroppable,
  pointerWithin,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import Widget from '../components/Widget';
import ExampleWidget from '../components/ExampleWidget';
import TextboxWidget from '../components/TextboxWidget';
import React from 'react';

// Draggable widget component
const DraggableWidget = ({ id, x, y, children }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: id
  });
  
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : {};

  return (
    <Box
      ref={setNodeRef}
      style={{
        ...style,
        position: 'absolute',
        left: `${x}px`,
        top: `${y}px`,
        width: '300px',
        zIndex: transform ? 999 : 1,
      }}
      {...attributes}
    >
      {React.cloneElement(children, { dragListeners: listeners })}
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
        zIndex: 1000,
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
  // Initial widgets with positions
  const [widgets, setWidgets] = useState([
    { id: '1', x: 50, y: 50, type: 'example' },
    { id: '2', x: 350, y: 50, type: 'example' },
    { id: '3', x: 50, y: 200, type: 'textbox' },
    { id: '4', x: 350, y: 200, type: 'example' },
  ]);
  
  const [activeId, setActiveId] = useState(null);
  const [isDraggingOffscreen, setIsDraggingOffscreen] = useState(false);
  const [deleteIndicator, setDeleteIndicator] = useState({
    visible: false,
    direction: '',
    position: 0
  });
  
  const canvasRef = useRef(null);
  const [canvasBounds, setCanvasBounds] = useState({ 
    left: 0, 
    right: 0, 
    top: 0, 
    bottom: 0 
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  // Canvas dropzone setup
  const { setNodeRef: setDroppableRef } = useDroppable({
    id: 'canvas',
  });

  // Combine the refs
  const setCanvasRef = (element) => {
    canvasRef.current = element;
    setDroppableRef(element);
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

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragMove = (event) => {
    if (!activeId) return;
    
    const { delta } = event;
    const activeWidget = widgets.find(widget => widget.id === activeId);
    
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
  };

  const handleDragEnd = (event) => {
    const { active, delta } = event;
    
    // Check if widget should be deleted
    if (isDraggingOffscreen) {
      // Remove the widget
      setWidgets(widgets.filter(widget => widget.id !== active.id));
    } else {
      // Update widget position
      setWidgets(widgets.map(widget => {
        if (widget.id === active.id) {
          return {
            ...widget,
            x: widget.x + delta.x,
            y: widget.y + delta.y,
          };
        }
        return widget;
      }));
    }
    
    // Reset states
    setActiveId(null);
    setIsDraggingOffscreen(false);
    setDeleteIndicator({ visible: false, direction: '', position: 0 });
  };

  // Function to add a new textbox widget
  const addTextboxWidget = () => {
    const newId = `widget-${Date.now()}`;
    const newWidget = {
      id: newId,
      x: 100,
      y: 100,
      type: 'textbox'
    };
    
    setWidgets([...widgets, newWidget]);
  };

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
      height: 'calc(100vh - 64px)', // Adjust based on your app's header size
      width: '100%',
      m: 0,
      p: 0,
      overflow: 'hidden',
      position: 'relative'
    }}>
      <Box sx={{ 
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 100
      }}>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={addTextboxWidget}
        >
          Add Textbox
        </Button>
      </Box>

      <DndContext 
        sensors={sensors} 
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
      >
        <Box 
          ref={setCanvasRef}
          sx={{ 
            height: '100%',
            width: '100%',
            bgcolor: 'background.default',
            position: 'relative',
          }}
        >
          {widgets.map((widget) => (
            <DraggableWidget 
              key={widget.id} 
              id={widget.id}
              x={widget.x}
              y={widget.y}
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
      </DndContext>
    </Box>
  );
};

export default Dashboard; 