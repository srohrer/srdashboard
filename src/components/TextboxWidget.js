import React, { useState } from 'react';
import { Box, TextField } from '@mui/material';

/**
 * A widget that displays an editable textbox
 * @param {Object} props - Component props
 * @param {Object} userContext - User context passed from Widget wrapper
 * @param {Object} themeContext - Theme context passed from Widget wrapper
 */
const TextboxWidget = ({ userContext, themeContext }) => {
  const [text, setText] = useState('');

  const handleChange = (event) => {
    setText(event.target.value);
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