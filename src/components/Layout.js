import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, CssBaseline, AppBar, Toolbar, Typography, IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Tooltip, Button } from '@mui/material';
import { Menu as MuiMenu } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useTheme } from '../contexts/ThemeContext';
import Sidebar from './Sidebar';
import PaletteIcon from '@mui/icons-material/Palette';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import BlueIcon from '@mui/icons-material/BlurOn';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import LogoutIcon from '@mui/icons-material/Logout';
import { useUser } from '../contexts/UserContext';

// Updated Main component to take full width regardless of sidebar state
const Main = styled('main')(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  width: '100%',
  marginTop: 64, // AppBar height
}));

// Create a styled component for the right sidebar container
const RightSidebarContainer = styled('div', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    position: 'fixed',
    top: 64, // AppBar height
    right: 0,
    height: '100%',
    zIndex: theme.zIndex.drawer,
    width: 240, // Sidebar width
    transform: open ? 'translateX(0)' : 'translateX(100%)',
    transition: theme.transitions.create('transform', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  }),
);

const Layout = ({ children }) => {
  const [open, setOpen] = useState(false); // Default to closed for mobile-friendly experience
  const { currentTheme, setTheme, themeNames } = useTheme();
  const [themeMenuAnchor, setThemeMenuAnchor] = useState(null);
  const { username, setUsername } = useUser();
  const navigate = useNavigate();
  
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

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          {/* Left section with logout button */}
          <Box>
            <Button 
              color="inherit" 
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
            >
              Log out
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
        {children}
      </Main>
      
      {/* Right sidebar as overlay */}
      <RightSidebarContainer open={open}>
        <Sidebar open={open} toggleDrawer={toggleDrawer} />
      </RightSidebarContainer>
    </Box>
  );
};

export default Layout; 