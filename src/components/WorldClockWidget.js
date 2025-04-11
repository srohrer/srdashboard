import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';

/**
 * Default regions to display in the world clock widget
 */
const DEFAULT_REGIONS = [
  { id: 'local', name: 'Local Time', timezone: '' },
  { id: 'new-york', name: 'New York', timezone: 'America/New_York' },
  { id: 'london', name: 'London', timezone: 'Europe/London' },
  { id: 'paris', name: 'Paris', timezone: 'Europe/Paris' },
  { id: 'tokyo', name: 'Tokyo', timezone: 'Asia/Tokyo' },
  { id: 'sydney', name: 'Sydney', timezone: 'Australia/Sydney' },
  { id: 'dubai', name: 'Dubai', timezone: 'Asia/Dubai' },
  { id: 'sao-paulo', name: 'São Paulo', timezone: 'America/Sao_Paulo' },
  { id: 'lagos', name: 'Lagos', timezone: 'Africa/Lagos' }
];

/**
 * A single clock component for a particular region
 */
const Clock = ({ name, timezone }) => {
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const options = { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: true
      };
      
      const dateOptions = {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      };

      let timeString, dateString;
      
      if (timezone) {
        timeString = new Date().toLocaleTimeString('en-US', { ...options, timeZone: timezone });
        dateString = new Date().toLocaleDateString('en-US', { ...dateOptions, timeZone: timezone });
      } else {
        // Local time
        timeString = new Date().toLocaleTimeString('en-US', options);
        dateString = new Date().toLocaleDateString('en-US', dateOptions);
      }
      
      setTime(timeString);
      setDate(dateString);
    };

    // Update immediately
    updateTime();
    
    // Update once per minute instead of every second
    const intervalId = setInterval(updateTime, 60000);
    
    return () => clearInterval(intervalId);
  }, [timezone]);

  return (
    <Paper elevation={1} sx={{ p: 1.5, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
        {name}
      </Typography>
      <Typography variant="h6" sx={{ fontWeight: 'medium', textAlign: 'center', whiteSpace: 'nowrap' }}>
        {time}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {date}
      </Typography>
    </Paper>
  );
};

/**
 * World clock widget that displays time in multiple regions
 * @param {Object} props - Component props
 * @param {Object} userContext - User context passed from Widget wrapper
 * @param {Object} themeContext - Theme context passed from Widget wrapper
 * @param {string} content - Content for the clock regions in JSON format
 * @param {function} onContentChange - Callback when content changes
 * @param {string} widgetId - ID of the widget
 */
const WorldClockWidget = ({ userContext, themeContext, content = '', onContentChange, widgetId }) => {
  // Parse initial content or use default regions if parsing fails
  const parseContent = (contentStr) => {
    if (!contentStr) return DEFAULT_REGIONS;
    
    try {
      return JSON.parse(contentStr);
    } catch (e) {
      return DEFAULT_REGIONS;
    }
  };

  const [regions] = useState(parseContent(content));

  return (
    <Box sx={{ height: '100%', overflow: 'auto', p: 1 }}>
      <Typography variant="h6" gutterBottom sx={{ textAlign: 'center', mb: 2 }}>
        World Clock
      </Typography>
      
      <Grid container spacing={2}>
        {regions.map((region) => (
          <Grid item xs={6} sm={4} key={region.id}>
            <Clock 
              name={region.name} 
              timezone={region.timezone} 
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default WorldClockWidget; 