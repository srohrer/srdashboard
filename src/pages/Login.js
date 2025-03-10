import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Typography, Paper, Container } from '@mui/material';
import { useUser } from '../contexts/UserContext';

const Login = () => {
  const [name, setName] = useState('');
  const navigate = useNavigate();
  const { setUsername } = useUser();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Save the username to context
    setUsername(name || 'Guest');
    // Navigate to dashboard
    navigate('/dashboard');
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            width: '100%' 
          }}
        >
          <Typography component="h1" variant="h5">
            Welcome
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              label="Your Name"
              name="name"
              autoComplete="name"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Enter
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login; 