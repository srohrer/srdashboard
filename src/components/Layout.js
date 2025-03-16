import React from 'react';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, CssBaseline, AppBar, Toolbar, Typography, IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Tooltip, Button } from '@mui/material';
import { Menu as MuiMenu } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useTheme } from '../contexts/ThemeContext';
import WidgetToolkit from './WidgetToolkit';
import PaletteIcon from '@mui/icons-material/Palette';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import BlueIcon from '@mui/icons-material/BlurOn';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import LogoutIcon from '@mui/icons-material/Logout';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import { useUser } from '../contexts/UserContext';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  pointerWithin,
  defaultDropAnimationSideEffects,
  DragOverlay
} from '@dnd-kit/core';
import Widget from './Widget';
import { renderDragPreview, getWidgetWidth } from '../utils/widgetUtils';

// Updated Main component to take full width regardless of sidebar state
const Main = styled('main')(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  width: '100%',
  height: 'calc(100vh - 64px)', // Ensure main content is contained within viewport height
  marginTop: 64, // AppBar height
  overflow: 'hidden', // Prevent scrollbars at this level
}));

// Create a styled component for the right sidebar container
const RightSidebarContainer = styled('div', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    position: 'fixed',
    top: 64, // AppBar height
    right: 0,
    height: 'calc(100vh - 64px)', // Ensure sidebar is contained within viewport height
    zIndex: theme.zIndex.drawer,
    width: 240, // Sidebar width
    transform: open ? 'translateX(0)' : 'translateX(100%)',
    transition: theme.transitions.create('transform', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    overflow: 'hidden', // Prevent scrollbars at this level
  }),
);

// Define custom drop animation
const customDropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: '0.5',
      },
    },
  }),
};

