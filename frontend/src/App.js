import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Typography } from '@mui/material';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Layout from './layouts/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import DieselLogs from './pages/DieselLogs';
import Dispatch from './pages/Dispatch';
import Expenses from './pages/Expenses';
import Maintenance from './pages/Maintenance';
import Labour from './pages/Labour';
import Documents from './pages/Documents';
import PurchaseOrders from './pages/PurchaseOrders';
import Inventory from './pages/Inventory';
import Sites from './pages/Sites';
import Blasting from './pages/Blasting';
import Users from './pages/Users';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2563eb', // blue-600
      light: '#eff6ff', // blue-50
      dark: '#1e40af',  // blue-800
    },
    secondary: {
      main: '#475569',  // slate-600
    },
    background: {
      default: '#f8fafc', // slate-50
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 600,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="purchase-orders" element={<PurchaseOrders />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="sites" element={<Sites />} />
              <Route path="blasting" element={<Blasting />} />
              <Route path="users" element={<Users />} />
              <Route path="vehicles" element={<Vehicles />} />
              <Route path="diesel" element={<DieselLogs />} />
              <Route path="dispatch" element={<Dispatch />} />
              <Route path="expenses" element={<Expenses />} />
              <Route path="maintenance" element={<Maintenance />} />
              <Route path="labour" element={<Labour />} />
              <Route path="documents" element={<Documents />} />
              <Route path="*" element={<Box sx={{ p: 3 }}><Typography variant="h4">404 - Not Found</Typography></Box>} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

// Temp placeholder Box/Typography for the * route fallback

export default App;
