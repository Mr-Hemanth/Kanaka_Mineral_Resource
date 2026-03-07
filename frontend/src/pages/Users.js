import React, { useEffect, useState } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, IconButton, Button, Dialog, DialogTitle,
    DialogContent, DialogActions, TextField, Grid, Chip, Alert,
    CircularProgress, Snackbar, MenuItem, Select, FormControl, InputLabel,
    Card, CardContent, Badge, Divider, Avatar,
} from '@mui/material';
import {
    Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
    Visibility as ViewIcon, People as PeopleIcon, AdminPanelSettings as AdminIcon,
    Security as SecurityIcon, WorkOutline as WorkIcon, LockReset as LockIcon,
} from '@mui/icons-material';
import api from '../utils/api';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // Dialogs
    const [userDialog, setUserDialog] = useState(false);
    const [passwordDialog, setPasswordDialog] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [viewDialog, setViewDialog] = useState(false);

    // Search & Filter
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });

    // Stats
    const [stats, setStats] = useState({ totalUsers: 0, adminCount: 0, supervisorCount: 0, ownerCount: 0 });

    // Forms
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'SUPERVISOR',
    });

    const [passwordForm, setPasswordForm] = useState({
        newPassword: '',
        confirmPassword: '',
    });

    useEffect(() => {
        fetchUsers();
        fetchStats();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pagination.page, search, roleFilter]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const params = {
                page: pagination.page,
                limit: pagination.limit,
                search,
                role: roleFilter,
            };
            const response = await api.get('/users', { params });
            setUsers(response.data.data);
            setPagination(prev => ({
                ...prev,
                total: response.data.total,
                totalPages: response.data.totalPages,
            }));
            setLoading(false);
        } catch (error) {
            showSnackbar('Failed to load users', 'error');
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await api.get('/users/stats');
            setStats(response.data);
        } catch (error) {
            console.error('Failed to load stats');
        }
    };

    const handleOpenDialog = (user = null) => {
        if (user) {
            setFormData({
                name: user.name,
                email: user.email,
                password: '',
                role: user.role,
            });
        } else {
            setFormData({
                name: '',
                email: '',
                password: '',
                role: 'SUPERVISOR',
            });
        }
        setSelectedUser(user);
        setUserDialog(true);
    };

    const handleSaveUser = async () => {
        try {
            if (!formData.name || !formData.email) {
                showSnackbar('Name and email are required', 'warning');
                return;
            }

            if (!selectedUser && !formData.password) {
                showSnackbar('Password is required for new user', 'warning');
                return;
            }

            if (selectedUser) {
                // Update existing user
                await api.put(`/users/${selectedUser.id}`, formData);
                showSnackbar('User updated successfully', 'success');
            } else {
                // Create new user
                await api.post('/users', formData);
                showSnackbar('User created successfully', 'success');
            }
            setUserDialog(false);
            fetchUsers();
            fetchStats();
        } catch (error) {
            showSnackbar(error.response?.data?.message || 'Operation failed', 'error');
        }
    };

    const handlePasswordChange = async () => {
        try {
            if (passwordForm.newPassword !== passwordForm.confirmPassword) {
                showSnackbar('Passwords do not match', 'error');
                return;
            }

            if (passwordForm.newPassword.length < 6) {
                showSnackbar('Password must be at least 6 characters', 'warning');
                return;
            }

            await api.post(`/users/${selectedUser.id}/change-password`, {
                newPassword: passwordForm.newPassword,
            });
            showSnackbar('Password changed successfully', 'success');
            setPasswordDialog(false);
            setPasswordForm({ newPassword: '', confirmPassword: '' });
        } catch (error) {
            showSnackbar(error.response?.data?.message || 'Failed to change password', 'error');
        }
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/users/${selectedUser.id}`);
            showSnackbar('User deleted successfully', 'success');
            setDeleteDialog(false);
            fetchUsers();
            fetchStats();
        } catch (error) {
            showSnackbar(error.response?.data?.message || 'Failed to delete', 'error');
        }
    };

    const handleView = (user) => {
        setSelectedUser(user);
        setViewDialog(true);
    };

    const showSnackbar = (message, severity) => {
        setSnackbar({ open: true, message, severity });
    };

    const getRoleIcon = (role) => {
        switch (role) {
            case 'ADMIN': return <AdminIcon fontSize="small" />;
            case 'OWNER': return <SecurityIcon fontSize="small" />;
            default: return <WorkIcon fontSize="small" />;
        }
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'ADMIN': return 'error';
            case 'OWNER': return 'success';
            default: return 'primary';
        }
    };

    return (
        <Box>
            {/* Page Header */}
            <Box sx={{
                mb: 4,
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                borderRadius: 3,
                p: 3,
                boxShadow: '0 10px 40px rgba(240, 147, 251, 0.3)',
                color: 'white'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{
                        bgcolor: 'rgba(255,255,255,0.2)',
                        width: 56,
                        height: 56,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                    }}>
                        <AdminIcon sx={{ fontSize: 32 }} />
                    </Avatar>
                    <Box>
                        <Typography variant="h4" fontWeight="bold" gutterBottom>
                            User Management
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            Manage system users, roles, and permissions
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card elevation={2}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography color="text.secondary" variant="body2">Total Users</Typography>
                                    <Typography variant="h4" fontWeight="bold">{stats.totalUsers}</Typography>
                                </Box>
                                <PeopleIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card elevation={2}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography color="text.secondary" variant="body2">Administrators</Typography>
                                    <Typography variant="h4" fontWeight="bold">{stats.adminCount}</Typography>
                                </Box>
                                <AdminIcon sx={{ fontSize: 48, opacity: 0.3, color: 'error.main' }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card elevation={2}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography color="text.secondary" variant="body2">Supervisors</Typography>
                                    <Typography variant="h4" fontWeight="bold">{stats.supervisorCount}</Typography>
                                </Box>
                                <WorkIcon sx={{ fontSize: 48, opacity: 0.3, color: 'primary.main' }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card elevation={2}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography color="text.secondary" variant="body2">Owners</Typography>
                                    <Typography variant="h4" fontWeight="bold">{stats.ownerCount}</Typography>
                                </Box>
                                <SecurityIcon sx={{ fontSize: 48, opacity: 0.3, color: 'success.main' }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Filters */}
            <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={4}>
                        <TextField
                            fullWidth
                            label="Search Users"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Name or email..."
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <FormControl fullWidth>
                            <InputLabel>Role Filter</InputLabel>
                            <Select
                                value={roleFilter}
                                label="Role Filter"
                                onChange={(e) => setRoleFilter(e.target.value)}
                            >
                                <MenuItem value="ALL">All Roles</MenuItem>
                                <MenuItem value="ADMIN">Admin</MenuItem>
                                <MenuItem value="SUPERVISOR">Supervisor</MenuItem>
                                <MenuItem value="OWNER">Owner</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Button
                            fullWidth
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => handleOpenDialog()}
                            sx={{ height: '56px' }}
                        >
                            Add New User
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {/* Users Table */}
            <Paper elevation={2} sx={{ borderRadius: 2 }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <TableContainer>
                        <Table>
                            <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Role</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Activity</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Created</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {users.map((user) => (
                                    <TableRow key={user.id} hover>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight="bold">{user.name}</Typography>
                                        </TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <Chip
                                                icon={getRoleIcon(user.role)}
                                                label={user.role}
                                                size="small"
                                                color={getRoleColor(user.role)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <Badge badgeContent={user._count.PurchaseOrders} color="primary">
                                                    <Typography variant="caption">POs</Typography>
                                                </Badge>
                                                <Badge badgeContent={user._count.DieselLogs} color="secondary">
                                                    <Typography variant="caption">Diesel</Typography>
                                                </Badge>
                                            </Box>
                                        </TableCell>
                                        <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                                        <TableCell align="right">
                                            <IconButton size="small" onClick={() => handleView(user)}>
                                                <ViewIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton size="small" onClick={() => handleOpenDialog(user)}>
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                color="info"
                                                onClick={() => { setSelectedUser(user); setPasswordDialog(true); }}
                                            >
                                                <LockIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() => { setSelectedUser(user); setDeleteDialog(true); }}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {users.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">
                                            <Alert severity="info">No users found</Alert>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>

            {/* Pagination */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                <Typography variant="body2">
                    Showing {users.length > 0 ? ((pagination.page - 1) * pagination.limit) + 1 : 0} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} users
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                        disabled={pagination.page === 1}
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    >
                        Previous
                    </Button>
                    <Button
                        disabled={pagination.page >= pagination.totalPages}
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    >
                        Next
                    </Button>
                </Box>
            </Box>

            {/* Create/Edit User Dialog */}
            <Dialog open={userDialog} onClose={() => setUserDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{selectedUser ? 'Edit' : 'Create'} User</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Full Name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Email Address"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </Grid>
                        {!selectedUser && (
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Password"
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required={!selectedUser}
                                    helperText="Minimum 6 characters"
                                />
                            </Grid>
                        )}
                        <Grid item xs={12}>
                            <FormControl fullWidth required>
                                <InputLabel>Role</InputLabel>
                                <Select
                                    value={formData.role}
                                    label="Role"
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                >
                                    <MenuItem value="ADMIN">Admin</MenuItem>
                                    <MenuItem value="SUPERVISOR">Supervisor</MenuItem>
                                    <MenuItem value="OWNER">Owner</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        {selectedUser && (
                            <Grid item xs={12}>
                                <Alert severity="info">
                                    Leave password blank to keep current password. Use "Change Password" button to update it.
                                </Alert>
                            </Grid>
                        )}
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setUserDialog(false)}>Cancel</Button>
                    <Button onClick={handleSaveUser} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>

            {/* Change Password Dialog */}
            <Dialog open={passwordDialog} onClose={() => setPasswordDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Change Password - {selectedUser?.name}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="New Password"
                                type="password"
                                value={passwordForm.newPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                helperText="Minimum 6 characters"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Confirm Password"
                                type="password"
                                value={passwordForm.confirmPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Alert severity="warning">
                                This will immediately change the user's password. They will need to use the new password to login.
                            </Alert>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPasswordDialog(false)}>Cancel</Button>
                    <Button onClick={handlePasswordChange} variant="contained" color="error">
                        Change Password
                    </Button>
                </DialogActions>
            </Dialog>

            {/* View User Details Dialog */}
            {viewDialog && selectedUser && (
                <Dialog open={viewDialog} onClose={() => setViewDialog(false)} maxWidth="md" fullWidth>
                    <DialogTitle>User Details - {selectedUser.name}</DialogTitle>
                    <DialogContent>
                        <Grid container spacing={3} sx={{ mt: 1 }}>
                            <Grid item xs={12}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Chip
                                        icon={getRoleIcon(selectedUser.role)}
                                        label={selectedUser.role}
                                        color={getRoleColor(selectedUser.role)}
                                    />
                                    <Typography variant="h6">{selectedUser.name}</Typography>
                                </Box>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="text.secondary">Email Address</Typography>
                                <Typography variant="body1">{selectedUser.email}</Typography>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="text.secondary">User ID</Typography>
                                <Typography variant="body1">#{selectedUser.id}</Typography>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="text.secondary">Account Created</Typography>
                                <Typography variant="body1">{new Date(selectedUser.createdAt).toLocaleString()}</Typography>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="text.secondary">Last Updated</Typography>
                                <Typography variant="body1">{new Date(selectedUser.updatedAt).toLocaleString()}</Typography>
                            </Grid>

                            <Grid item xs={12}>
                                <Divider sx={{ my: 1 }} />
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Activity Statistics</Typography>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="text.secondary">Purchase Orders Created</Typography>
                                <Typography variant="h5" color="primary">{selectedUser._count.PurchaseOrders}</Typography>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="text.secondary">Diesel Logs Recorded</Typography>
                                <Typography variant="h5" color="secondary">{selectedUser._count.DieselLogs}</Typography>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="text.secondary">Inventory Items Added</Typography>
                                <Typography variant="h5" color="success.main">{selectedUser._count.InventoryItems}</Typography>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="text.secondary">Activity Log Entries</Typography>
                                <Typography variant="h5">{selectedUser._count.ActivityLogs}</Typography>
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setViewDialog(false)}>Close</Button>
                    </DialogActions>
                </Dialog>
            )}

            {/* Delete Confirmation */}
            <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
                <DialogTitle>Confirm Delete User</DialogTitle>
                <DialogContent>
                    <Typography variant="body1" gutterBottom>
                        Are you sure you want to delete this user?
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Name: <strong>{selectedUser?.name}</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Email: <strong>{selectedUser?.email}</strong>
                    </Typography>
                    <Alert severity="error" sx={{ mt: 2 }}>
                        This action cannot be undone. All user data will be permanently removed.
                    </Alert>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
                    <Button onClick={handleDelete} color="error" variant="contained">
                        Delete User
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })} message={snackbar.message} />
        </Box>
    );
};

export default Users;