const Layout = ({ children, dashboardRef }) => {
  // No longer create the ref here, it comes from the parent
  const [open, setOpen] = useState(false); // Default to closed for mobile-friendly experience
  const { currentTheme, setTheme, themeNames } = useTheme();
  const [themeMenuAnchor, setThemeMenuAnchor] = useState(null);
  const { username, setUsername } = useUser();
  const navigate = useNavigate();
  
  // State for tracking active drag item and its type
  const [activeId, setActiveId] = useState(null);
  const [activeDragType, setActiveDragType] = useState(null);
  
  // Track drag offsets for precise overlay positioning
  const [dragOffsets, setDragOffsets] = useState({ x: 0, y: 0 });
  
  // Set up DndContext sensors with optimized settings
  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Use minimal activation constraints to respond immediately to drag events
      activationConstraint: {
        // No delay, minimal distance required
        delay: 0,
        tolerance: 1,
      },
    }),
    useSensor(KeyboardSensor)
  );
  
  // Listen for widget drag start events to track offsets
  useEffect(() => {
    const handleWidgetDragStart = (event) => {
      if (event.detail) {
        setDragOffsets({ 
          x: event.detail.offsetX || 0, 
          y: event.detail.offsetY || 0 
        });
      }
    };
    
    document.addEventListener('widget-drag-start', handleWidgetDragStart);
    
    return () => {
      document.removeEventListener('widget-drag-start', handleWidgetDragStart);
    };
  }, []);
  
  const toggleDrawer = () => {
    setOpen(!open);
  };

  const handleThemeMenuOpen = (event) => {
    setThemeMenuAnchor(event.currentTarget);
  };

  const handleThemeMenuClose = () => {
    setThemeMenuAnchor(null);
  };

  const handleThemeChange = (themeName) => {
    setTheme(themeName);
    handleThemeMenuClose();
  };

  // DnD event handlers
  const handleDragStart = (event) => {
    const { active } = event;
    setActiveId(active.id);
    
    // If this is from the toolkit, extract the widget type
    if (active.id.toString().startsWith('toolkit-')) {
      const widgetType = active.data.current?.type || 'example';
      setActiveDragType(widgetType);
    }
  };
  
  const handleDragMove = (event) => {
    const { active } = event;
    setActiveId(active.id);
    
    // Dispatch custom event for Dashboard to handle
    const customEvent = new CustomEvent('dnd-drag-move', {
      detail: event
    });
    document.dispatchEvent(customEvent);
  };
  
  const handleDragEnd = (event) => {
    // Dispatch custom event for Dashboard to handle
    const customEvent = new CustomEvent('dnd-drag-end', {
      detail: event
    });
    document.dispatchEvent(customEvent);
    
    setActiveId(null);
    setActiveDragType(null);
    // Reset drag offsets after the drop
    setDragOffsets({ x: 0, y: 0 });
  };

  const getThemeIcon = (themeName) => {
    switch(themeName) {
      case 'light':
        return <Brightness7Icon />;
      case 'dark':
        return <Brightness4Icon />;
      case 'blue':
        return <BlueIcon />;
      default:
        return <PaletteIcon />;
    }
  };

  const themeSelector = (
    <>
      <Tooltip title="Change theme">
        <IconButton color="inherit" onClick={handleThemeMenuOpen} edge="end">
          <PaletteIcon />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={themeMenuAnchor}
        open={Boolean(themeMenuAnchor)}
        onClose={handleThemeMenuClose}
      >
        {themeNames.map((themeName) => (
          <MenuItem 
            key={themeName}
            selected={themeName === currentTheme}
            onClick={() => handleThemeChange(themeName)}
          >
            <ListItemIcon>
              {getThemeIcon(themeName)}
            </ListItemIcon>
            <ListItemText primary={themeName.charAt(0).toUpperCase() + themeName.slice(1)} />
          </MenuItem>
        ))}
      </Menu>
    </>
  );

  const handleLogout = () => {
    setUsername('');
    // Navigate to login screen
    navigate('/login');
  };

  // Handler for resetting dashboard
  const handleResetDashboard = () => {
    if (dashboardRef.current) {
      dashboardRef.current.resetDashboard();
    }
  };

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
      // Add smooth drag overlay options
      autoScroll={{
        enabled: true,
        speed: 10,
        threshold: {
          x: 0.2,
          y: 0.2
        }
      }}
      // Optimization for drag performance
      measuring={{
        droppable: {
          strategy: 'always',
        },
      }}
    >
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
          <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
            {/* Left section with logout button and reset dashboard button */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button 
                color="inherit" 
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
              >
                Log out
              </Button>
              <Button
                color="inherit"
                startIcon={<DeleteSweepIcon />}
                onClick={handleResetDashboard}
              >
                Empty Dashboard
              </Button>
            </Box>
            
            {/* Center section with username */}
            <Typography variant="h6" component="div">
              {username || 'Guest'}
            </Typography>
            
            {/* Right section with theme selector and sidebar toggle */}
            <Box sx={{ display: 'flex' }}>
              {themeSelector}
              <Tooltip title="Toggle sidebar">
                <IconButton 
                  color="inherit" 
                  onClick={toggleDrawer} 
                  edge="end"
                  sx={{ ml: 1 }}
                >
                  <MenuOpenIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Toolbar>
        </AppBar>
        
        {/* Main content that takes full width */}
        <Main>
          {/* Simply render children, we'll handle the ref directly in App.js */}
          {children}
        </Main>
        
        {/* Right sidebar as overlay */}
        <RightSidebarContainer open={open}>
          <WidgetToolkit open={open} toggleDrawer={toggleDrawer} activeId={activeId} />
        </RightSidebarContainer>
        
        {/* Drag Overlay - shows a preview of the widget being dragged */}
        <DragOverlay 
          dropAnimation={customDropAnimation}
          // Adjust the position of the overlay based on the drag offsets
          adjustScale={false}
          modifiers={[
            ({ transform }) => {
              if (activeId?.toString().startsWith('toolkit-')) {
                return {
                  ...transform,
                  x: transform.x - dragOffsets.x,
                  y: transform.y - dragOffsets.y,
                };
              }
              return transform;
            }
          ]}
        >
          {activeId && activeId.toString().startsWith('toolkit-') && (
            <Box sx={{ 
              width: getWidgetWidth(activeDragType), // Use same width function as actual widgets
              pointerEvents: 'none',
              opacity: 0.9,
              bgcolor: 'background.paper',
              borderRadius: 2,
              boxShadow: 6,
              overflow: 'hidden',
              '& .MuiPaper-root': {
                height: '100%',
                boxSizing: 'border-box'
              }
            }}>
              <Widget widgetType={activeDragType}>
                {renderDragPreview(activeDragType)}
              </Widget>
            </Box>
          )}
        </DragOverlay>
      </Box>
    </DndContext>
  );
};

export default Layout; 