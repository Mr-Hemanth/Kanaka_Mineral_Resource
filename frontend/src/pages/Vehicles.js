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
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, DirectionsCar as TripIcon } from '@mui/icons-material';
import api from '../utils/api';
import AdvancedTable from '../components/AdvancedTable';

const Vehicles = () => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [openTripForm, setOpenTripForm] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [formData, setFormData] = useState({
        vehicleNumber: '',
        driverName: '',
        vehicleType: '',
        status: 'ACTIVE',
    });
    const [tripFormData, setTripFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        destination: '',
        distance: '',
        amountPaid: '',
        remarks: ''
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

    const handleTripSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/vehicle-trips', { ...tripFormData, vehicleId: selectedVehicle.id });
            setOpenTripForm(false);
            setTripFormData({
                date: new Date().toISOString().split('T')[0], destination: '', distance: '', amountPaid: '', remarks: ''
            });
            fetchVehicles();
        } catch (error) {
            console.error('Failed to save trip', error);
            alert(error.response?.data?.message || 'Failed to save trip');
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

    const columns = [
        { id: 'vehicleNumber', label: 'Vehicle No.', minWidth: 150 },
        { id: 'vehicleType', label: 'Type', minWidth: 150 },
        { id: 'driverName', label: 'Driver', minWidth: 150, format: (val) => val || 'N/A' },
        {
            id: 'status',
            label: 'Status',
            minWidth: 120,
            format: (value) => (
                <Chip
                    label={value}
                    color={value === 'ACTIVE' ? 'success' : value === 'MAINTENANCE' ? 'warning' : 'default'}
                    size="small"
                    sx={{ fontWeight: 'bold' }}
                />
            )
        },
        {
            id: 'actions',
            label: 'Actions',
            align: 'right',
            minWidth: 140,
            format: (value, row) => (
                <>
                    <IconButton color="secondary" title="Log Trip" onClick={() => { setSelectedVehicle(row); setOpenTripForm(true); }}>
                        <TripIcon fontSize="small" />
                    </IconButton>
                    <IconButton color="primary" onClick={() => handleOpen(row)}><EditIcon fontSize="small" /></IconButton>
                    <IconButton color="error" onClick={() => handleDelete(row.id)}><DeleteIcon fontSize="small" /></IconButton>
                </>
            )
        }
    ];

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4" fontWeight="bold">Vehicles</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
                    Add Vehicle
                </Button>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <AdvancedTable
                    columns={columns}
                    data={vehicles}
                    title="Vehicle Directory"
                    searchableFields={['vehicleNumber', 'vehicleType', 'driverName', 'status']}
                />
            )}

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

            {/* Trip Form Dialog */}
            <Dialog open={openTripForm} onClose={() => setOpenTripForm(false)} maxWidth="sm" fullWidth>
                <form onSubmit={handleTripSubmit}>
                    <DialogTitle>Log Trip for {selectedVehicle?.vehicleNumber}</DialogTitle>
                    <DialogContent>
                        <TextField
                            margin="dense" label="Date" type="date" fullWidth required
                            InputLabelProps={{ shrink: true }}
                            value={tripFormData.date}
                            onChange={(e) => setTripFormData({ ...tripFormData, date: e.target.value })}
                        />
                        <TextField
                            margin="dense" label="Destination / Route" fullWidth required
                            value={tripFormData.destination}
                            onChange={(e) => setTripFormData({ ...tripFormData, destination: e.target.value })}
                        />
                        <TextField
                            margin="dense" label="Distance Traveled (km)" type="number" fullWidth
                            value={tripFormData.distance}
                            onChange={(e) => setTripFormData({ ...tripFormData, distance: e.target.value })}
                        />
                        <TextField
                            margin="dense" label="Amount Paid" type="number" fullWidth required
                            value={tripFormData.amountPaid}
                            onChange={(e) => setTripFormData({ ...tripFormData, amountPaid: e.target.value })}
                        />
                        <TextField
                            margin="dense" label="Remarks / Transport Notes" fullWidth multiline rows={2}
                            value={tripFormData.remarks}
                            onChange={(e) => setTripFormData({ ...tripFormData, remarks: e.target.value })}
                        />
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={() => setOpenTripForm(false)}>Cancel</Button>
                        <Button type="submit" variant="contained" color="secondary">Save Trip</Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Box>
    );
};

export default Vehicles;
