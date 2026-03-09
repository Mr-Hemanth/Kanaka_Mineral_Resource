import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Grid, MenuItem, Chip
} from '@mui/material';
import { Add as AddIcon, Calculate as CalcIcon } from '@mui/icons-material';
import api from '../utils/api';
import AdvancedTable from '../components/AdvancedTable';

const WorkerRoles = ['DRILLER', 'LOADER', 'CHECKER', 'ELECTRICIAN', 'MECHANIC', 'DRIVER', 'OTHER'];
const WorkerStatuses = ['ACTIVE', 'INACTIVE'];

const Workers = () => {
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Worker Form
    const [openWorkerForm, setOpenWorkerForm] = useState(false);
    const [workerFormData, setWorkerFormData] = useState({
        name: '', role: 'OTHER', contact: '', status: 'ACTIVE'
    });

    // Log Form
    const [openLogForm, setOpenLogForm] = useState(false);
    const [selectedWorker, setSelectedWorker] = useState(null);
    const [logFormData, setLogFormData] = useState({
        date: new Date().toISOString().split('T')[0], inTime: '', outTime: '', workType: '', advancePayment: '', balancePayment: '', totalPayment: ''
    });

    useEffect(() => {
        fetchWorkers();
    }, []);

    const fetchWorkers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/workers');
            setWorkers(response.data);
        } catch (error) {
            console.error('Error fetching workers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleWorkerSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/workers', workerFormData);
            setOpenWorkerForm(false);
            setWorkerFormData({ name: '', role: 'OTHER', contact: '', status: 'ACTIVE' });
            fetchWorkers();
        } catch (error) {
            console.error('Error adding worker:', error);
        }
    };

    const handleLogSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/worker-logs', { ...logFormData, workerId: selectedWorker.id });
            setOpenLogForm(false);
            setLogFormData({ date: new Date().toISOString().split('T')[0], inTime: '', outTime: '', workType: '', advancePayment: '', balancePayment: '', totalPayment: '' });
            fetchWorkers();
        } catch (error) {
            console.error('Error adding log:', error);
        }
    };

    const handlePaymentCalc = (field, value) => {
        const newData = { ...logFormData, [field]: value };
        const adv = parseFloat(newData.advancePayment) || 0;
        const bal = parseFloat(newData.balancePayment) || 0;
        newData.totalPayment = (adv + bal).toString();
        setLogFormData(newData);
    };

    const workerColumns = [
        { id: 'name', label: 'Worker Name', minWidth: 150, format: (val) => <span style={{ fontWeight: 500 }}>{val}</span> },
        { id: 'role', label: 'Role', minWidth: 120, format: (val) => <Chip label={val} size="small" color="primary" variant="outlined" /> },
        { id: 'contact', label: 'Contact', minWidth: 130 },
        {
            id: 'status',
            label: 'Status',
            minWidth: 100,
            format: (val) => (
                <Chip
                    label={val}
                    color={val === 'ACTIVE' ? 'success' : 'default'}
                    size="small"
                />
            )
        },
        {
            id: 'actions',
            label: 'Actions',
            align: 'right',
            minWidth: 120,
            format: (val, row) => (
                <Button
                    size="small"
                    variant="contained"
                    onChange={console.log}
                    onClick={() => { setSelectedWorker(row); setOpenLogForm(true); }}
                >
                    Log Work
                </Button>
            )
        }
    ];

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenWorkerForm(true)}>
                    Add Worker
                </Button>
            </Box>

            {!loading && (
                <AdvancedTable
                    columns={workerColumns}
                    data={workers}
                    title="Worker Directory"
                    searchableFields={['name', 'role', 'contact']}
                />
            )}

            {/* Add Worker Dialog */}
            <Dialog open={openWorkerForm} onClose={() => setOpenWorkerForm(false)} maxWidth="sm" fullWidth>
                <form onSubmit={handleWorkerSubmit}>
                    <DialogTitle>Add New Worker</DialogTitle>
                    <DialogContent dividers>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth label="Full Name" required
                                    value={workerFormData.name}
                                    onChange={(e) => setWorkerFormData({ ...workerFormData, name: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    select fullWidth label="Role" required
                                    value={workerFormData.role}
                                    onChange={(e) => setWorkerFormData({ ...workerFormData, role: e.target.value })}
                                >
                                    {WorkerRoles.map(pt => <MenuItem key={pt} value={pt}>{pt}</MenuItem>)}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth label="Contact Number"
                                    value={workerFormData.contact}
                                    onChange={(e) => setWorkerFormData({ ...workerFormData, contact: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    select fullWidth label="Status" required
                                    value={workerFormData.status}
                                    onChange={(e) => setWorkerFormData({ ...workerFormData, status: e.target.value })}
                                >
                                    {WorkerStatuses.map(pt => <MenuItem key={pt} value={pt}>{pt}</MenuItem>)}
                                </TextField>
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenWorkerForm(false)}>Cancel</Button>
                        <Button type="submit" variant="contained">Save</Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* Add Worker Log Dialog */}
            <Dialog open={openLogForm} onClose={() => setOpenLogForm(false)} maxWidth="sm" fullWidth>
                <form onSubmit={handleLogSubmit}>
                    <DialogTitle>Log Daily Work: {selectedWorker?.name}</DialogTitle>
                    <DialogContent dividers>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth type="date" label="Date" required
                                    InputLabelProps={{ shrink: true }}
                                    value={logFormData.date}
                                    onChange={(e) => setLogFormData({ ...logFormData, date: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth label="Work Type/Description" required
                                    value={logFormData.workType}
                                    onChange={(e) => setLogFormData({ ...logFormData, workType: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth type="time" label="In Time"
                                    InputLabelProps={{ shrink: true }}
                                    value={logFormData.inTime}
                                    onChange={(e) => setLogFormData({ ...logFormData, inTime: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth type="time" label="Out Time"
                                    InputLabelProps={{ shrink: true }}
                                    value={logFormData.outTime}
                                    onChange={(e) => setLogFormData({ ...logFormData, outTime: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    fullWidth type="number" label="Advance" required
                                    value={logFormData.advancePayment}
                                    onChange={(e) => handlePaymentCalc('advancePayment', e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    fullWidth type="number" label="Balance" required
                                    value={logFormData.balancePayment}
                                    onChange={(e) => handlePaymentCalc('balancePayment', e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    fullWidth type="number" label="Total" disabled
                                    value={logFormData.totalPayment}
                                    InputProps={{ style: { fontWeight: 'bold' } }}
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenLogForm(false)}>Cancel</Button>
                        <Button type="submit" variant="contained">Save Log</Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Box>
    );
};

export default Workers;
