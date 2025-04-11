import React, { useState, useEffect } from 'react';
import { Box, TextField, Typography, IconButton, List, Paper, Fade } from '@mui/material';
import { 
  DndContext, 
  useSensor, 
  useSensors, 
  PointerSensor,
  KeyboardSensor 
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';

/**
 * A single todo item component that can be dragged to reorder
 */
const TodoItem = ({ id, text, completed, onChange, onDelete, onComplete }) => {
  const { 
    attributes, 
    listeners, 
    setNodeRef, 
    transform, 
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    backgroundColor: completed ? 'rgba(76, 175, 80, 0.15)' : 'inherit',
    marginBottom: 1
  };

  // This function is critical to prevent drag events from interfering with text editing
  const preventDragPropagation = (e) => {
    e.stopPropagation();
  };

  return (
    <Paper 
      ref={setNodeRef} 
      style={style}
      elevation={isDragging ? 3 : 1}
      sx={{ 
        mb: 1, 
        p: 0.5, 
        display: 'flex', 
        alignItems: 'stretch',
        borderLeft: completed ? '4px solid #4caf50' : 'none'
      }}
    >
      <Box 
        sx={{ 
          display: 'flex',
          alignItems: 'stretch'
        }}
      >
        <IconButton 
          size="small" 
          {...attributes} 
          {...listeners}
          sx={{ 
            cursor: 'grab', 
            '&:active': { cursor: 'grabbing' },
            height: '100%',
            alignSelf: 'stretch',
            display: 'flex'
          }}
        >
          <DragIndicatorIcon />
        </IconButton>
      </Box>
      
      <TextField
        fullWidth
        variant="standard"
        value={text}
        onChange={(e) => onChange(id, e.target.value)}
        disabled={completed}
        multiline
        onClick={preventDragPropagation}
        onMouseDown={preventDragPropagation}
        onKeyDown={preventDragPropagation}
        sx={{ 
          mx: 1,
          color: completed ? 'text.disabled' : 'text.primary',
          '& .MuiInputBase-root': {
            fontSize: '0.9rem'
          },
          flexGrow: 1,
          flexBasis: '60%',
          maxWidth: '70%'
        }}
      />
      
      <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0, ml: 'auto' }}>
        <IconButton 
          size="small" 
          onClick={() => onComplete(id)} 
          color={completed ? "success" : "default"}
          title={completed ? "Mark as incomplete" : "Mark as complete"}
        >
          <CheckCircleIcon />
        </IconButton>
        
        <IconButton 
          size="small" 
          onClick={() => onDelete(id)} 
          color="error"
          title="Delete task"
        >
          <DeleteIcon />
        </IconButton>
      </Box>
    </Paper>
  );
};

/**
 * Todo list widget that maintains a list of tasks
 */
