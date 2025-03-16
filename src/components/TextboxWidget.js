import React, { useState, useEffect } from 'react';
import { Box, TextField } from '@mui/material';

/**
 * A widget that displays an editable textbox
 * @param {Object} props - Component props
 * @param {Object} userContext - User context passed from Widget wrapper
 * @param {Object} themeContext - Theme context passed from Widget wrapper
 * @param {string} content - Content for the textbox
 * @param {function} onContentChange - Callback when content changes
 * @param {string} widgetId - ID of the widget
 */
const TextboxWidget = ({ userContext, themeContext, content = '', onContentChange, widgetId }) => {
  const [text, setText] = useState(content);

  // Update local state when content prop changes
  useEffect(() => {
    setText(content);
  }, [content]);

  const handleChange = (event) => {
    const newText = event.target.value;
    setText(newText);
    
    // Notify parent component about the content change
    if (onContentChange) {
      onContentChange(widgetId, newText);
    }
  };
  
  // This function is critical to prevent drag events from interfering with text editing
  const preventDragPropagation = (e) => {
    e.stopPropagation();
  };
  
  return (
    <Box 
      sx={{ 
        height: '100%', 
        position: 'relative',
      }}
    >
      {/* Editable textbox */}
      <TextField
        multiline
        fullWidth
        variant="outlined"
        value={text}
        onChange={handleChange}
        placeholder="Edit this text..."
        sx={{
          height: '100%',
          '& .MuiOutlinedInput-root': {
            height: '100%',
            display: 'flex',
            alignItems: 'flex-start',
            '& textarea': {
              height: '100%',
              overflow: 'auto',
              cursor: 'text',
            },
          },
          '& .MuiInputBase-root': {
            padding: 1,
          },
          // Override pointer-events to ensure TextField interaction works
          pointerEvents: 'auto'
        }}
        // Critical for preventing drag while editing text
        inputProps={{
          style: { cursor: 'text' }
        }}
      />
    </Box>
  );
};

export default TextboxWidget; 