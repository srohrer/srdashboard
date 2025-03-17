import React, { useState, useEffect, useRef } from 'react';
import { Box, TextField, Button, CircularProgress, Typography } from '@mui/material';
import AnalyticsIcon from '@mui/icons-material/Analytics';
// Import TensorFlow.js and ensure it's loaded before the toxicity model
import * as tf from '@tensorflow/tfjs';
import * as toxicity from '@tensorflow-models/toxicity';

/**
 * A widget that provides sentiment analysis functionality with a textbox
 * @param {Object} props - Component props
 * @param {Object} userContext - User context passed from Widget wrapper
 * @param {Object} themeContext - Theme context passed from Widget wrapper
 * @param {string} content - Content for the textbox
 * @param {function} onContentChange - Callback when content changes
 * @param {string} widgetId - ID of the widget
 */
const SentimentAnalysisWidget = ({ userContext, themeContext, content = '', onContentChange, widgetId }) => {
  const [text, setText] = useState(content);
  const [sentiment, setSentiment] = useState(null); // null, positive, neutral, negative
  const [analyzing, setAnalyzing] = useState(false);
  const [model, setModel] = useState(null);
  const [modelLoading, setModelLoading] = useState(false);
  const [modelError, setModelError] = useState(null);
  
  // Load the model when component mounts
  useEffect(() => {
    let isMounted = true;
    
    const loadModel = async () => {
      if (!isMounted) return;
      
      try {
        setModelLoading(true);
        setModelError(null);
        
        // First ensure TensorFlow.js is properly initialized
        await tf.ready();
        console.log('TensorFlow.js is ready');
        
        // Load the toxicity model from TensorFlow.js with a 0.9 confidence threshold
        // Reference: https://github.com/tensorflow/tfjs-models/tree/master/toxicity
        const loadedModel = await toxicity.load(0.9);
        
        // Perform a test prediction to ensure the model works
        if (loadedModel) {
          try {
            // Simple test with a short text
            const testResults = await loadedModel.classify(['Test message']);
            console.log('Model test successful:', testResults);
          } catch (testError) {
            console.error('Model test failed:', testError);
            throw new Error('Model loaded but failed test prediction');
          }
        }
        
        if (isMounted) {
          setModel(loadedModel);
          setModelLoading(false);
        }
      } catch (error) {
        console.error('Error loading sentiment model:', error);
        if (isMounted) {
          setModelError(error.message || 'Failed to load sentiment model');
          setModelLoading(false);
        }
      }
    };
    
    loadModel();
    
    // Cleanup
    return () => {
      isMounted = false;
    };
  }, []);
  
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
  
  // Get emoji based on sentiment
  const getSentimentEmoji = () => {
    if (sentiment === null) return '';
    if (sentiment === 'positive') return '😃';
    if (sentiment === 'neutral') return '😐';
    if (sentiment === 'negative') return '😔';
    return '';
  };
  
  // Implement actual sentiment analysis
  const handleAnalyze = async () => {
    if (!text.trim() || !model) return;
    
    try {
      setAnalyzing(true);
      
      // Ensure text length is not too short for analysis
      const inputText = text.trim();
      if (inputText.length < 2) {
        throw new Error('Text is too short for analysis');
      }
      
      // Analyze the text using the toxicity model
      const predictions = await model.classify([inputText]);
      
      // Check if we have valid predictions
      if (!predictions || !predictions[0] || !predictions[0].results || !predictions[0].results[0]) {
        throw new Error('Invalid prediction results');
      }
      
      // predictions[0] contains toxicity results
      // probabilities[1] is the probability of being toxic
      const toxicityProbability = predictions[0].results[0].probabilities[1];
      
      // Determine sentiment based on toxicity score
      if (toxicityProbability < 0.3) {
        setSentiment('positive');
      } else if (toxicityProbability < 0.6) {
        setSentiment('neutral');
      } else {
        setSentiment('negative');
      }
      
      setAnalyzing(false);
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      // Reset so user can try again
      setAnalyzing(false);
    }
  };
  
  return (
    <Box 
      sx={{ 
        height: '100%', 
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Textbox and button container */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        height: '100%',
        gap: 1
      }}>
        {/* Editable textbox */}
        <TextField
          multiline
          fullWidth
          variant="outlined"
          value={text}
          onChange={handleChange}
          placeholder="Enter text for sentiment analysis..."
          sx={{
            flexGrow: 1,
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
        
        {/* Button row with sentiment emoji and status */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: 2
        }}>
          {/* Error message */}
          {modelError && (
            <Typography variant="caption" color="error">
              {modelError}
            </Typography>
          )}
          
          {/* Model loading indicator */}
          {modelLoading && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={20} />
              <Typography variant="caption">Loading model...</Typography>
            </Box>
          )}
          
          {/* Sentiment emoji */}
          {sentiment && (
            <Typography
              variant="h4"
              sx={{
                lineHeight: 1,
                transition: 'all 0.3s ease',
                animation: 'fadeIn 0.5s'
              }}
            >
              {getSentimentEmoji()}
            </Typography>
          )}
          
          {/* Analyze button */}
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleAnalyze}
            startIcon={<AnalyticsIcon />}
            disabled={modelLoading || analyzing || !text.trim() || modelError}
          >
            {analyzing ? 'Analyzing...' : 'Analyze Sentiment'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default SentimentAnalysisWidget; 