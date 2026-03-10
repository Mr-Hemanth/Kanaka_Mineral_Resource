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
import Workers from './pages/Workers';
import Documents from './pages/Documents';
import PurchaseOrders from './pages/PurchaseOrders';
import Inventory from './pages/Inventory';
import Machines from './pages/Machines';
import Blasting from './pages/Blasting';
import Users from './pages/Users';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#4338ca', // Indigo 700 - Premium feel
      light: '#6366f1',
      dark: '#312e81',
    },
    secondary: {
      main: '#0ea5e9', // Sky 500
      light: '#38bdf8',
      dark: '#0284c7',
    },
    success: { main: '#10b981', light: '#34d399', dark: '#059669' },
    warning: { main: '#f59e0b', light: '#fbbf24', dark: '#d97706' },
    error: { main: '#ef4444', light: '#f87171', dark: '#dc2626' },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#0f172a',
      secondary: '#475569',
    },
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700, letterSpacing: '-0.5px' },
    h5: { fontWeight: 700, letterSpacing: '-0.5px' },
    h6: { fontWeight: 600, letterSpacing: '-0.3px' },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 600, color: '#64748b' },
    body1: { letterSpacing: '0.2px' },
    button: { fontWeight: 600, textTransform: 'none' },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '8px',
          fontWeight: 600,
          boxShadow: 'none',
          padding: '8px 16px',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(67, 56, 202, 0.2)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #4338ca 0%, #3b82f6 100%)',
          color: 'white',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.03)',
        },
        elevation2: {
          boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.03)',
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0px 12px 28px rgba(0, 0, 0, 0.08)',
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: '10px',
          transition: 'box-shadow 0.2s ease-in-out, border-color 0.2s ease-in-out',
          '&.Mui-focused': {
            boxShadow: '0 0 0 3px rgba(67, 56, 202, 0.15)',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #f1f5f9',
          padding: '16px',
        },
        head: {
          fontWeight: 600,
          color: '#475569',
          backgroundColor: '#f8fafc',
          textTransform: 'uppercase',
          fontSize: '0.75rem',
          letterSpacing: '0.05em',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: '16px',
          boxShadow: '0px 20px 40px rgba(0, 0, 0, 0.1)',
        }
      }
    }
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
              <Route path="machines" element={<Machines />} />
              <Route path="blasting" element={<Blasting />} />
              <Route path="users" element={<Users />} />
              <Route path="vehicles" element={<Vehicles />} />
              <Route path="diesel" element={<DieselLogs />} />
              <Route path="dispatch" element={<Dispatch />} />
              <Route path="expenses" element={<Expenses />} />
              <Route path="maintenance" element={<Maintenance />} />
              <Route path="workers" element={<Workers />} />
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
