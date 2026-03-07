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
    Search as SearchIcon, FilterList as FilterIcon,
} from '@mui/icons-material';
import SearchFilter from '../components/SearchFilter';
import api from '../utils/api';

const Inventory = () => {
    const [inventoryItems, setInventoryItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
    const [searchParams, setSearchParams] = useState({});
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
        partNumber: '',
        quantity: 0,
        unit: 'PIECES',
        minStock: 5,
        maxStock: '',
        location: '',
        supplier: '',
        lastPurchasePrice: 0,
        description: '',
    });

    const filters = [
        {
            name: 'itemType',
            label: 'Item Type',
            options: [
                { value: 'SPARE_PART', label: 'Spare Part' },
                { value: 'TOOL', label: 'Tool' },
                { value: 'EQUIPMENT', label: 'Equipment' },
                { value: 'CONSUMABLE', label: 'Consumable' },
                { value: 'MATERIAL', label: 'Material' },
                { value: 'OTHER', label: 'Other' },
            ],
        },
        {
            name: 'status',
            label: 'Status',
            options: [
                { value: 'IN_STOCK', label: 'In Stock' },
                { value: 'LOW_STOCK', label: 'Low Stock' },
                { value: 'OUT_OF_STOCK', label: 'Out of Stock' },
                { value: 'DISCONTINUED', label: 'Discontinued' },
            ],
        },
    ];

    const sortOptions = [
        { value: 'itemName', label: 'Item Name' },
        { value: 'quantity', label: 'Quantity' },
        { value: 'totalValue', label: 'Total Value' },
        { value: 'createdAt', label: 'Created Date' },
    ];

    useEffect(() => {
        fetchInventory();
        fetchLowStockCount();
    }, [pagination.currentPage, searchParams]);

    const fetchInventory = async () => {
        try {
            setLoading(true);
            const params = {
                page: pagination.currentPage,
                limit: 10,
                ...searchParams,
            };
            const response = await api.get('/inventory', { params });
            setInventoryItems(response.data.data);
            setPagination(prev => ({
                ...prev,
                totalPages: response.data.pagination.totalPages,
                totalItems: response.data.pagination.totalItems,
            }));
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

    const handleSearch = (query) => {
        setSearchParams(prev => ({ ...prev, search: query }));
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    };

    const handleFilter = (filters) => {
        setSearchParams(prev => ({ ...prev, ...filters }));
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    };

    const handleSort = ({ sortBy, order }) => {
        setSearchParams(prev => ({ ...prev, sortBy, order }));
    };

    const handleOpenDialog = (item = null) => {
        if (item) {
            setFormData({
                itemName: item.itemName,
                itemType: item.itemType,
                category: item.category || '',
                partNumber: item.partNumber || '',
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
                partNumber: '',
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

    return (
        <Box>
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
                Inventory & Storage Management
            </Typography>

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card elevation={2}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography color="text.secondary" variant="body2">Total Items</Typography>
                                    <Typography variant="h4">{pagination.totalItems}</Typography>
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

            {/* Search and Filters */}
            <SearchFilter
                onSearch={handleSearch}
                onFilter={handleFilter}
                onSort={handleSort}
                filters={filters}
                sortOptions={sortOptions}
                placeholder="Search by item name, part number, category, or location..."
            />

            {/* Main Table */}
            <Paper elevation={2} sx={{ borderRadius: 2, mt: 3 }}>
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" fontWeight="bold">All Inventory Items</Typography>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
                        Add Item
                    </Button>
                </Box>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell><strong>Item Name</strong></TableCell>
                                        <TableCell><strong>Type</strong></TableCell>
                                        <TableCell><strong>Part Number</strong></TableCell>
                                        <TableCell align="right"><strong>Quantity</strong></TableCell>
                                        <TableCell><strong>Location</strong></TableCell>
                                        <TableCell><strong>Status</strong></TableCell>
                                        <TableCell align="right"><strong>Value</strong></TableCell>
                                        <TableCell align="center"><strong>Actions</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {inventoryItems.map((item) => (
                                        <TableRow key={item.id} hover>
                                            <TableCell>
                                                <Typography fontWeight="medium">{item.itemName}</Typography>
                                                {item.category && (
                                                    <Typography variant="caption" color="text.secondary">
                                                        {item.category}
                                                    </Typography>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Chip label={item.itemType.replace('_', ' ')} size="small" />
                                            </TableCell>
                                            <TableCell>{item.partNumber || '-'}</TableCell>
                                            <TableCell align="right">
                                                <Badge badgeContent={item.quantity <= item.minStock ? '!' : null} color="warning">
                                                    {item.quantity} {item.unit.toLowerCase()}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{item.location || '-'}</TableCell>
                                            <TableCell>
                                                <Chip 
                                                    label={item.status.replace('_', ' ')} 
                                                    size="small" 
                                                    color={getStatusColor(item.status)}
                                                />
                                            </TableCell>
                                            <TableCell align="right">
                                                {formatCurrency(item.totalValue)}
                                            </TableCell>
                                            <TableCell align="center">
                                                <IconButton size="small" onClick={() => handleView(item)}>
                                                    <ViewIcon />
                                                </IconButton>
                                                <IconButton size="small" onClick={() => handleOpenStockDialog(item)}>
                                                    {item.quantity <= item.minStock ? <AddStockIcon color="warning" /> : <AddStockIcon />}
                                                </IconButton>
                                                <IconButton size="small" onClick={() => handleOpenDialog(item)}>
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton size="small" onClick={() => { setSelectedItem(item); setDeleteDialog(true); }}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {inventoryItems.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={8} align="center">
                                                <Alert severity="info" sx={{ mt: 2 }}>No inventory items found</Alert>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {/* Pagination */}
                        <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                            <Pagination
                                count={pagination.totalPages}
                                page={pagination.currentPage}
                                onChange={(e, page) => setPagination(prev => ({ ...prev, currentPage: page }))}
                                color="primary"
                            />
                        </Box>
                    </>
                )}
            </Paper>

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
                            <TextField fullWidth label="Part Number" value={formData.partNumber} onChange={(e) => setFormData({ ...formData, partNumber: e.target.value })} />
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
                            <Grid item xs={12} sm={6}><Typography><strong>Part Number:</strong> {selectedItem.partNumber || '-'}</Typography></Grid>
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
