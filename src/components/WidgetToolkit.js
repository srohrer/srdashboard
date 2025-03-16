import React, { useRef, useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Divider, 
  IconButton, 
  Grid,
  Paper,
  Tooltip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ChevronRight from '@mui/icons-material/ChevronRight';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import ImageIcon from '@mui/icons-material/Image';
import WidgetsIcon from '@mui/icons-material/Widgets';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import ChecklistIcon from '@mui/icons-material/Checklist';
import { useDraggable } from '@dnd-kit/core';

// Styled component for the drawer header
const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-start',
}));

// Styled component for the content area with overflow control
const ContentArea = styled('div')({
  flexGrow: 1,
  overflowY: 'auto',
  overflowX: 'hidden',
  display: 'flex',
  flexDirection: 'column',
});

// Component for a draggable widget preview item
const WidgetPreview = ({ id, icon, label, type, isActive }) => {
  // Reference to the element
  const elementRef = useRef(null);
  
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `toolkit-${id}`,
    data: {
      type: type, // Store the widget type
      fromToolkit: true // Flag to indicate this is coming from toolkit
    }
  });
  
  // Calculate if this widget is being dragged
  const isBeingDragged = isDragging || isActive;
  
  // Create a combined ref function
  const setRefs = (node) => {
    // Set ref for our local reference
    elementRef.current = node;
    // Set ref for the useDraggable hook
    setNodeRef(node);
  };

  // Create a mousedown handler to track click position
  const handleMouseDown = (e) => {
    if (elementRef.current) {
      // Get the bounding rectangle of the element
      const rect = elementRef.current.getBoundingClientRect();
      
      // Calculate the click offset relative to the element's top-left corner
      const offsetX = e.clientX - rect.left;
      const offsetY = e.clientY - rect.top;
      
      // Store these offsets in a custom event that will be dispatched
      const event = new CustomEvent('widget-drag-start', {
        detail: {
          widgetId: id,
          offsetX,
          offsetY
        }
      });
      
      document.dispatchEvent(event);
    }
  };

  // Use minimal style when dragging since we're using DragOverlay for the preview
  const style = {};
  
  if (transform && isDragging) {
    // Only apply position, make this element "disappear" during drag
    // since the DragOverlay will show the preview
    style.opacity = 0.1;
    style.transform = `translate3d(${transform.x}px, ${transform.y}px, 0)`;
    style.zIndex = 10;
  }

  // Combine the original listeners with our custom mousedown handler
  const combinedListeners = {
    ...listeners,
    onMouseDown: (e) => {
      // Call our custom handler first
      handleMouseDown(e);
      // Then call the original onMouseDown if it exists
      if (listeners.onMouseDown) {
        listeners.onMouseDown(e);
      }
    }
  };

  return (
    <Paper
      ref={setRefs}
      elevation={isBeingDragged ? 4 : 2}
      sx={{
        width: '100%',
        height: 90,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: isBeingDragged ? 'grabbing' : 'grab', // Use grab cursor consistently
        borderRadius: 1,
        
        // Only apply transitions when NOT dragging
        transition: isDragging ? 'none' : 'transform 0.2s, box-shadow 0.2s',
        
        // Remove hover effects during drag
        '&:hover': isDragging ? {} : {
          boxShadow: 3,
          transform: 'scale(1.02)'
        },
        
        // Apply additional styles for dragging state
        ...(isBeingDragged && !isDragging && {
          boxShadow: 6,
          opacity: 0.8,
        }),
        ...style
      }}
      {...attributes}
      {...combinedListeners}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
        <Typography variant="caption" sx={{ mt: 1, textAlign: 'center' }}>
          {label}
        </Typography>
      </Box>
    </Paper>
  );
};

const WidgetToolkit = ({ open, toggleDrawer, activeId }) => {
  // State to track the current section
  const [currentSection, setCurrentSection] = useState('main');
  
  // Define sections structure
  const sections = {
    basic: {
      title: 'Basic',
      icon: <WidgetsIcon />,
      widgets: [
        { 
          id: 'textbox', 
          type: 'textbox',
          label: 'Text Box', 
          icon: <TextFieldsIcon fontSize="large" color="primary" /> 
        },
        { 
          id: 'icon', 
          type: 'icon',
          label: 'Icon', 
          icon: <EmojiEmotionsIcon fontSize="large" color="primary" /> 
        },
        { 
          id: 'todo', 
          type: 'todo',
          label: 'Todo List', 
          icon: <ChecklistIcon fontSize="large" color="primary" /> 
        },
        { 
          id: 'example', 
          type: 'example',
          label: 'Example', 
          icon: <WidgetsIcon fontSize="large" color="secondary" /> 
        }
      ]
    }
  };
  
  // Handle section navigation
  const navigateToSection = (sectionKey) => {
    setCurrentSection(sectionKey);
  };
  
  // Handle back navigation
  const navigateBack = () => {
    setCurrentSection('main');
  };
  
  // Render the appropriate content based on the current section
  const renderSectionContent = () => {
    // Main section showing the list of available sections
    if (currentSection === 'main') {
      return (
        <Box sx={{ p: 2, flexShrink: 0 }}>
          <List>
            {Object.keys(sections).map((sectionKey) => (
              <ListItem 
                disablePadding 
                key={sectionKey}
              >
                <ListItemButton 
                  onClick={() => navigateToSection(sectionKey)}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ListItemIcon>
                      {sections[sectionKey].icon}
                    </ListItemIcon>
                    <ListItemText primary={sections[sectionKey].title} />
                  </Box>
                  <ChevronRight color="action" fontSize="small" />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      );
    } 
    // Section-specific view showing widgets in that section
    else if (sections[currentSection]) {
      const section = sections[currentSection];
      return (
        <Box sx={{ p: 2, flexShrink: 0 }}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {section.widgets.map((widget) => (
              <Grid item xs={6} key={widget.id} sx={{ mb: 2 }}>
                <WidgetPreview
                  id={widget.id}
                  icon={widget.icon}
                  label={widget.label}
                  type={widget.type}
                  isActive={activeId === `toolkit-${widget.id}`}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      );
    }
    // Fallback view
    return null;
  };

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        boxShadow: 3,
        overflow: 'hidden', // Prevent any overflow from causing scrollbars
      }}
    >
      <DrawerHeader>
        {currentSection !== 'main' ? (
          <>
            <IconButton onClick={navigateBack}>
              <ArrowBackIcon />
            </IconButton>
            <Typography 
              variant="h6" 
              sx={{ 
                flexGrow: 1, 
                textAlign: 'center',
                marginRight: '48px' // Offset for back button to ensure true center
              }}
            >
              {sections[currentSection]?.title || 'Toolbox'}
            </Typography>
          </>
        ) : (
          <Typography variant="h6" sx={{ flexGrow: 1, textAlign: 'center' }}>
            Toolbox
          </Typography>
        )}
      </DrawerHeader>
      <Divider />
      
      <ContentArea>
        {renderSectionContent()}
        
        <Box sx={{ marginTop: 'auto', p: 2, flexShrink: 0 }}>
          <Typography variant="caption" color="text.secondary">
            Tip: Drag widgets out to delete them
          </Typography>
        </Box>
      </ContentArea>
    </Box>
  );
};

export default WidgetToolkit; 