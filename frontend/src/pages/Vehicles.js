import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    CircularProgress,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import api from '../utils/api';

const Vehicles = () => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
        vehicleNumber: '',
        driverName: '',
        vehicleType: '',
        status: 'ACTIVE',
    });
    const [editingId, setEditingId] = useState(null);

    const fetchVehicles = async () => {
        try {
            const { data } = await api.get('/vehicles');
            setVehicles(data);
        } catch (error) {
            console.error('Failed to fetch vehicles', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVehicles();
    }, []);

    const handleOpen = (vehicle = null) => {
        if (vehicle) {
            setFormData(vehicle);
            setEditingId(vehicle.id);
        } else {
            setFormData({ vehicleNumber: '', driverName: '', vehicleType: '', status: 'ACTIVE' });
            setEditingId(null);
        }
        setOpen(true);
    };

    const handleClose = () => setOpen(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/vehicles/${editingId}`, formData);
            } else {
                await api.post('/vehicles', formData);
            }
            fetchVehicles();
            handleClose();
        } catch (error) {
            console.error('Failed to save vehicle', error);
            alert(error.response?.data?.message || 'Failed to save');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this vehicle?')) {
            try {
                await api.delete(`/vehicles/${id}`);
                fetchVehicles();
            } catch (error) {
                console.error('Failed to delete', error);
                alert(error.response?.data?.message || 'Failed to delete');
            }
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4" fontWeight="bold">Vehicles</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
                    Add Vehicle
                </Button>
            </Box>

            <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2 }}>
                <Table>
                    <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Vehicle No.</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Driver</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={5} align="center"><CircularProgress size={24} /></TableCell></TableRow>
                        ) : vehicles.length === 0 ? (
                            <TableRow><TableCell colSpan={5} align="center">No vehicles found</TableCell></TableRow>
                        ) : (
                            vehicles.map((v) => (
                                <TableRow key={v.id} hover>
                                    <TableCell>{v.vehicleNumber}</TableCell>
                                    <TableCell>{v.vehicleType}</TableCell>
                                    <TableCell>{v.driverName || 'N/A'}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={v.status}
                                            color={v.status === 'ACTIVE' ? 'success' : v.status === 'MAINTENANCE' ? 'warning' : 'default'}
                                            size="small"
                                            sx={{ fontWeight: 'bold' }}
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton color="primary" onClick={() => handleOpen(v)}><EditIcon size="small" /></IconButton>
                                        <IconButton color="error" onClick={() => handleDelete(v.id)}><DeleteIcon size="small" /></IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <form onSubmit={handleSubmit}>
                    <DialogTitle>{editingId ? 'Edit Vehicle' : 'Add New Vehicle'}</DialogTitle>
                    <DialogContent>
                        <TextField
                            margin="dense"
                            label="Vehicle Number"
                            fullWidth
                            required
                            value={formData.vehicleNumber}
                            onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                        />
                        <TextField
                            margin="dense"
                            label="Vehicle Type (e.g., Tipper, Excavator)"
                            fullWidth
                            required
                            value={formData.vehicleType}
                            onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                        />
                        <TextField
                            margin="dense"
                            label="Driver Name"
                            fullWidth
                            value={formData.driverName}
                            onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                        />
                        <TextField
                            select
                            margin="dense"
                            label="Status"
                            fullWidth
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        >
                            <MenuItem value="ACTIVE">ACTIVE</MenuItem>
                            <MenuItem value="MAINTENANCE">MAINTENANCE</MenuItem>
                            <MenuItem value="INACTIVE">INACTIVE</MenuItem>
                        </TextField>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={handleClose}>Cancel</Button>
                        <Button type="submit" variant="contained">Save</Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Box>
    );
};

export default Vehicles;
