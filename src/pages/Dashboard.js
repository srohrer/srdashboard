import { useState } from 'react';
import { Box, Paper } from '@mui/material';
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

// Draggable widget component
const DraggableWidget = ({ id, x, y, children }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: id,
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
        width: '250px',
        zIndex: transform ? 999 : 1,
      }}
      {...attributes}
      {...listeners}
    >
      <Paper
        sx={{
          p: 2,
          height: '100%',
          minHeight: '100px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'grab',
          userSelect: 'none',
          '&:active': { cursor: 'grabbing' }
        }}
      >
        {children}
      </Paper>
    </Box>
  );
};

const Dashboard = () => {
  // Initial widgets with positions
  const [widgets, setWidgets] = useState([
    { id: '1', content: 'Widget 1', x: 50, y: 50 },
    { id: '2', content: 'Widget 2', x: 350, y: 50 },
    { id: '3', content: 'Widget 3', x: 50, y: 200 },
    { id: '4', content: 'Widget 4', x: 350, y: 200 },
  ]);
  
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  // Canvas dropzone setup
  const { setNodeRef: setCanvasRef } = useDroppable({
    id: 'canvas',
  });

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    setActiveId(null);
    
    const { active, delta } = event;
    
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
      <DndContext 
        sensors={sensors} 
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
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
              {widget.content}
            </DraggableWidget>
          ))}
        </Box>
      </DndContext>
    </Box>
  );
};

export default Dashboard; 