import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Grid, MenuItem, Chip
} from '@mui/material';
import { Add as AddIcon, Build as BuildIcon } from '@mui/icons-material';
import api from '../utils/api';
import AdvancedTable from '../components/AdvancedTable';

const MachineTypes = ['GENERATOR', 'COMPRESSOR', 'PUMP', 'MIXER', 'CRUSHER', 'OTHER'];
const MachineStatuses = ['OPERATIONAL', 'UNDER_REPAIR', 'OUT_OF_ORDER'];

const Machines = () => {
    const [machines, setMachines] = useState([]);
    const [loading, setLoading] = useState(true);

    // Machine Form
    const [openMachineForm, setOpenMachineForm] = useState(false);
    const [machineFormData, setMachineFormData] = useState({
        name: '', type: 'GENERATOR', model: '', capacity: '', status: 'OPERATIONAL'
    });

    // Log Form
    const [openLogForm, setOpenLogForm] = useState(false);
    const [selectedMachine, setSelectedMachine] = useState(null);
    const [logFormData, setLogFormData] = useState({
        date: new Date().toISOString().split('T')[0], hoursWorked: '', readingStart: '', readingEnd: '', notes: ''
    });

    useEffect(() => {
        fetchMachines();
    }, []);

    const fetchMachines = async () => {
        try {
            setLoading(true);
            const response = await api.get('/machines');
            setMachines(response.data);
        } catch (error) {
            console.error('Error fetching machines:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMachineSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/machines', machineFormData);
            setOpenMachineForm(false);
            setMachineFormData({ name: '', type: 'GENERATOR', model: '', capacity: '', status: 'OPERATIONAL' });
            fetchMachines();
        } catch (error) {
            console.error('Error adding machine:', error);
        }
    };

    const handleLogSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/machine-logs', { ...logFormData, machineId: selectedMachine.id });
            setOpenLogForm(false);
            setLogFormData({ date: new Date().toISOString().split('T')[0], hoursWorked: '', readingStart: '', readingEnd: '', notes: '' });
            fetchMachines(); // Refresh to get updated logs if needed
        } catch (error) {
            console.error('Error adding log:', error);
        }
    };

    const machineColumns = [
        { id: 'name', label: 'Machine Name', minWidth: 150 },
        { id: 'type', label: 'Type', minWidth: 120, format: (val) => <Chip label={val} size="small" /> },
        { id: 'model', label: 'Model/Serial', minWidth: 150 },
        { id: 'capacity', label: 'Capacity', minWidth: 120 },
        {
            id: 'status',
            label: 'Status',
            minWidth: 120,
            format: (val) => (
                <Chip
                    label={val.replace('_', ' ')}
                    color={val === 'OPERATIONAL' ? 'success' : val === 'UNDER_REPAIR' ? 'warning' : 'error'}
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
                    variant="outlined"
                    onChange={console.log}
                    onClick={() => { setSelectedMachine(row); setOpenLogForm(true); }}
                >
                    Add Log
                </Button>
            )
        }
    ];

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenMachineForm(true)}>
                    Add Machine
                </Button>
            </Box>

            {!loading && (
                <AdvancedTable
                    columns={machineColumns}
                    data={machines}
                    title="Machine Master List"
                    searchableFields={['name', 'type', 'model']}
                />
            )}

            {/* Add Machine Dialog */}
            <Dialog open={openMachineForm} onClose={() => setOpenMachineForm(false)} maxWidth="sm" fullWidth>
                <form onSubmit={handleMachineSubmit}>
                    <DialogTitle>Add New Machine</DialogTitle>
                    <DialogContent dividers>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth label="Machine Name" required
                                    value={machineFormData.name}
                                    onChange={(e) => setMachineFormData({ ...machineFormData, name: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    select fullWidth label="Type" required
                                    value={machineFormData.type}
                                    onChange={(e) => setMachineFormData({ ...machineFormData, type: e.target.value })}
                                >
                                    {MachineTypes.map(pt => <MenuItem key={pt} value={pt}>{pt}</MenuItem>)}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth label="Model Number"
                                    value={machineFormData.model}
                                    onChange={(e) => setMachineFormData({ ...machineFormData, model: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth label="Capacity (e.g., 500kVA)"
                                    value={machineFormData.capacity}
                                    onChange={(e) => setMachineFormData({ ...machineFormData, capacity: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    select fullWidth label="Status" required
                                    value={machineFormData.status}
                                    onChange={(e) => setMachineFormData({ ...machineFormData, status: e.target.value })}
                                >
                                    {MachineStatuses.map(pt => <MenuItem key={pt} value={pt}>{pt}</MenuItem>)}
                                </TextField>
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenMachineForm(false)}>Cancel</Button>
                        <Button type="submit" variant="contained">Save</Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* Add Machine Log Dialog */}
            <Dialog open={openLogForm} onClose={() => setOpenLogForm(false)} maxWidth="sm" fullWidth>
                <form onSubmit={handleLogSubmit}>
                    <DialogTitle>Add Log: {selectedMachine?.name}</DialogTitle>
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
                                    fullWidth type="number" label="Hours Worked" required
                                    value={logFormData.hoursWorked}
                                    onChange={(e) => setLogFormData({ ...logFormData, hoursWorked: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth type="number" label="Start Reading"
                                    value={logFormData.readingStart}
                                    onChange={(e) => setLogFormData({ ...logFormData, readingStart: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth type="number" label="End Reading"
                                    value={logFormData.readingEnd}
                                    onChange={(e) => setLogFormData({ ...logFormData, readingEnd: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth label="Notes" multiline rows={3}
                                    value={logFormData.notes}
                                    onChange={(e) => setLogFormData({ ...logFormData, notes: e.target.value })}
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

export default Machines;
