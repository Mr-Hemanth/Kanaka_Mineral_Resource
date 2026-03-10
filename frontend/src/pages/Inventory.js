import React, { useEffect, useState } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, IconButton, Button, Dialog, DialogTitle,
    DialogContent, DialogActions, TextField, Grid, Chip, Alert,
    CircularProgress, Snackbar, MenuItem, Select, FormControl, InputLabel,
    Pagination, Card, CardContent, Badge, Divider,
} from '@mui/material';
import {
    Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
    Visibility as ViewIcon, RemoveCircleOutline as RemoveIcon,
    AddCircleOutline as AddStockIcon, Warning as WarningIcon,
    CheckCircle as CheckCircleIcon, Inventory as InventoryIcon,
} from '@mui/icons-material';
import api from '../utils/api';
import AdvancedTable from '../components/AdvancedTable';

const Inventory = () => {
    const [inventoryItems, setInventoryItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalItems, setTotalItems] = useState(0);
    const [openDialog, setOpenDialog] = useState(false);
    const [viewDialog, setViewDialog] = useState(false);
    const [stockDialog, setStockDialog] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [lowStockCount, setLowStockCount] = useState(0);

    const [formData, setFormData] = useState({
        itemName: '',
        itemType: 'SPARE_PART',
        category: '',
        quantity: 0,
        unit: 'PIECES',
        minStock: 5,
        maxStock: '',
        location: '',
        supplier: '',
        lastPurchasePrice: 0,
        description: '',
    });

    useEffect(() => {
        fetchInventory();
        fetchLowStockCount();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchInventory = async () => {
        try {
            setLoading(true);
            const params = { limit: 1000 };
            const response = await api.get('/inventory', { params });
            if (response.data.data) {
                setInventoryItems(response.data.data);
                setTotalItems(response.data.pagination?.totalItems || response.data.data.length);
            } else {
                setInventoryItems(response.data);
                setTotalItems(response.data.length);
            }
        } catch (error) {
            showSnackbar('Failed to load inventory items', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchLowStockCount = async () => {
        try {
            const response = await api.get('/inventory/low-stock');
            setLowStockCount(response.data.length);
        } catch (error) {
            console.error('Failed to fetch low stock items');
        }
    };

    const handleOpenDialog = (item = null) => {
        if (item) {
            setFormData({
                itemName: item.itemName,
                itemType: item.itemType,
                category: item.category || '',
                quantity: item.quantity,
                unit: item.unit,
                minStock: item.minStock,
                maxStock: item.maxStock || '',
                location: item.location || '',
                supplier: item.supplier || '',
                lastPurchasePrice: item.lastPurchasePrice || 0,
                description: item.description || '',
            });
            setSelectedItem(item);
        } else {
            setFormData({
                itemName: '',
                itemType: 'SPARE_PART',
                category: '',
                quantity: 0,
                unit: 'PIECES',
                minStock: 5,
                maxStock: '',
                location: '',
                supplier: '',
                lastPurchasePrice: 0,
                description: '',
            });
            setSelectedItem(null);
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedItem(null);
    };

    const handleSave = async () => {
        try {
            if (selectedItem) {
                await api.put(`/inventory/${selectedItem.id}`, formData);
                showSnackbar('Item updated successfully', 'success');
            } else {
                await api.post('/inventory', formData);
                showSnackbar('Item added successfully', 'success');
            }
            handleCloseDialog();
            fetchInventory();
            fetchLowStockCount();
        } catch (error) {
            showSnackbar(error.response?.data?.message || 'Operation failed', 'error');
        }
    };

    const handleStockUpdate = async () => {
        try {
            await api.post(`/inventory/${selectedItem.id}/stock`, {
                quantityChange: formData.quantityChange,
                reason: formData.reason,
            });
            showSnackbar('Stock updated successfully', 'success');
            setStockDialog(false);
            fetchInventory();
            fetchLowStockCount();
        } catch (error) {
            showSnackbar('Failed to update stock', 'error');
        }
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/inventory/${selectedItem.id}`);
            showSnackbar('Item deleted successfully', 'success');
            setDeleteDialog(false);
            setSelectedItem(null);
            fetchInventory();
        } catch (error) {
            showSnackbar('Failed to delete', 'error');
        }
    };

    const handleView = (item) => {
        setSelectedItem(item);
        setViewDialog(true);
    };

    const handleOpenStockDialog = (item) => {
        setSelectedItem(item);
        setFormData(prev => ({ ...prev, quantityChange: '' }));
        setStockDialog(true);
    };

    const showSnackbar = (message, severity) => {
        setSnackbar({ open: true, message, severity });
    };

    const getStatusColor = (status) => {
        const colors = {
            IN_STOCK: 'success',
            LOW_STOCK: 'warning',
            OUT_OF_STOCK: 'error',
            DISCONTINUED: 'default',
        };
        return colors[status] || 'default';
    };

    const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);

    const columns = [
        {
            id: 'itemName',
            label: 'Item Name',
            minWidth: 150,
            format: (val, row) => (
                <>
                    <Typography fontWeight="medium">{row.itemName}</Typography>
                    {row.category && (
                        <Typography variant="caption" color="text.secondary">
                            {row.category}
                        </Typography>
                    )}
                </>
            )
        },
        {
            id: 'itemType',
            label: 'Type',
            minWidth: 120,
            format: (val) => <Chip label={val.replace('_', ' ')} size="small" />
        },
        {
            id: 'quantity',
            label: 'Quantity',
            align: 'right',
            minWidth: 100,
            format: (val, row) => (
                <Badge badgeContent={row.quantity <= row.minStock ? '!' : null} color="warning">
                    {row.quantity} {row.unit.toLowerCase()}
                </Badge>
            )
        },
        { id: 'location', label: 'Location', minWidth: 130, format: (val) => val || '-' },
        {
            id: 'status',
            label: 'Status',
            minWidth: 130,
            format: (val) => <Chip label={val.replace('_', ' ')} size="small" color={getStatusColor(val)} />
        },
        { id: 'totalValue', label: 'Value', align: 'right', minWidth: 120, format: (val) => formatCurrency(val) },
        {
            id: 'actions',
            label: 'Actions',
            align: 'center',
            minWidth: 160,
            format: (val, row) => (
                <>
                    <IconButton size="small" onClick={() => handleView(row)}>
                        <ViewIcon />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleOpenStockDialog(row)}>
                        {row.quantity <= row.minStock ? <AddStockIcon color="warning" /> : <AddStockIcon />}
                    </IconButton>
                    <IconButton size="small" onClick={() => handleOpenDialog(row)}>
                        <EditIcon />
                    </IconButton>
                    <IconButton size="small" onClick={() => { setSelectedItem(row); setDeleteDialog(true); }}>
                        <DeleteIcon />
                    </IconButton>
                </>
            )
        }
    ];

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4" fontWeight="bold">
                    Inventory & Storage Management
                </Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
                    Add Item
                </Button>
            </Box>

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card elevation={2}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography color="text.secondary" variant="body2">Total Items</Typography>
                                    <Typography variant="h4">{totalItems}</Typography>
                                </Box>
                                <InventoryIcon color="primary" sx={{ fontSize: 48, opacity: 0.3 }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card elevation={2}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography color="text.secondary" variant="body2">In Stock</Typography>
                                    <Typography variant="h4" color="success.main">
                                        {inventoryItems.filter(i => i.status === 'IN_STOCK').length}
                                    </Typography>
                                </Box>
                                <CheckCircleIcon color="success" sx={{ fontSize: 48, opacity: 0.3 }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card elevation={2}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography color="text.secondary" variant="body2">Low Stock</Typography>
                                    <Typography variant="h4" color="warning.main">{lowStockCount}</Typography>
                                </Box>
                                <WarningIcon color="warning" sx={{ fontSize: 48, opacity: 0.3 }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card elevation={2}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography color="text.secondary" variant="body2">Out of Stock</Typography>
                                    <Typography variant="h4" color="error.main">
                                        {inventoryItems.filter(i => i.status === 'OUT_OF_STOCK').length}
                                    </Typography>
                                </Box>
                                <RemoveIcon sx={{ fontSize: 48, opacity: 0.3, color: 'error.main' }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Advanced Table */}
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4, mt: 3 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <AdvancedTable
                    columns={columns}
                    data={inventoryItems}
                    title="All Inventory Items"
                    searchableFields={['itemName', 'category', 'location', 'itemType', 'status']}
                />
            )}

            {/* Create/Edit Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle>{selectedItem ? 'Edit' : 'Add'} Inventory Item</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Item Name" value={formData.itemName} onChange={(e) => setFormData({ ...formData, itemName: e.target.value })} required />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth required>
                                <InputLabel>Item Type</InputLabel>
                                <Select value={formData.itemType} label="Item Type" onChange={(e) => setFormData({ ...formData, itemType: e.target.value })}>
                                    <MenuItem value="SPARE_PART">Spare Part</MenuItem>
                                    <MenuItem value="TOOL">Tool</MenuItem>
                                    <MenuItem value="EQUIPMENT">Equipment</MenuItem>
                                    <MenuItem value="CONSUMABLE">Consumable</MenuItem>
                                    <MenuItem value="MATERIAL">Material</MenuItem>
                                    <MenuItem value="OTHER">Other</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Category" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} placeholder="ENGINE, ELECTRICAL, etc." />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Quantity" type="number" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Unit</InputLabel>
                                <Select value={formData.unit} label="Unit" onChange={(e) => setFormData({ ...formData, unit: e.target.value })}>
                                    <MenuItem value="PIECES">Pieces</MenuItem>
                                    <MenuItem value="LITERS">Liters</MenuItem>
                                    <MenuItem value="KG">Kilograms</MenuItem>
                                    <MenuItem value="METERS">Meters</MenuItem>
                                    <MenuItem value="SET">Set</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Min Stock Level" type="number" value={formData.minStock} onChange={(e) => setFormData({ ...formData, minStock: parseFloat(e.target.value) || 0 })} helperText="Alert when below this" />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Max Stock Level" type="number" value={formData.maxStock} onChange={(e) => setFormData({ ...formData, maxStock: parseFloat(e.target.value) || '' })} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth label="Storage Location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="Rack A, Shelf B, etc." />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Supplier" value={formData.supplier} onChange={(e) => setFormData({ ...formData, supplier: e.target.value })} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Last Purchase Price" type="number" value={formData.lastPurchasePrice} onChange={(e) => setFormData({ ...formData, lastPurchasePrice: parseFloat(e.target.value) || 0 })} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth label="Description" multiline rows={2} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleSave} variant="contained">{selectedItem ? 'Update' : 'Add'}</Button>
                </DialogActions>
            </Dialog>

            {/* Stock Update Dialog */}
            <Dialog open={stockDialog} onClose={() => setStockDialog(false)}>
                <DialogTitle>Update Stock - {selectedItem?.itemName}</DialogTitle>
                <DialogContent>
                    <Box sx={{ my: 2 }}>
                        <Typography variant="body2" color="text.secondary">Current Stock: <strong>{selectedItem?.quantity} {selectedItem?.unit}</strong></Typography>
                        <Typography variant="body2" color="text.secondary">Min Stock: <strong>{selectedItem?.minStock} {selectedItem?.unit}</strong></Typography>
                    </Box>
                    <TextField
                        fullWidth
                        label="Quantity Change"
                        type="number"
                        value={formData.quantityChange}
                        onChange={(e) => setFormData({ ...formData, quantityChange: parseFloat(e.target.value) || 0 })}
                        helperText="Positive to add, negative to remove"
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        fullWidth
                        label="Reason (Optional)"
                        multiline
                        rows={2}
                        value={formData.reason}
                        onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setStockDialog(false)}>Cancel</Button>
                    <Button onClick={handleStockUpdate} variant="contained">Update Stock</Button>
                </DialogActions>
            </Dialog>

            {/* View Dialog */}
            <Dialog open={viewDialog} onClose={() => setViewDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>Item Details - {selectedItem?.itemName}</DialogTitle>
                <DialogContent>
                    {selectedItem && (
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}><Typography><strong>Type:</strong> {selectedItem.itemType.replace('_', ' ')}</Typography></Grid>
                            <Grid item xs={12} sm={6}><Typography><strong>Category:</strong> {selectedItem.category || '-'}</Typography></Grid>
                            <Grid item xs={12} sm={6}><Typography><strong>Location:</strong> {selectedItem.location || '-'}</Typography></Grid>
                            <Grid item xs={12} sm={6}><Typography><strong>Quantity:</strong> {selectedItem.quantity} {selectedItem.unit}</Typography></Grid>
                            <Grid item xs={12} sm={6}><Typography><strong>Min Stock:</strong> {selectedItem.minStock} {selectedItem.unit}</Typography></Grid>
                            <Grid item xs={12} sm={6}><Typography><strong>Status:</strong> <Chip label={selectedItem.status.replace('_', ' ')} size="small" color={getStatusColor(selectedItem.status)} /></Typography></Grid>
                            <Grid item xs={12} sm={6}><Typography><strong>Supplier:</strong> {selectedItem.supplier || '-'}</Typography></Grid>
                            <Grid item xs={12} sm={6}><Typography><strong>Last Price:</strong> {formatCurrency(selectedItem.lastPurchasePrice)}</Typography></Grid>
                            <Grid item xs={12} sm={6}><Typography><strong>Total Value:</strong> {formatCurrency(selectedItem.totalValue)}</Typography></Grid>
                            {selectedItem.description && (
                                <Grid item xs={12}>
                                    <Divider sx={{ my: 1 }} />
                                    <Typography><strong>Description:</strong></Typography>
                                    <Typography variant="body2">{selectedItem.description}</Typography>
                                </Grid>
                            )}
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setViewDialog(false)}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to delete "{selectedItem?.itemName}"?</Typography>
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

export default Inventory;
