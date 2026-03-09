import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Grid,
    Chip,
    Alert,
    CircularProgress,
    Snackbar,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Pagination,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as ViewIcon,
    TrendingUp as TrendingUpIcon,
    ShoppingCart as ShoppingCartIcon,
    CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import api from '../utils/api';
import AdvancedTable from '../components/AdvancedTable';

const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);

const PurchaseOrders = () => {
    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [totalItems, setTotalItems] = useState(0);
    const [openDialog, setOpenDialog] = useState(false);
    const [viewDialog, setViewDialog] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [selectedPO, setSelectedPO] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [formData, setFormData] = useState({
        poNumber: '',
        orderDate: new Date().toISOString().split('T')[0],
        deliveryDate: '',
        buyerName: '',
        destination: '',
        supplierContact: '',
        gstNo: '',
        gstDetails: '',
        status: 'PENDING',
        totalAmount: 0,
        paymentTerms: '',
        notes: '',
        items: [],
    });

    useEffect(() => {
        fetchPurchaseOrders();
        fetchStats();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchPurchaseOrders = async () => {
        try {
            setLoading(true);
            const params = { limit: 1000 };
            const response = await api.get('/purchase-orders', { params });
            if (response.data.data) {
                setPurchaseOrders(response.data.data);
                setTotalItems(response.data.pagination?.totalItems || response.data.data.length);
            } else {
                setPurchaseOrders(response.data);
                setTotalItems(response.data.length);
            }
        } catch (error) {
            showSnackbar('Failed to load purchase orders', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await api.get('/purchase-orders/stats');
            setStats(response.data);
        } catch (error) {
            console.error('Failed to fetch stats');
        }
    };

    const handleOpenDialog = (po = null) => {
        if (po) {
            setFormData({
                poNumber: po.poNumber,
                orderDate: new Date(po.orderDate).toISOString().split('T')[0],
                deliveryDate: po.deliveryDate ? new Date(po.deliveryDate).toISOString().split('T')[0] : '',
                buyerName: po.buyerName,
                destination: po.destination || '',
                supplierContact: po.supplierContact || '',
                gstNo: po.gstNo || '',
                gstDetails: po.gstDetails || '',
                status: po.status,
                totalAmount: po.totalAmount,
                paymentTerms: po.paymentTerms || '',
                notes: po.notes || '',
                items: po.items || [],
            });
            setSelectedPO(po);
        } else {
            setFormData({
                poNumber: `PO-${Date.now()}`,
                orderDate: new Date().toISOString().split('T')[0],
                deliveryDate: '',
                buyerName: '',
                destination: '',
                supplierContact: '',
                gstNo: '',
                gstDetails: '',
                status: 'PENDING',
                totalAmount: 0,
                paymentTerms: '',
                notes: '',
                items: [],
            });
            setSelectedPO(null);
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedPO(null);
    };

    const handleSave = async () => {
        try {
            if (selectedPO) {
                await api.put(`/purchase-orders/${selectedPO.id}`, formData);
                showSnackbar('Purchase Order updated successfully', 'success');
            } else {
                await api.post('/purchase-orders', formData);
                showSnackbar('Purchase Order created successfully', 'success');
            }
            handleCloseDialog();
            fetchPurchaseOrders();
            fetchStats();
        } catch (error) {
            showSnackbar(error.response?.data?.message || 'Operation failed', 'error');
        }
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/purchase-orders/${selectedPO.id}`);
            showSnackbar('Purchase Order deleted successfully', 'success');
            setDeleteDialog(false);
            setSelectedPO(null);
            fetchPurchaseOrders();
            fetchStats();
        } catch (error) {
            showSnackbar('Failed to delete', 'error');
        }
    };

    const handleView = (po) => {
        setSelectedPO(po);
        setViewDialog(true);
    };

    const showSnackbar = (message, severity) => {
        setSnackbar({ open: true, message, severity });
    };

    const getStatusColor = (status) => {
        const colors = {
            PENDING: 'warning',
            APPROVED: 'success',
            REJECTED: 'error',
            COMPLETED: 'primary',
            CANCELLED: 'default',
        };
        return colors[status] || 'default';
    };

    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { itemName: '', itemType: 'MATERIAL', quantity: 0, unit: 'PIECES', unitPrice: 0, totalPrice: 0 }],
        }));
    };

    const updateItem = (index, field, value) => {
        const newItems = [...formData.items];
        newItems[index][field] = value;
        if (field === 'quantity' || field === 'unitPrice') {
            newItems[index].totalPrice = newItems[index].quantity * newItems[index].unitPrice;
        }
        setFormData(prev => ({ ...prev, items: newItems, totalAmount: newItems.reduce((sum, item) => sum + item.totalPrice, 0) }));
    };

    const removeItem = (index) => {
        const newItems = formData.items.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, items: newItems, totalAmount: newItems.reduce((sum, item) => sum + item.totalPrice, 0) }));
    };

    const columns = [
        { id: 'poNumber', label: 'PO Number', minWidth: 130 },
        { id: 'orderDate', label: 'Order Date', minWidth: 120, format: (val) => new Date(val).toLocaleDateString() },
        { id: 'buyerName', label: 'Buyer Name', minWidth: 150 },
        {
            id: 'status',
            label: 'Status',
            minWidth: 130,
            format: (val) => <Chip label={val} color={getStatusColor(val)} size="small" />
        },
        {
            id: 'totalAmount',
            label: 'Total Amount',
            align: 'right',
            minWidth: 140,
            format: (val) => formatCurrency(val)
        },
        {
            id: 'actions',
            label: 'Actions',
            align: 'center',
            minWidth: 150,
            format: (val, row) => (
                <>
                    <IconButton size="small" onClick={() => handleView(row)}>
                        <ViewIcon />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleOpenDialog(row)}>
                        <EditIcon />
                    </IconButton>
                    <IconButton size="small" onClick={() => { setSelectedPO(row); setDeleteDialog(true); }}>
                        <DeleteIcon />
                    </IconButton>
                </>
            )
        }
    ];

    return (
        <Box>
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
                Purchase Orders
            </Typography>

            {/* Stats Cards */}
            {stats && (
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
                            <ShoppingCartIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                            <Typography variant="h4">{stats.totalPOs}</Typography>
                            <Typography variant="body2" color="text.secondary">Total POs</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
                            <CircularProgress variant="determinate" value={(stats.pendingPOs / (stats.totalPOs || 1)) * 100} size={50} />
                            <Typography variant="h4" sx={{ mt: -6, position: 'relative' }}>{stats.pendingPOs}</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Pending</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
                            <TrendingUpIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
                            <Typography variant="h4">{formatCurrency(stats.thisMonthSpend)}</Typography>
                            <Typography variant="body2" color="text.secondary">This Month</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
                            <CheckCircleIcon color="info" sx={{ fontSize: 40, mb: 1 }} />
                            <Typography variant="h4">{formatCurrency(stats.avgOrderValue)}</Typography>
                            <Typography variant="body2" color="text.secondary">Avg Order Value</Typography>
                        </Paper>
                    </Grid>
                </Grid>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
                    New Purchase Order
                </Button>
            </Box>

            {/* Advanced Table */}
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4, mt: 3 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <AdvancedTable
                    columns={columns}
                    data={purchaseOrders}
                    title="All Purchase Orders"
                    searchableFields={['poNumber', 'buyerName', 'destination', 'supplierContact', 'status', 'notes']}
                />
            )}

            {/* Create/Edit Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle>{selectedPO ? 'Edit' : 'Create'} Purchase Order</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="PO Number" value={formData.poNumber} onChange={(e) => setFormData({ ...formData, poNumber: e.target.value })} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Order Date" type="date" value={formData.orderDate} onChange={(e) => setFormData({ ...formData, orderDate: e.target.value })} InputLabelProps={{ shrink: true }} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Delivery Date" type="date" value={formData.deliveryDate} onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })} InputLabelProps={{ shrink: true }} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Status</InputLabel>
                                <Select value={formData.status} label="Status" onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                                    <MenuItem value="PENDING">Pending</MenuItem>
                                    <MenuItem value="APPROVED">Approved</MenuItem>
                                    <MenuItem value="REJECTED">Rejected</MenuItem>
                                    <MenuItem value="COMPLETED">Completed</MenuItem>
                                    <MenuItem value="CANCELLED">Cancelled</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Total Amount" type="number" value={formData.totalAmount} onChange={(e) => setFormData({ ...formData, totalAmount: parseFloat(e.target.value) || 0 })} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Buyer Name" value={formData.buyerName} onChange={(e) => setFormData({ ...formData, buyerName: e.target.value })} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Destination" value={formData.destination} onChange={(e) => setFormData({ ...formData, destination: e.target.value })} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Buyer Contact" value={formData.supplierContact} onChange={(e) => setFormData({ ...formData, supplierContact: e.target.value })} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="GST Number" value={formData.gstNo} onChange={(e) => setFormData({ ...formData, gstNo: e.target.value })}
                                placeholder="e.g., 29ABCDE1234F1Z5" />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth label="GST Details" value={formData.gstDetails} onChange={(e) => setFormData({ ...formData, gstDetails: e.target.value })}
                                multiline rows={2} placeholder="State, GST rate, additional details..." />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Payment Terms" value={formData.paymentTerms} onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth label="Notes" multiline rows={2} value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
                        </Grid>

                        {/* Items Section */}
                        <Grid item xs={12}>
                            <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2, mb: 1 }}>Order Items</Typography>
                            {formData.items.map((item, index) => (
                                <Paper key={index} variant="outlined" sx={{ p: 2, mb: 2 }}>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={3}>
                                            <TextField fullWidth size="small" label="Item Name" value={item.itemName} onChange={(e) => updateItem(index, 'itemName', e.target.value)} />
                                        </Grid>
                                        <Grid item xs={12} sm={2}>
                                            <TextField fullWidth size="small" type="number" label="Quantity" value={item.quantity} onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)} />
                                        </Grid>
                                        {item.id && (
                                            <Grid item xs={12} sm={2}>
                                                <TextField fullWidth size="small" label="Dispatched Qty" value={item.dispatchedQuantity || 0} InputProps={{ readOnly: true }} />
                                            </Grid>
                                        )}
                                        <Grid item xs={12} sm={2}>
                                            <TextField fullWidth size="small" type="number" label="Unit Price" value={item.unitPrice} onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)} />
                                        </Grid>
                                        <Grid item xs={12} sm={2}>
                                            <TextField fullWidth size="small" label="Total" value={formatCurrency(item.totalPrice)} InputProps={{ readOnly: true }} />
                                        </Grid>
                                        <Grid item xs={12} sm={1}>
                                            <Button color="error" onClick={() => removeItem(index)}>Remove</Button>
                                        </Grid>
                                    </Grid>
                                </Paper>
                            ))}
                            <Button variant="outlined" startIcon={<AddIcon />} onClick={addItem}>Add Item</Button>
                        </Grid>

                        <Grid item xs={12}>
                            <Typography variant="h6" align="right">
                                Total Amount: {formatCurrency(formData.totalAmount)}
                            </Typography>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleSave} variant="contained">{selectedPO ? 'Update' : 'Create'}</Button>
                </DialogActions>
            </Dialog>

            {/* View Dialog */}
            <Dialog open={viewDialog} onClose={() => setViewDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>Purchase Order Details - {selectedPO?.poNumber}</DialogTitle>
                <DialogContent>
                    {selectedPO && (
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}><Typography><strong>Order Date:</strong> {new Date(selectedPO.orderDate).toLocaleDateString()}</Typography></Grid>
                            <Grid item xs={12} sm={6}><Typography><strong>Status:</strong> <Chip label={selectedPO.status} color={getStatusColor(selectedPO.status)} size="small" /></Typography></Grid>
                            <Grid item xs={12}>
                                <Typography><strong>Buyer:</strong> {selectedPO.buyerName}</Typography>
                            </Grid>
                            {selectedPO.destination && (
                                <Grid item xs={12}>
                                    <Typography><strong>Destination:</strong> {selectedPO.destination}</Typography>
                                </Grid>
                            )}
                            {selectedPO.supplierContact && <Grid item xs={12}><Typography><strong>Contact:</strong> {selectedPO.supplierContact}</Typography></Grid>}
                            {selectedPO.gstNo && <Grid item xs={12}><Typography><strong>GST No:</strong> {selectedPO.gstNo}</Typography></Grid>}
                            {selectedPO.gstDetails && <Grid item xs={12}><Typography><strong>GST Details:</strong> {selectedPO.gstDetails}</Typography></Grid>}
                            <Grid item xs={12}><Typography><strong>Total Amount:</strong> {formatCurrency(selectedPO.totalAmount)}</Typography></Grid>
                            {selectedPO.items && selectedPO.items.length > 0 && (
                                <Grid item xs={12}>
                                    <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>Items:</Typography>
                                    {selectedPO.items.map((item, idx) => (
                                        <Typography key={idx} variant="body2">
                                            • {item.itemName} - {item.quantity} {item.unit} @ ₹{item.unitPrice} = ₹{item.totalPrice}
                                            {item.dispatchedQuantity > 0 && (
                                                <Typography component="span" variant="caption" sx={{ ml: 1, color: 'primary.main', fontWeight: 'bold' }}>
                                                    (Dispatched: {item.dispatchedQuantity})
                                                </Typography>
                                            )}
                                        </Typography>
                                    ))}
                                </Grid>
                            )}
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setViewDialog(false)}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to delete Purchase Order {selectedPO?.poNumber}?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
                    <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })} message={snackbar.message} />
        </Box>
    );
};

export default PurchaseOrders;
