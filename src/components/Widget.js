import React from 'react';
import { Paper, Box } from '@mui/material';
import { useTheme } from '../contexts/ThemeContext';
import { useUser } from '../contexts/UserContext';

/**
 * Widget component that wraps existing widgets and provides them with UserContext and ThemeContext
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - The widget content to be wrapped
 * @param {Object} props.dragListeners - Drag event listeners from useDraggable
 */
const Widget = ({ children, dragListeners }) => {
  // Get context data to pass to children
  const themeContext = useTheme();
  const userContext = useUser();
  
  return (
    <Paper
      elevation={3}
      sx={{
        borderRadius: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
        p: 2
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
          zIndex: 1
        }}
        {...dragListeners} // Apply the listeners here only
      />
      
      <Box 
        sx={{ 
          flexGrow: 1, 
          overflow: 'auto',
          position: 'relative',
          zIndex: 2
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
              themeContext
            });
          }
          return child;
        })}
      </Box>
    </Paper>
  );
};

export default Widget; 