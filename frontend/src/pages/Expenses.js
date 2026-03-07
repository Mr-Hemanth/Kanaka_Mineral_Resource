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
    Grid,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Receipt as ReceiptIcon } from '@mui/icons-material';
import api from '../utils/api';

const ExpenseCategories = [
    'DIESEL', 'LABOUR', 'DRIVER', 'MACHINE_REPAIR', 'SPARE_PARTS', 'TRANSPORT', 'OTHER'
];

const Expenses = () => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
        category: 'OTHER',
        amount: '',
        paymentMethod: 'CASH',
        description: '',
        voucherNo: '',
        paidTo: '',
        paidBy: '',
    });

    const fetchExpenses = async () => {
        try {
            const { data } = await api.get('/expenses');
            setExpenses(data);
        } catch (error) {
            console.error('Failed to fetch expenses', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, []);

    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
        setFormData({ category: 'OTHER', amount: '', paymentMethod: 'CASH', description: '', voucherNo: '', paidTo: '', paidBy: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/expenses', formData);
            fetchExpenses();
            handleClose();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to log expense');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this log?')) {
            try {
                await api.delete(`/expenses/${id}`);
                fetchExpenses();
            } catch (error) {
                alert(error.response?.data?.message || 'Failed to delete');
            }
        }
    };

    const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4" fontWeight="bold">Expenses</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen}>
                    Add Expense
                </Button>
            </Box>

            <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2 }}>
                <Table>
                    <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Voucher #</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Paid To</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Paid By</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Amount</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Payment Method</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={6} align="center"><CircularProgress size={24} /></TableCell></TableRow>
                        ) : expenses.length === 0 ? (
                            <TableRow><TableCell colSpan={6} align="center">No expenses found</TableCell></TableRow>
                        ) : (
                            expenses.map((exp) => (
                                <TableRow key={exp.id} hover>
                                    <TableCell>{new Date(exp.date).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        {exp.voucherNo ? (
                                            <Chip label={exp.voucherNo} size="small" color="primary" variant="outlined" />
                                        ) : (
                                            '-'
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Chip label={exp.category.replace('_', ' ')} size="small" sx={{ fontWeight: 'medium' }} />
                                    </TableCell>
                                    <TableCell>{exp.paidTo || '-'}</TableCell>
                                    <TableCell>{exp.paidBy || '-'}</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                                        {formatCurrency(exp.amount)}
                                    </TableCell>
                                    <TableCell>{exp.paymentMethod || 'N/A'}</TableCell>
                                    <TableCell align="right">
                                        <IconButton color="error" onClick={() => handleDelete(exp.id)}><DeleteIcon size="small" /></IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <form onSubmit={handleSubmit}>
                    <DialogTitle>Log Expense</DialogTitle>
                    <DialogContent>
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    margin="dense"
                                    label="Voucher Number"
                                    fullWidth
                                    value={formData.voucherNo}
                                    onChange={(e) => setFormData({ ...formData, voucherNo: e.target.value })}
                                    InputProps={{
                                        startAdornment: <ReceiptIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    margin="dense"
                                    label="Paid To (Person/Entity)"
                                    fullWidth
                                    value={formData.paidTo}
                                    onChange={(e) => setFormData({ ...formData, paidTo: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    margin="dense"
                                    label="Paid By"
                                    fullWidth
                                    value={formData.paidBy}
                                    onChange={(e) => setFormData({ ...formData, paidBy: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    select
                                    margin="dense"
                                    label="Category"
                                    fullWidth
                                    required
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                >
                                    {ExpenseCategories.map(cat => (
                                        <MenuItem key={cat} value={cat}>{cat.replace('_', ' ')}</MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    type="number"
                                    margin="dense"
                                    label="Amount"
                                    fullWidth
                                    required
                                    inputProps={{ step: "0.01" }}
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    select
                                    margin="dense"
                                    label="Payment Method"
                                    fullWidth
                                    value={formData.paymentMethod}
                                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                                >
                                    <MenuItem value="CASH">CASH</MenuItem>
                                    <MenuItem value="BANK_TRANSFER">BANK TRANSFER</MenuItem>
                                    <MenuItem value="CHEQUE">CHEQUE</MenuItem>
                                    <MenuItem value="UPI">UPI</MenuItem>
                                </TextField>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    margin="dense"
                                    label="Description / Remarks"
                                    fullWidth
                                    multiline
                                    rows={2}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={handleClose}>Cancel</Button>
                        <Button type="submit" variant="contained">Save Expense</Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Box>
    );
};

export default Expenses;
