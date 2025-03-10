import React from 'react';
import { Typography, Box } from '@mui/material';

/**
 * An example widget that demonstrates how to use the UserContext and ThemeContext
 * passed from the Widget wrapper component
 */
const ExampleWidget = ({ userContext, themeContext }) => {
  // Destructure the values from contexts
  const { username } = userContext;
  const { currentTheme } = themeContext;
  
  return (
    <Box>
      <Typography variant="body1" gutterBottom>
        Hello {username}! This is an example widget.
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Current theme: {currentTheme}
      </Typography>
    </Box>
  );
};

export default ExampleWidget; 