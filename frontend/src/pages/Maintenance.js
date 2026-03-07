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
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    CircularProgress,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import api from '../utils/api';

const Maintenance = () => {
    const [records, setRecords] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
        vehicleId: '',
        partReplaced: '',
        cost: '',
        nextMaintenanceDue: '',
    });

    const fetchData = async () => {
        try {
            const [mRes, vRes] = await Promise.all([
                api.get('/maintenance'),
                api.get('/vehicles')
            ]);
            setRecords(mRes.data);
            setVehicles(vRes.data);
        } catch (error) {
            console.error('Failed to fetch data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
        setFormData({ vehicleId: '', partReplaced: '', cost: '', nextMaintenanceDue: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/maintenance', formData);
            fetchData();
            handleClose();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to save record');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this record?')) {
            try {
                await api.delete(`/maintenance/${id}`);
                fetchData();
            } catch (error) {
                alert(error.response?.data?.message || 'Failed to delete');
            }
        }
    };

    const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4" fontWeight="bold">Maintenance logs</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen}>
                    Log Maintenance
                </Button>
            </Box>

            <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2 }}>
                <Table>
                    <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Vehicle</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Part Replaced / Service</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Cost</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Next Due</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={6} align="center"><CircularProgress size={24} /></TableCell></TableRow>
                        ) : records.length === 0 ? (
                            <TableRow><TableCell colSpan={6} align="center">No maintenance logs found</TableCell></TableRow>
                        ) : (
                            records.map((rec) => (
                                <TableRow key={rec.id} hover>
                                    <TableCell>{new Date(rec.date).toLocaleDateString()}</TableCell>
                                    <TableCell sx={{ fontWeight: 'medium' }}>{rec.vehicle?.vehicleNumber}</TableCell>
                                    <TableCell>{rec.partReplaced}</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', color: 'error.main' }}>
                                        {formatCurrency(rec.cost)}
                                    </TableCell>
                                    <TableCell>
                                        {rec.nextMaintenanceDue ? new Date(rec.nextMaintenanceDue).toLocaleDateString() : '-'}
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton color="error" onClick={() => handleDelete(rec.id)}><DeleteIcon size="small" /></IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <form onSubmit={handleSubmit}>
                    <DialogTitle>Log Maintenance / Spare Parts</DialogTitle>
                    <DialogContent>
                        <TextField
                            select
                            margin="dense"
                            label="Vehicle"
                            fullWidth
                            required
                            value={formData.vehicleId}
                            onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                        >
                            {vehicles.map(v => (
                                <MenuItem key={v.id} value={v.id}>{v.vehicleNumber} ({v.vehicleType})</MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            margin="dense"
                            label="Part Replaced / Service Performed"
                            fullWidth
                            required
                            value={formData.partReplaced}
                            onChange={(e) => setFormData({ ...formData, partReplaced: e.target.value })}
                        />
                        <TextField
                            type="number"
                            margin="dense"
                            label="Total Cost"
                            fullWidth
                            required
                            inputProps={{ step: "0.01" }}
                            value={formData.cost}
                            onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                        />
                        <TextField
                            type="date"
                            margin="dense"
                            label="Next Maintenance Due (Optional)"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            value={formData.nextMaintenanceDue}
                            onChange={(e) => setFormData({ ...formData, nextMaintenanceDue: e.target.value })}
                            sx={{ mt: 2 }}
                        />
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={handleClose}>Cancel</Button>
                        <Button type="submit" variant="contained">Save Record</Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Box>
    );
};

export default Maintenance;
