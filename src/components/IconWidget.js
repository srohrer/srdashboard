import React, { useState, useEffect } from 'react';
import { Box, Menu, MenuItem, IconButton } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import StarIcon from '@mui/icons-material/Star';
import FavoriteIcon from '@mui/icons-material/Favorite';
import BoltIcon from '@mui/icons-material/Bolt';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import CelebrationIcon from '@mui/icons-material/Celebration';

/**
 * A widget that displays a large selectable icon
 * @param {Object} props - Component props
 * @param {Object} userContext - User context passed from Widget wrapper
 * @param {Object} themeContext - Theme context passed from Widget wrapper
 * @param {string} iconName - Selected icon name
 * @param {function} onContentChange - Callback when icon changes
 * @param {string} widgetId - ID of the widget
 */
const IconWidget = ({ userContext, themeContext, content = 'ArrowUpward', onContentChange, widgetId }) => {
  const [selectedIcon, setSelectedIcon] = useState(content);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  // Update local state when content prop changes
  useEffect(() => {
    setSelectedIcon(content);
  }, [content]);

  // Icon mapping
  const iconMap = {
    ArrowUpward: <ArrowUpwardIcon />,
    ArrowDownward: <ArrowDownwardIcon />,
    ArrowBack: <ArrowBackIcon />,
    ArrowForward: <ArrowForwardIcon />,
    EmojiEmotions: <EmojiEmotionsIcon />,
    Star: <StarIcon />,
    Favorite: <FavoriteIcon />,
    Bolt: <BoltIcon />,
    Fire: <LocalFireDepartmentIcon />,
    Celebration: <CelebrationIcon />
  };

  const handleClick = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleIconSelect = (iconName) => {
    setSelectedIcon(iconName);
    handleClose();
    
    // Notify parent component about the content change
    if (onContentChange) {
      onContentChange(widgetId, iconName);
    }
  };

  // This function is critical to prevent drag events from interfering with icon interactions
  const preventDragPropagation = (e) => {
    e.stopPropagation();
  };
  
  // Get the current icon component based on selection
  const CurrentIcon = ({ iconName }) => {
    const IconComponent = iconMap[iconName] || iconMap.ArrowUpward;
    return React.cloneElement(IconComponent, { 
      sx: { fontSize: 50 }, 
      color: "primary" 
    });
  };
  
  return (
    <Box 
      sx={{ 
        height: '100%',
        width: 'auto',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
      }}
    >
      <IconButton 
        onClick={handleClick}
        disableRipple
        disableTouchRipple
        sx={{ 
          p: 0,
          m: 0,
          minWidth: 'auto',
          minHeight: 'auto',
          width: 'auto',
          height: 'auto',
          borderRadius: 0,
          '&:hover': {
            backgroundColor: 'transparent'
          }
        }}
        onMouseDown={preventDragPropagation}
      >
        <CurrentIcon iconName={selectedIcon} />
      </IconButton>
      
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={preventDragPropagation}
      >
        {Object.keys(iconMap).map((iconName) => (
          <MenuItem 
            key={iconName} 
            onClick={() => handleIconSelect(iconName)}
            selected={iconName === selectedIcon}
            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
          >
            {React.cloneElement(iconMap[iconName], { fontSize: 'small' })}
            {iconName}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

export default IconWidget; 