const TodoWidget = ({ userContext, themeContext, content = '{"title":"Todo List","todos":[]}', onContentChange, widgetId }) => {
  // Parse initial content or use empty array if parsing fails
  const parseContent = (contentStr) => {
    try {
      const parsed = JSON.parse(contentStr);
      // Support both formats: array of todos or {title, todos} object
      if (Array.isArray(parsed)) {
        return { title: 'Todo List', todos: parsed };
      }
      return parsed;
    } catch (e) {
      return { title: 'Todo List', todos: [] };
    }
  };

  const [todoData, setTodoData] = useState(parseContent(content));
  const { title, todos } = todoData;
  const [showCelebration, setShowCelebration] = useState(false);
  
  // Update local state when content prop changes
  useEffect(() => {
    setTodoData(parseContent(content));
  }, [content]);

  // Check if all todos are completed
  useEffect(() => {
    if (todos.length > 0 && todos.every(todo => todo.completed)) {
      setShowCelebration(true);
      // Hide celebration after 3 seconds
      const timer = setTimeout(() => {
        setShowCelebration(false);
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setShowCelebration(false);
    }
  }, [todos]);

  // Set up DndContext sensors with optimized settings
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Small drag distance threshold
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handler to add a new todo item
  const handleAddTodo = () => {
    const newTodos = [
      ...todos,
      { id: `todo-${Date.now()}`, text: '', completed: false }
    ];
    updateTodoData({ ...todoData, todos: newTodos });
  };

  // Handler to update a todo item text
  const handleChangeTodo = (id, newText) => {
    const newTodos = todos.map(todo => 
      todo.id === id ? { ...todo, text: newText } : todo
    );
    updateTodoData({ ...todoData, todos: newTodos });
  };

  // Handler to delete a todo item
  const handleDeleteTodo = (id) => {
    const newTodos = todos.filter(todo => todo.id !== id);
    updateTodoData({ ...todoData, todos: newTodos });
  };

  // Handler to toggle a todo item's completed status
  const handleCompleteTodo = (id) => {
    const newTodos = todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    updateTodoData({ ...todoData, todos: newTodos });
  };

  // Handler to update the title
  const handleTitleChange = (e) => {
    updateTodoData({ ...todoData, title: e.target.value });
  };

  // Handle drag end for reordering
  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      // Find the indices of the dragged and target items
      const oldIndex = todos.findIndex(todo => todo.id === active.id);
      const newIndex = todos.findIndex(todo => todo.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        // Create a new array with the reordered items
        const newTodos = [...todos];
        const [movedItem] = newTodos.splice(oldIndex, 1);
        newTodos.splice(newIndex, 0, movedItem);
        
        updateTodoData({ ...todoData, todos: newTodos });
      }
    }
  };

  // Update state and notify parent about content changes
  const updateTodoData = (newData) => {
    setTodoData(newData);
    notifyContentChange(newData);
  };

  // Notify parent about content changes
  const notifyContentChange = (data) => {
    if (onContentChange) {
      onContentChange(widgetId, JSON.stringify(data));
    }
  };

  // This function is critical to prevent drag events from interfering with text editing
  const preventDragPropagation = (e) => {
    e.stopPropagation();
  };

  return (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
      width: '100%',
      position: 'relative',
      overflow: 'hidden'  // Prevent outer container from scrolling
    }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <TextField
          value={title}
          onChange={handleTitleChange}
          variant="standard"
          onClick={preventDragPropagation}
          onMouseDown={preventDragPropagation}
          onKeyDown={preventDragPropagation}
          sx={{ 
            flexGrow: 1,
            mr: 1,
            '& input': {
              fontSize: '1.25rem',
              fontWeight: 'bold',
              paddingBottom: '4px'
            },
            '& .MuiInput-underline:before': {
              borderBottomColor: 'transparent'
            },
            '& .MuiInput-underline:hover:before': {
              borderBottomColor: 'rgba(0, 0, 0, 0.42)'
            },
          }}
        />
        <IconButton 
          onClick={handleAddTodo} 
          color="primary" 
          size="small"
          title="Add new task"
        >
          <AddIcon />
        </IconButton>
      </Box>
      
      <Box sx={{ 
        flexGrow: 1, 
        overflow: 'hidden', 
        position: 'relative' 
      }}>
        <DndContext 
          sensors={sensors} 
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={todos.map(todo => todo.id)} 
            strategy={verticalListSortingStrategy}
          >
            <List 
              disablePadding 
              sx={{ 
                position: 'relative', 
                zIndex: 1,
                width: '100%'
              }}
            >
              {todos.map(todo => (
                <TodoItem
                  key={todo.id}
                  id={todo.id}
                  text={todo.text}
                  completed={todo.completed}
                  onChange={handleChangeTodo}
                  onDelete={handleDeleteTodo}
                  onComplete={handleCompleteTodo}
                />
              ))}
            </List>
          </SortableContext>
        </DndContext>
        
        {todos.length === 0 && (
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ p: 2, textAlign: 'center' }}
          >
            Click + to add your first task
          </Typography>
        )}
      </Box>
      
      {todos.length > 0 && (
        <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="caption" color="text.secondary">
            {todos.filter(t => t.completed).length} of {todos.length} completed
          </Typography>
        </Box>
      )}
      
      {/* Celebration animation - moved outside of the scrollable container */}
      <Fade in={showCelebration} timeout={500}>
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
            pointerEvents: 'none',
            animation: showCelebration ? 'celebrationAnim 2s ease-in-out' : 'none',
            '@keyframes celebrationAnim': {
              '0%': {
                transform: 'scale(0.5)',
                opacity: 0
              },
              '50%': {
                transform: 'scale(1.5)',
                opacity: 1
              },
              '100%': {
                transform: 'scale(1)',
                opacity: 0.8
              }
            }
          }}
        >
          <Typography variant="h1" component="div">
            🎉
          </Typography>
        </Box>
      </Fade>
    </Box>
  );
};

export default TodoWidget; 