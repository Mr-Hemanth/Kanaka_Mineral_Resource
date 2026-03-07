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
    CircularProgress,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import api from '../utils/api';

const Labour = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        inTime: '',
        outTime: '',
        workType: '',
        payment: '',
    });

    const fetchData = async () => {
        try {
            const { data } = await api.get('/labour');
            setRecords(data);
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
        setFormData({ name: '', inTime: '', outTime: '', workType: '', payment: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/labour', formData);
            fetchData();
            handleClose();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to save record');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this record?')) {
            try {
                await api.delete(`/labour/${id}`);
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
                <Typography variant="h4" fontWeight="bold">Labour Records</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen}>
                    Add Labour Log
                </Button>
            </Box>

            <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2 }}>
                <Table>
                    <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Work Type</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>In Time</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Out Time</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Payment</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={7} align="center"><CircularProgress size={24} /></TableCell></TableRow>
                        ) : records.length === 0 ? (
                            <TableRow><TableCell colSpan={7} align="center">No labour records found</TableCell></TableRow>
                        ) : (
                            records.map((rec) => (
                                <TableRow key={rec.id} hover>
                                    <TableCell>{new Date(rec.date).toLocaleDateString()}</TableCell>
                                    <TableCell sx={{ fontWeight: 'medium' }}>{rec.name}</TableCell>
                                    <TableCell>{rec.workType}</TableCell>
                                    <TableCell>{rec.inTime || '-'}</TableCell>
                                    <TableCell>{rec.outTime || '-'}</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', color: 'error.main' }}>
                                        {formatCurrency(rec.payment)}
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
                    <DialogTitle>Add Labour Log</DialogTitle>
                    <DialogContent>
                        <TextField
                            margin="dense"
                            label="Worker Name"
                            fullWidth
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                        <TextField
                            margin="dense"
                            label="Type of Work (e.g., Drilling, Loading)"
                            fullWidth
                            required
                            value={formData.workType}
                            onChange={(e) => setFormData({ ...formData, workType: e.target.value })}
                        />
                        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                            <TextField
                                type="time"
                                label="In Time"
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                value={formData.inTime}
                                onChange={(e) => setFormData({ ...formData, inTime: e.target.value })}
                            />
                            <TextField
                                type="time"
                                label="Out Time"
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                value={formData.outTime}
                                onChange={(e) => setFormData({ ...formData, outTime: e.target.value })}
                            />
                        </Box>
                        <TextField
                            type="number"
                            margin="dense"
                            label="Daily Wage / Payment"
                            fullWidth
                            required
                            inputProps={{ step: "0.01" }}
                            value={formData.payment}
                            onChange={(e) => setFormData({ ...formData, payment: e.target.value })}
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

export default Labour;
