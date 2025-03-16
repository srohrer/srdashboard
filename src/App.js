import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { UserProvider } from './contexts/UserContext';
import { Box } from '@mui/material';
import React, { useRef } from 'react';

// Create a wrapper for Dashboard that provides the resetDashboard method
const DashboardWithLayout = () => {
  const dashboardRef = useRef(null);
  
  return (
    <Layout dashboardRef={dashboardRef}>
      <Dashboard ref={dashboardRef} />
    </Layout>
  );
};

function App() {
  return (
    <Box sx={{ height: '100vh', overflow: 'hidden' }}>
      <ThemeProvider>
        <UserProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<DashboardWithLayout />} />
              <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>
          </Router>
        </UserProvider>
      </ThemeProvider>
    </Box>
  );
}

export default App;
