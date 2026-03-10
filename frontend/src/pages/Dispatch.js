import React, { useEffect, useState } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, IconButton, Button, Dialog, DialogTitle,
    DialogContent, DialogActions, TextField, Grid, Chip, Alert,
    CircularProgress, Snackbar, MenuItem, Autocomplete, FormControl,
    InputLabel, Select, FormGroup, FormControlLabel, Checkbox,
} from '@mui/material';
import {
    Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
    CheckCircle as CheckCircleIcon, Cancel as CancelIcon,
    Visibility as ViewIcon,
} from '@mui/icons-material';
import api from '../utils/api';
import AdvancedTable from '../components/AdvancedTable';

const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);

const Dispatch = () => {
    const [dispatches, setDispatches] = useState([]);
    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [viewDialog, setViewDialog] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [selectedDispatch, setSelectedDispatch] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        truckNumber: '',
        driverId: '',
        materialType: '',
        tonnage: '',
        destination: '',
        buyer: '',
        pricePerTon: '',
        purchaseOrderId: null,
        selectedPOItem: null, // Store selected PO item
        transportPricePerTon: '',
        totalTransportValue: 0,
        royaltyAmount: 0,
        paymentStatus: 'PENDING',
    });

    useEffect(() => {
        fetchDispatches();
        fetchPurchaseOrders();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchDispatches = async () => {
        try {
            setLoading(true);
            const response = await api.get('/dispatch');
            setDispatches(response.data);
        } catch (error) {
            showSnackbar('Failed to load dispatch logs', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchPurchaseOrders = async () => {
        try {
            const response = await api.get('/purchase-orders?status=APPROVED,COMPLETED');
            setPurchaseOrders(response.data.data || []);
        } catch (error) {
            console.error('Failed to load POs');
        }
    };

    const handleOpenDialog = (dispatch = null) => {
        if (dispatch) {
            setFormData({
                date: new Date(dispatch.date).toISOString().split('T')[0],
                truckNumber: dispatch.truckNumber,
                driverId: dispatch.driverId?.toString() || '',
                materialType: dispatch.materialType,
                tonnage: dispatch.tonnage.toString(),
                destination: dispatch.destination,
                buyer: dispatch.buyer,
                pricePerTon: dispatch.pricePerTon.toString(),
                purchaseOrderId: dispatch.purchaseOrderId,
                transportPricePerTon: dispatch.transportPricePerTon?.toString() || '',
                totalTransportValue: dispatch.totalTransportValue || 0,
                royaltyAmount: dispatch.royaltyAmount || 0,
                paymentStatus: dispatch.paymentStatus,
            });
            setSelectedDispatch(dispatch);
        } else {
            setFormData({
                date: new Date().toISOString().split('T')[0],
                truckNumber: '',
                driverId: '',
                materialType: '',
                tonnage: '',
                destination: '',
                buyer: '',
                pricePerTon: '',
                purchaseOrderId: null,
                transportPricePerTon: '',
                totalTransportValue: 0,
                royaltyAmount: 0,
                paymentStatus: 'PENDING',
            });
            setSelectedDispatch(null);
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedDispatch(null);
    };

    const handlePOChange = (event, value) => {
        const selectedPO = value;
        if (selectedPO) {
            setFormData(prev => ({
                ...prev,
                purchaseOrderId: selectedPO.id,
                selectedPOItem: null, // Reset item selection
                materialType: '',
                pricePerTon: '',
                buyer: selectedPO.buyerName || '',
                destination: selectedPO.destination || ''
            }));
        } else {
            setFormData(prev => ({ ...prev, purchaseOrderId: null, selectedPOItem: null, buyer: '', destination: '' }));
        }
    };

    const handlePOItemSelect = (event, value) => {
        const selectedItem = value;
        if (selectedItem) {
            setFormData(prev => ({
                ...prev,
                selectedPOItem: selectedItem,
                materialType: selectedItem.itemName,
                pricePerTon: selectedItem.unitPrice.toString(),
            }));
        }
    };

    const calculatePayment = (transportPrice, tonnage, royalty) => {
        const totalTransportValue = parseFloat(transportPrice) * parseFloat(tonnage) || 0;
        const royaltyAmount = parseFloat(royalty) || 0;

        setFormData(prev => ({
            ...prev,
            totalTransportValue,
            royaltyAmount,
        }));
    };

    const handleTransportPriceChange = (e) => {
        const transportPrice = e.target.value;
        setFormData(prev => {
            const newData = { ...prev, transportPricePerTon: transportPrice };
            if (prev.tonnage) {
                calculatePayment(transportPrice, prev.tonnage, prev.royaltyAmount);
            }
            return newData;
        });
    };

    const handleTonnageChange = (e) => {
        const tonnage = e.target.value;
        setFormData(prev => {
            const newData = { ...prev, tonnage };
            if (prev.transportPricePerTon) {
                calculatePayment(prev.transportPricePerTon, tonnage, prev.royaltyAmount);
            }
            return newData;
        });
    };

    const handleRoyaltyChange = (e) => {
        const royalty = e.target.value;
        setFormData(prev => {
            const newData = { ...prev, royaltyAmount: royalty };
            if (prev.transportPricePerTon && prev.tonnage) {
                calculatePayment(prev.transportPricePerTon, prev.tonnage, royalty);
            }
            return newData;
        });
    };

    const handleSave = async () => {
        try {
            if (selectedDispatch) {
                await api.put(`/dispatch/${selectedDispatch.id}`, {
                    royaltyAmount: formData.royaltyAmount,
                    paymentStatus: formData.paymentStatus,
                });
                showSnackbar('Dispatch updated successfully', 'success');
            } else {
                await api.post('/dispatch', formData);
                showSnackbar('Dispatch created successfully', 'success');
            }
            handleCloseDialog();
            fetchDispatches();
        } catch (error) {
            showSnackbar(error.response?.data?.message || 'Operation failed', 'error');
        }
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/dispatch/${selectedDispatch.id}`);
            showSnackbar('Dispatch deleted successfully', 'success');
            setDeleteDialog(false);
            setSelectedDispatch(null);
            fetchDispatches();
        } catch (error) {
            showSnackbar('Failed to delete', 'error');
        }
    };

    const handleView = (dispatch) => {
        setSelectedDispatch(dispatch);
        setViewDialog(true);
    };

    const showSnackbar = (message, severity) => {
        setSnackbar({ open: true, message, severity });
    };

    const getPaymentStatusColor = (status) => {
        const colors = {
            PENDING: 'warning',
            PARTIAL_PAID: 'info',
            PAID: 'success',
        };
        return colors[status] || 'default';
    };

    const columns = [
        { id: 'date', label: 'Date', minWidth: 120, format: (val) => new Date(val).toLocaleDateString() },
        { id: 'truckNumber', label: 'Truck #', minWidth: 120 },
        { id: 'materialType', label: 'Material', minWidth: 130 },
        { id: 'tonnage', label: 'Weight (tons)', align: 'right', minWidth: 130 },
        {
            id: 'poNumber', // Virtual col
            label: 'PO Number',
            minWidth: 150,
            format: (val, row) => row.purchaseOrder ? (
                <Chip
                    label={row.purchaseOrder.poNumber}
                    size="small"
                    color="primary"
                    variant="outlined"
                />
            ) : '-'
        },
        {
            id: 'netRemaining',
            label: 'Net Remaining',
            align: 'right',
            minWidth: 150,
            format: (val, row) => {
                const totalTrans = row.totalTransportValue || 0;
                const royalty = row.royaltyAmount || 0;
                return formatCurrency(totalTrans - royalty);
            }
        },
        {
            id: 'paymentStatus',
            label: 'Payment Status',
            minWidth: 160,
            format: (val) => (
                <Chip
                    label={val.replace('_', ' ')}
                    size="small"
                    color={getPaymentStatusColor(val)}
                />
            )
        },
        {
            id: 'actions',
            label: 'Actions',
            align: 'center',
            minWidth: 140,
            format: (val, row) => (
                <>
                    <IconButton size="small" onClick={() => handleView(row)}>
                        <ViewIcon />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleOpenDialog(row)}>
                        <EditIcon />
                    </IconButton>
                    <IconButton size="small" onClick={() => { setSelectedDispatch(row); setDeleteDialog(true); }}>
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
                    Truck Dispatch Management
                </Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
                    New Dispatch
                </Button>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <AdvancedTable
                    columns={columns}
                    data={dispatches}
                    title="All Dispatch Logs"
                    searchableFields={['truckNumber', 'materialType', 'destination', 'buyer', 'paymentStatus']}
                />
            )}

            {/* Create/Edit Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle>{selectedDispatch ? 'Edit' : 'Create'} Dispatch Log</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        {/* PO Selection */}
                        <Grid item xs={12} sm={6}>
                            <Autocomplete
                                options={purchaseOrders}
                                getOptionLabel={(option) => `${option.poNumber} - ${option.buyerName || 'Unknown Buyer'}`}
                                renderInput={(params) => (
                                    <TextField {...params} label="Select Purchase Order" />
                                )}
                                onChange={handlePOChange}
                                value={purchaseOrders.find(po => po.id === formData.purchaseOrderId) || null}
                            />
                        </Grid>

                        {/* PO Items Selection */}
                        {formData.purchaseOrderId && (
                            <Grid item xs={12} sm={6}>
                                <Autocomplete
                                    options={purchaseOrders.find(po => po.id === formData.purchaseOrderId)?.items || []}
                                    getOptionLabel={(option) => `${option.itemName} (₹${option.unitPrice}/ton)`}
                                    renderInput={(params) => (
                                        <TextField {...params} label="Select PO Item" />
                                    )}
                                    onChange={handlePOItemSelect}
                                    value={formData.selectedPOItem || null}
                                    disabled={!formData.purchaseOrderId}
                                />
                            </Grid>
                        )}

                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Date" type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} InputLabelProps={{ shrink: true }} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Truck Number" value={formData.truckNumber} onChange={(e) => setFormData({ ...formData, truckNumber: e.target.value })} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Material Type" value={formData.materialType} onChange={(e) => setFormData({ ...formData, materialType: e.target.value })} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Weight (Tons)" type="number" value={formData.tonnage} onChange={handleTonnageChange} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth label="Destination" value={formData.destination} onChange={(e) => setFormData({ ...formData, destination: e.target.value })} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Buyer" value={formData.buyer} onChange={(e) => setFormData({ ...formData, buyer: e.target.value })} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Price Per Ton (from PO)" value={formData.pricePerTon} InputProps={{ readOnly: true }} />
                        </Grid>

                        {/* Transport & Payment Section */}
                        <Grid item xs={12}>
                            <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2, mb: 1, color: 'primary.main' }}>
                                Transport & Payment Details
                            </Typography>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Transport Price Per Ton"
                                type="number"
                                value={formData.transportPricePerTon}
                                onChange={handleTransportPriceChange}
                                helperText="Enter transport rate per ton"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Total Transport Value"
                                value={formatCurrency(formData.totalTransportValue)}
                                InputProps={{ readOnly: true }}
                                sx={{ backgroundColor: '#f5f5f5' }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Royalty Amount"
                                type="number"
                                value={formData.royaltyAmount}
                                onChange={handleRoyaltyChange}
                                helperText="Amount deducted as royalty"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Net Remaining"
                                value={formatCurrency((formData.totalTransportValue || 0) - (formData.royaltyAmount || 0))}
                                InputProps={{ readOnly: true }}
                                sx={{ backgroundColor: '#e8f5e9' }}
                                helperText="Total Transport Value - Royalty Amount"
                            />
                        </Grid>

                        {/* Payment Status */}

                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Payment Status</InputLabel>
                                <Select
                                    value={formData.paymentStatus}
                                    label="Payment Status"
                                    onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                                >
                                    <MenuItem value="PENDING">Pending</MenuItem>
                                    <MenuItem value="PARTIAL_PAID">Partial Paid</MenuItem>
                                    <MenuItem value="PAID">Paid</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleSave} variant="contained">{selectedDispatch ? 'Update' : 'Create'}</Button>
                </DialogActions>
            </Dialog>

            {/* View Dialog */}
            <Dialog open={viewDialog} onClose={() => setViewDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>Dispatch Details</DialogTitle>
                <DialogContent>
                    {selectedDispatch && (
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}><Typography><strong>Date:</strong> {new Date(selectedDispatch.date).toLocaleDateString()}</Typography></Grid>
                            <Grid item xs={12} sm={6}><Typography><strong>Truck:</strong> {selectedDispatch.truckNumber}</Typography></Grid>
                            <Grid item xs={12}><Typography><strong>Material:</strong> {selectedDispatch.materialType}</Typography></Grid>
                            <Grid item xs={12} sm={6}><Typography><strong>Weight:</strong> {selectedDispatch.tonnage} tons</Typography></Grid>
                            <Grid item xs={12} sm={6}><Typography><strong>Destination:</strong> {selectedDispatch.destination}</Typography></Grid>
                            {selectedDispatch.purchaseOrder && (
                                <>
                                    <Grid item xs={12}><Typography><strong>Purchase Order:</strong> {selectedDispatch.purchaseOrder.poNumber}</Typography></Grid>
                                    <Grid item xs={12}><Typography><strong>Buyer:</strong> {selectedDispatch.purchaseOrder.buyerName}</Typography></Grid>
                                </>
                            )}
                            <Grid item xs={12}><Typography><strong>Price Per Ton:</strong> ₹{selectedDispatch.pricePerTon}</Typography></Grid>
                            <Grid item xs={12}><Typography><strong>Total Revenue:</strong> {formatCurrency(selectedDispatch.totalRevenue)}</Typography></Grid>

                            <Grid item xs={12} sx={{ mt: 2, pt: 2, borderTop: '2px solid #f0f0f0' }}>
                                <Typography variant="subtitle1" fontWeight="bold" color="primary">Payment Details</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}><Typography><strong>Transport Rate:</strong> ₹{selectedDispatch.transportPricePerTon}/ton</Typography></Grid>
                            <Grid item xs={12} sm={6}><Typography><strong>Total Transport Value:</strong> {formatCurrency(selectedDispatch.totalTransportValue)}</Typography></Grid>
                            <Grid item xs={12} sm={6}><Typography><strong>Royalty Amount:</strong> {formatCurrency(selectedDispatch.royaltyAmount)}</Typography></Grid>
                            <Grid item xs={12} sm={6}><Typography><strong>Net Remaining:</strong> {formatCurrency((selectedDispatch.totalTransportValue || 0) - (selectedDispatch.royaltyAmount || 0))}</Typography></Grid>
                            <Grid item xs={12}>
                                <Typography><strong>Payment Status:</strong> </Typography>
                                <Chip label={selectedDispatch.paymentStatus.replace('_', ' ')} color={getPaymentStatusColor(selectedDispatch.paymentStatus)} size="small" />
                            </Grid>
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
                    <Typography>Are you sure you want to delete this dispatch log?</Typography>
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

export default Dispatch;
