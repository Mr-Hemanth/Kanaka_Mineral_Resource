import React, { useState, useContext } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
    Box,
    Drawer,
    AppBar,
    Toolbar,
    List,
    Typography,
    Divider,
    IconButton,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Avatar,
    Menu,
    MenuItem,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import {
    Menu as MenuIcon,
    Dashboard,
    LocalShipping,
    LocalGasStation,
    PrecisionManufacturing,
    ReceiptLong,
    Engineering,
    People,
    Description,
    Logout,
    ShoppingCart,
    Inventory as InventoryIcon,
    Business as BusinessIcon,
    Gavel as BlastIcon,
    AdminPanelSettings as AdminPanelIcon,
} from '@mui/icons-material';

const drawerWidth = 260;

const Layout = () => {
    const { user, logout } = useContext(AuthContext);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const navigate = useNavigate();
    const location = useLocation();

    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        handleMenuClose();
        logout();
        navigate('/login');
    };

    const menuItems = [
        { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard', roles: ['ADMIN', 'SUPERVISOR', 'OWNER'] },
        { text: 'Purchase Orders', icon: <ShoppingCart />, path: '/purchase-orders', roles: ['ADMIN', 'SUPERVISOR', 'OWNER'] },
        { text: 'Sites', icon: <BusinessIcon />, path: '/sites', roles: ['ADMIN', 'SUPERVISOR', 'OWNER'] },
        { text: 'Inventory', icon: <InventoryIcon />, path: '/inventory', roles: ['ADMIN', 'SUPERVISOR', 'OWNER'] },
        { text: 'Blasting', icon: <BlastIcon />, path: '/blasting', roles: ['ADMIN', 'SUPERVISOR', 'OWNER'] },
        { text: 'Users', icon: <AdminPanelIcon />, path: '/users', roles: ['ADMIN'] },
        { text: 'Vehicles', icon: <LocalShipping />, path: '/vehicles', roles: ['ADMIN', 'SUPERVISOR', 'OWNER'] },
        { text: 'Diesel Logs', icon: <LocalGasStation />, path: '/diesel', roles: ['ADMIN', 'SUPERVISOR', 'OWNER'] },
        { text: 'Dispatch', icon: <PrecisionManufacturing />, path: '/dispatch', roles: ['ADMIN', 'SUPERVISOR', 'OWNER'] },
        { text: 'Expenses', icon: <ReceiptLong />, path: '/expenses', roles: ['ADMIN', 'SUPERVISOR', 'OWNER'] },
        { text: 'Maintenance', icon: <Engineering />, path: '/maintenance', roles: ['ADMIN', 'SUPERVISOR', 'OWNER'] },
        { text: 'Labour', icon: <People />, path: '/labour', roles: ['ADMIN', 'SUPERVISOR'] },
        { text: 'Documents', icon: <Description />, path: '/documents', roles: ['ADMIN', 'OWNER', 'SUPERVISOR'] },
    ];

    const drawer = (
        <div>
            <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1e293b', color: 'white' }}>
                <Typography variant="h6" noWrap component="div" fontWeight="bold">
                    Kanaka Minerals
                </Typography>
            </Toolbar>
            <Divider />
            <List sx={{ pt: 2 }}>
                {menuItems.filter(item => item.roles.includes(user?.role)).map((item) => (
                    <ListItem key={item.text} disablePadding sx={{ mb: 1, px: 2 }}>
                        <ListItemButton
                            selected={location.pathname.startsWith(item.path)}
                            onClick={() => { navigate(item.path); if (isMobile) handleDrawerToggle(); }}
                            sx={{
                                borderRadius: 2,
                                '&.Mui-selected': {
                                    backgroundColor: 'primary.light',
                                    color: 'primary.main',
                                    '& .MuiListItemIcon-root': {
                                        color: 'primary.main',
                                    },
                                },
                                '&:hover': {
                                    backgroundColor: 'action.hover',
                                }
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 40, color: location.pathname.startsWith(item.path) ? 'primary.main' : 'inherit' }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: location.pathname.startsWith(item.path) ? 600 : 400 }} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </div>
    );

    return (
        <Box sx={{ display: 'flex', height: '100vh', backgroundColor: '#f8fafc' }}>
            <AppBar
                position="fixed"
                elevation={0}
                sx={{
                    width: { md: `calc(100% - ${drawerWidth}px)` },
                    ml: { md: `${drawerWidth}px` },
                    backgroundColor: 'white',
                    borderBottom: '1px solid #e2e8f0',
                    color: 'text.primary'
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { md: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Box sx={{ flexGrow: 1 }} />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
                            <Typography variant="subtitle2" fontWeight="bold" sx={{ lineHeight: 1.2 }}>
                                {user?.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {user?.role}
                            </Typography>
                        </Box>
                        <IconButton onClick={handleMenuOpen} sx={{ p: 0 }}>
                            <Avatar sx={{ bgcolor: 'secondary.main' }}>
                                {user?.name?.charAt(0)}
                            </Avatar>
                        </IconButton>
                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleMenuClose}
                            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                        >
                            <MenuItem onClick={handleLogout}>
                                <ListItemIcon>
                                    <Logout fontSize="small" />
                                </ListItemIcon>
                                Logout
                            </MenuItem>
                        </Menu>
                    </Box>
                </Toolbar>
            </AppBar>

            <Box
                component="nav"
                sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
            >
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: 'block', md: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                >
                    {drawer}
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', md: 'block' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: '1px solid #e2e8f0' },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>

            <Box
                component="main"
                sx={{ flexGrow: 1, p: 3, width: { md: `calc(100% - ${drawerWidth}px)` }, mt: 8, overflow: 'auto' }}
            >
                <Outlet />
            </Box>
        </Box>
    );
};

export default Layout;
