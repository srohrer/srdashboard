import { useState } from 'react';
import { styled } from '@mui/material/styles';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, IconButton, Divider, Typography, Box } from '@mui/material';
import { Menu, Dashboard, Person, Settings, ChevronRight } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-start',
}));

const Sidebar = ({ open, toggleDrawer }) => {
  const navigate = useNavigate();
  
  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { text: 'Profile', icon: <Person />, path: '/profile' },
    { text: 'Settings', icon: <Settings />, path: '/settings' },
  ];

  return (
    <Drawer
      variant="persistent"
      anchor="right"
      open={open}
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
        },
      }}
    >
      <DrawerHeader>
        <IconButton onClick={toggleDrawer}>
          <ChevronRight />
        </IconButton>
        <Typography variant="h6" sx={{ flexGrow: 1, marginLeft: 2 }}>
          Dashboard
        </Typography>
      </DrawerHeader>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem 
            button 
            key={item.text}
            onClick={() => navigate(item.path)}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
      <Box sx={{ marginTop: 'auto', p: 2 }}>
        <Typography variant="caption" color="text.secondary">
          Widgets can be dragged from here
        </Typography>
        <Divider sx={{ my: 1 }} />
        {/* Widget placeholders will go here */}
      </Box>
    </Drawer>
  );
};

export default Sidebar; 