import React from 'react';
import { Typography, Box, Divider } from '@mui/material';

/**
 * An example widget that demonstrates how to use the UserContext and ThemeContext
 * passed from the Widget wrapper component
 * @param {Object} props - Component props
 * @param {Object} userContext - User context passed from Widget wrapper
 * @param {Object} themeContext - Theme context passed from Widget wrapper
 * @param {string} widgetId - ID of the widget
 */
const ExampleWidget = ({ userContext, themeContext, widgetId }) => {
  // Destructure the values from contexts
  const { username } = userContext;
  const { currentTheme } = themeContext;
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Widget #{widgetId}
      </Typography>
      <Divider sx={{ my: 1 }} />
      <Typography variant="body1" gutterBottom>
        Hello {username}! This is an example widget.
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Current theme: {currentTheme}
      </Typography>
      <Typography variant="caption" display="block" sx={{ mt: 2, color: 'text.disabled' }}>
        Last updated: {new Date().toLocaleString()}
      </Typography>
    </Box>
  );
};

export default ExampleWidget; 