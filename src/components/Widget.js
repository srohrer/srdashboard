import React from 'react';
import { Paper, Box } from '@mui/material';
import { useTheme } from '../contexts/ThemeContext';
import { useUser } from '../contexts/UserContext';

/**
 * Widget component that wraps existing widgets and provides them with UserContext and ThemeContext
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - The widget content to be wrapped
 * @param {Object} props.dragListeners - Drag event listeners from useDraggable
 * @param {boolean} props.isDragging - Whether the widget is currently being dragged
 */
const Widget = ({ children, dragListeners, isDragging }) => {
  // Get context data to pass to children
  const themeContext = useTheme();
  const userContext = useUser();
  
  return (
    <Paper
      elevation={isDragging ? 6 : 3}
      sx={{
        borderRadius: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
        p: 2,
        // Disable transitions when dragging to improve performance
        transition: isDragging ? 'none' : 'box-shadow 0.2s',
        // Apply styles when being dragged
        ...(isDragging && {
          opacity: 0.8,
          pointerEvents: 'none',
        }),
      }}
    >
      {/* Background element with drag-handle class - now with listeners applied */}
      <Box 
        className="drag-handle"
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1,
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
        {...dragListeners} // Apply the listeners here only
      />
      
      {/* Widget content - set cursor to default to override grab from parent */}
      <Box 
        sx={{ 
          flexGrow: 1, 
          overflow: 'auto',
          position: 'relative',
          zIndex: 2,
          // Don't allow grab cursor to propagate to content
          cursor: 'default',
          '& *': {
            cursor: 'inherit'
          },
          // But restore specific cursors for interactive elements
          '& input, & textarea': {
            cursor: 'text !important'
          },
          '& button, & [role="button"], & a': {
            cursor: 'pointer !important'
          }
        }}
        className="widget-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Clone children and pass the contexts as props */}
        {React.Children.map(children, child => {
          // Only clone if it's a valid React element
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {
              userContext,
              themeContext,
              isDragging
            });
          }
          return child;
        })}
      </Box>
    </Paper>
  );
};

export default Widget; 