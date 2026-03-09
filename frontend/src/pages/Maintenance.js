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
import AdvancedTable from '../components/AdvancedTable';

const Maintenance = () => {
    const [records, setRecords] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [machines, setMachines] = useState([]);
    const [inventoryItems, setInventoryItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);

    // Form State
    const [maintenanceType, setMaintenanceType] = useState('vehicle'); // 'vehicle' or 'machine'
    const [formData, setFormData] = useState({
        vehicleId: '',
        machineId: '',
        inventoryItemId: '',
        quantityUsed: '',
        partReplaced: '',
        cost: '',
        nextMaintenanceDue: '',
    });

    const fetchData = async () => {
        try {
            const [mRes, vRes, machRes, invRes] = await Promise.all([
                api.get('/maintenance'),
                api.get('/vehicles'),
                api.get('/machines'),
                api.get('/inventory?category=SPARE_PARTS')
            ]);
            const mappedRecords = mRes.data.map(rec => ({
                ...rec,
                targetName: rec.vehicle ? `Vehicle: ${rec.vehicle.vehicleNumber}` :
                    rec.machine ? `Machine: ${rec.machine.name}` : 'Unknown',
                partInfo: rec.inventoryItem ? `${rec.partReplaced} [${rec.quantityUsed}x ${rec.inventoryItem.name}]` : rec.partReplaced,
            }));
            setRecords(mappedRecords);
            setVehicles(vRes.data);
            setMachines(machRes.data);
            setInventoryItems(invRes.data);
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
        setFormData({ vehicleId: '', machineId: '', inventoryItemId: '', quantityUsed: '', partReplaced: '', cost: '', nextMaintenanceDue: '' });
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

    const columns = [
        { id: 'date', label: 'Date', minWidth: 100, format: (val) => new Date(val).toLocaleDateString() },
        {
            id: 'targetName',
            label: 'Asset',
            minWidth: 150,
            format: (val) => <span style={{ fontWeight: 500 }}>{val || '-'}</span>
        },
        { id: 'partInfo', label: 'Service / Parts Used', minWidth: 200 },
        {
            id: 'cost',
            label: 'Cost',
            align: 'right',
            minWidth: 120,
            format: (val) => <span style={{ fontWeight: 'bold', color: '#d32f2f' }}>{formatCurrency(val)}</span>
        },
        {
            id: 'nextMaintenanceDue',
            label: 'Next Due',
            minWidth: 120,
            format: (val) => val ? new Date(val).toLocaleDateString() : '-'
        },
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
                    Log Maintenance
                </Button>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4, mt: 3 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <AdvancedTable
                    columns={columns}
                    data={records}
                    title="Maintenance Logs"
                    searchableFields={['targetName', 'partInfo']}
                />
            )}

            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <form onSubmit={handleSubmit}>
                    <DialogTitle>Log Maintenance / Spare Parts</DialogTitle>
                    <DialogContent>
                        <TextField
                            select
                            margin="dense"
                            label="Maintenance For"
                            fullWidth
                            value={maintenanceType}
                            onChange={(e) => {
                                setMaintenanceType(e.target.value);
                                setFormData({ ...formData, vehicleId: '', machineId: '' });
                            }}
                            sx={{ mb: 2 }}
                        >
                            <MenuItem value="vehicle">Vehicle</MenuItem>
                            <MenuItem value="machine">Machine</MenuItem>
                        </TextField>

                        {maintenanceType === 'vehicle' ? (
                            <TextField
                                select margin="dense" label="Select Vehicle" fullWidth required
                                value={formData.vehicleId}
                                onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                            >
                                {vehicles.map(v => <MenuItem key={v.id} value={v.id}>{v.vehicleNumber} ({v.vehicleType})</MenuItem>)}
                            </TextField>
                        ) : (
                            <TextField
                                select margin="dense" label="Select Machine" fullWidth required
                                value={formData.machineId}
                                onChange={(e) => setFormData({ ...formData, machineId: e.target.value })}
                            >
                                {machines.map(m => <MenuItem key={m.id} value={m.id}>{m.name} ({m.type})</MenuItem>)}
                            </TextField>
                        )}

                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, mb: 1 }}>
                            Optional: Select a spare part from Inventory to deduct stock automatically.
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                select margin="dense" label="Inventory Item (Spare Part)" fullWidth
                                value={formData.inventoryItemId}
                                onChange={(e) => setFormData({ ...formData, inventoryItemId: e.target.value })}
                            >
                                <MenuItem value=""><em>None Selected</em></MenuItem>
                                {inventoryItems.map(item => (
                                    <MenuItem key={item.id} value={item.id}>
                                        {item.itemName} ({item.quantity} {item.unit} left @ ₹{item.lastPurchasePrice || 0}/{item.unit})
                                    </MenuItem>
                                ))}
                            </TextField>

                            {formData.inventoryItemId && (
                                <TextField
                                    type="number" margin="dense" label="Qty Used" sx={{ width: '120px' }}
                                    value={formData.quantityUsed}
                                    onChange={(e) => setFormData({ ...formData, quantityUsed: e.target.value })}
                                />
                            )}
                        </Box>

                        <TextField
                            margin="dense" label="Service Performed / Issue Details" fullWidth required
                            value={formData.partReplaced}
                            onChange={(e) => setFormData({ ...formData, partReplaced: e.target.value })}
                        />
                        <TextField
                            type="number" margin="dense" label="Labor / Additional Cost" fullWidth
                            helperText={formData.inventoryItemId ? "Cost of the spare part will be added automatically." : ""}
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
