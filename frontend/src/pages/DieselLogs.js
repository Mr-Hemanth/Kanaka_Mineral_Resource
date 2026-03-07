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
    Chip,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import api from '../utils/api';

const DieselLogs = () => {
    const [logs, setLogs] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
        type: 'FILLED', // FILLED or BOUGHT
        vehicleId: '',
        dieselFilled: '',
        pricePerLitre: '',
        supplier: '',
        location: '',
        remarks: '',
    });

    const fetchData = async () => {
        try {
            const [logsRes, vRes] = await Promise.all([
                api.get('/diesel'),
                api.get('/vehicles')
            ]);
            setLogs(logsRes.data);
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
        setFormData({ type: 'FILLED', vehicleId: '', dieselFilled: '', pricePerLitre: '', supplier: '', location: '', remarks: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/diesel', formData);
            fetchData();
            handleClose();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to log diesel');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this log?')) {
            try {
                await api.delete(`/diesel/${id}`);
                fetchData();
            } catch (error) {
                alert(error.response?.data?.message || 'Not authorized to delete');
            }
        }
    };

    const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4" fontWeight="bold">Diesel Logs</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen}>
                    Add Diesel Entry
                </Button>
            </Box>

            <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2 }}>
                <Table>
                    <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Vehicle/Location</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Quantity (L)</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Price/L</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Total Cost</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Supplier</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={8} align="center"><CircularProgress size={24} /></TableCell></TableRow>
                        ) : logs.length === 0 ? (
                            <TableRow><TableCell colSpan={8} align="center">No logs found</TableCell></TableRow>
                        ) : (
                            logs.map((log) => (
                                <TableRow key={log.id} hover>
                                    <TableCell>{new Date(log.date).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        {log.type === 'BOUGHT' ? (
                                            <Chip label="Purchased" size="small" color="success" />
                                        ) : (
                                            <Chip label="Filled" size="small" color="primary" />
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {log.type === 'BOUGHT' ? (
                                            log.location || '-'
                                        ) : (
                                            log.vehicle?.vehicleNumber || '-'
                                        )}
                                    </TableCell>
                                    <TableCell>{log.dieselFilled} L</TableCell>
                                    <TableCell>{formatCurrency(log.pricePerLitre)}</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', color: 'error.main' }}>
                                        {formatCurrency(log.totalCost)}
                                    </TableCell>
                                    <TableCell>{log.supplier || '-'}</TableCell>
                                    <TableCell align="right">
                                        <IconButton color="error" onClick={() => handleDelete(log.id)}><DeleteIcon size="small" /></IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <form onSubmit={handleSubmit}>
                    <DialogTitle>Add Diesel Entry</DialogTitle>
                    <DialogContent>
                        <TextField
                            select
                            margin="dense"
                            label="Entry Type"
                            fullWidth
                            required
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            sx={{ mb: 2 }}
                        >
                            <MenuItem value="FILLED">Vehicle Filled</MenuItem>
                            <MenuItem value="BOUGHT">Purchased/Bought</MenuItem>
                        </TextField>
                    
                        {formData.type === 'FILLED' ? (
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
                        ) : (
                            <>
                                <TextField
                                    fullWidth
                                    margin="dense"
                                    label="Location (Where purchased)"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    placeholder="e.g., IOCL Bunk, HP Petrol Pump"
                                />
                                <TextField
                                    fullWidth
                                    margin="dense"
                                    label="Supplier Name"
                                    value={formData.supplier}
                                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                                    placeholder="e.g., Indian Oil, Bharat Petroleum"
                                />
                            </>
                        )}
                        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                            <TextField
                                type="number"
                                label="Diesel Filled (Litres)"
                                fullWidth
                                required
                                inputProps={{ step: "0.01" }}
                                value={formData.dieselFilled}
                                onChange={(e) => setFormData({ ...formData, dieselFilled: e.target.value })}
                            />
                            <TextField
                                type="number"
                                label="Price per Litre"
                                fullWidth
                                required
                                inputProps={{ step: "0.01" }}
                                value={formData.pricePerLitre}
                                onChange={(e) => setFormData({ ...formData, pricePerLitre: e.target.value })}
                            />
                        </Box>
                        <TextField
                            margin="dense"
                            label="Remarks"
                            fullWidth
                            multiline
                            rows={2}
                            value={formData.remarks}
                            onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                            sx={{ mt: 2 }}
                        />
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={handleClose}>Cancel</Button>
                        <Button type="submit" variant="contained">Submit Log</Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Box>
    );
};

export default DieselLogs;
