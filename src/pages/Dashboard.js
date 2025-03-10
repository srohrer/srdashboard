import { Box, Typography, Paper, Grid } from '@mui/material';

const Dashboard = () => {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body1" paragraph>
        Drag and drop widgets from the sidebar to start building your dashboard.
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 240,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'background.paper',
            }}
          >
            <Typography variant="h6" color="text.secondary">
              Drop widgets here
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 