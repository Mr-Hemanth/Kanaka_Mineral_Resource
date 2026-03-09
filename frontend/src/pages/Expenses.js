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
import AdvancedTable from '../components/AdvancedTable';

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

    const columns = [
        { id: 'date', label: 'Date', minWidth: 100, format: (val) => new Date(val).toLocaleDateString() },
        {
            id: 'voucherNo',
            label: 'Voucher #',
            minWidth: 120,
            format: (val) => val ? <Chip label={val} size="small" color="primary" variant="outlined" /> : '-'
        },
        {
            id: 'category',
            label: 'Category',
            minWidth: 130,
            format: (val) => <Chip label={val.replace('_', ' ')} size="small" sx={{ fontWeight: 'medium' }} />
        },
        { id: 'paidTo', label: 'Paid To', minWidth: 130, format: (val) => val || '-' },
        { id: 'paidBy', label: 'Paid By', minWidth: 130, format: (val) => val || '-' },
        {
            id: 'amount',
            label: 'Amount',
            align: 'right',
            minWidth: 120,
            format: (val) => <span style={{ fontWeight: 'bold', color: '#d32f2f' }}>{formatCurrency(val)}</span>
        },
        { id: 'paymentMethod', label: 'Payment Method', minWidth: 140, format: (val) => val || 'N/A' },
        {
            id: 'actions',
            label: 'Actions',
            align: 'right',
            minWidth: 100,
            format: (val, row) => (
                <IconButton color="error" size="small" onClick={() => handleDelete(row.id)}>
                    <DeleteIcon fontSize="small" />
                </IconButton>
            )
        }
    ];

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen}>
                    Add Expense
                </Button>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4, mt: 3 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <AdvancedTable
                    columns={columns}
                    data={expenses}
                    title="All Expenses"
                    searchableFields={['voucherNo', 'category', 'paidTo', 'paidBy', 'paymentMethod', 'description']}
                />
            )}

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
