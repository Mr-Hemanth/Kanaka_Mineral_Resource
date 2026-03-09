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
import AdvancedTable from '../components/AdvancedTable';

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

    const columns = [
        { id: 'date', label: 'Date', minWidth: 120, format: (val) => new Date(val).toLocaleDateString() },
        {
            id: 'type',
            label: 'Type',
            minWidth: 120,
            format: (val) => val === 'BOUGHT'
                ? <Chip label="Purchased" size="small" color="success" />
                : <Chip label="Filled" size="small" color="primary" />
        },
        {
            id: 'locationOrVehicle', // virtual 
            label: 'Vehicle/Location',
            minWidth: 150,
            format: (val, row) => row.type === 'BOUGHT' ? (row.location || '-') : (row.vehicle?.vehicleNumber || '-')
        },
        { id: 'dieselFilled', label: 'Quantity (L)', minWidth: 120, format: (val) => `${val} L` },
        { id: 'pricePerLitre', label: 'Price/L', minWidth: 120, format: (val) => formatCurrency(val) },
        {
            id: 'totalCost',
            label: 'Total Cost',
            minWidth: 150,
            format: (val) => <span style={{ fontWeight: 'bold', color: '#d32f2f' }}>{formatCurrency(val)}</span>
        },
        { id: 'supplier', label: 'Supplier', minWidth: 130, format: (val) => val || '-' },
        {
            id: 'actions',
            label: 'Actions',
            align: 'right',
            minWidth: 100,
            format: (val, row) => (
                <IconButton color="error" onClick={() => handleDelete(row.id)}>
                    <DeleteIcon fontSize="small" />
                </IconButton>
            )
        }
    ];

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4" fontWeight="bold">Diesel Logs</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen}>
                    Add Diesel Entry
                </Button>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <AdvancedTable
                    columns={columns}
                    data={logs}
                    title="Diesel Fuel Logs"
                    searchableFields={['type', 'supplier', 'location', 'remarks']}
                />
            )}

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
