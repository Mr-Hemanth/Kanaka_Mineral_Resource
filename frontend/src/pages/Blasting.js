import React, { useEffect, useState } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, IconButton, Button, Dialog, DialogTitle,
    DialogContent, DialogActions, TextField, Grid, Chip, Alert,
    CircularProgress, Snackbar, MenuItem, Select, FormControl, InputLabel,
    Divider, Autocomplete, Avatar, Tooltip,
} from '@mui/material';
import {
    Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
    Visibility as ViewIcon, Warning as WarningIcon, Cancel as CancelIcon,
    Assessment as AssessmentIcon, Gavel as BlastIcon, CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import AdvancedTable from '../components/AdvancedTable';

const Blasting = () => {
    const { user } = useAuth();
    const [records, setRecords] = useState([]);
    const [sites, setSites] = useState([]);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [loading, setLoading] = useState(true);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // Permission checks
    const isAdmin = user?.role === 'ADMIN';
    const isSupervisor = user?.role === 'SUPERVISOR';
    const canEdit = isAdmin;  // Only Admin can edit
    const canDelete = isAdmin;  // Only Admin can delete
    const canAdd = isAdmin || isSupervisor;  // Admin & Supervisor can add

    // Dialogs
    const [recordDialog, setRecordDialog] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [viewDialog, setViewDialog] = useState(false);

    const [totalItems, setTotalItems] = useState(0);

    // Form
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        siteId: null,
        blastNumber: '',
        location: '',
        totalHoles: '',
        holeDepth: '',
        explosiveUsed: '',
        detonatorCount: '',
        powderFactor: '',
        volumeBlasted: '',
        chargePerHole: '',
        stemmingLength: '',
        blastingTime: new Date().toISOString(),
        supervisor: '',
        agency: '',
        weatherCondition: '',
        vibrationLevel: '',
        flyrockDistance: '',
        safetyMeasures: '',
        remarks: '',
        status: 'COMPLETED',
    });

    useEffect(() => {
        fetchSites();
        fetchRecords();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchSites = async () => {
        try {
            const response = await api.get('/sites');
            setSites(response.data);
        } catch (error) {
            console.error('Failed to load sites');
        }
    };

    const fetchRecords = async () => {
        try {
            setLoading(true);
            const params = { limit: 1000 };
            const response = await api.get('/blasting', { params });
            if (response.data.data) {
                setRecords(response.data.data);
                setTotalItems(response.data.pagination?.totalItems || response.data.data.length);
            } else {
                setRecords(response.data);
                setTotalItems(response.data.length);
            }
        } catch (error) {
            showSnackbar('Failed to load blast records', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (record = null) => {
        if (record) {
            setFormData({
                date: new Date(record.date).toISOString().split('T')[0],
                siteId: record.siteId,
                blastNumber: record.blastNumber,
                location: record.location,
                totalHoles: record.totalHoles.toString(),
                holeDepth: record.holeDepth.toString(),
                explosiveUsed: record.explosiveUsed.toString(),
                detonatorCount: record.detonatorCount.toString(),
                powderFactor: record.powderFactor.toString(),
                volumeBlasted: record.volumeBlasted.toString(),
                chargePerHole: record.chargePerHole.toString(),
                stemmingLength: record.stemmingLength?.toString() || '',
                blastingTime: record.blastingTime ? new Date(record.blastingTime).toISOString() : new Date().toISOString(),
                supervisor: record.supervisor || '',
                agency: record.agency || '',
                weatherCondition: record.weatherCondition || '',
                vibrationLevel: record.vibrationLevel?.toString() || '',
                flyrockDistance: record.flyrockDistance?.toString() || '',
                safetyMeasures: record.safetyMeasures || '',
                remarks: record.remarks || '',
                status: record.status,
            });
        } else {
            setFormData({
                date: new Date().toISOString().split('T')[0],
                siteId: null,
                blastNumber: `BLAST-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`,
                location: '',
                totalHoles: '',
                holeDepth: '',
                explosiveUsed: '',
                detonatorCount: '',
                powderFactor: '',
                volumeBlasted: '',
                chargePerHole: '',
                stemmingLength: '',
                blastingTime: new Date().toISOString(),
                supervisor: '',
                agency: '',
                weatherCondition: '',
                vibrationLevel: '',
                flyrockDistance: '',
                safetyMeasures: '',
                remarks: '',
                status: 'COMPLETED',
            });
        }
        setSelectedRecord(record);
        setRecordDialog(true);
    };

    const handleSaveRecord = async () => {
        try {
            if (selectedRecord) {
                await api.put(`/blasting/${selectedRecord.id}`, formData);
                showSnackbar('Blast record updated successfully', 'success');
            } else {
                await api.post('/blasting', formData);
                showSnackbar('Blast record created successfully', 'success');
            }
            setRecordDialog(false);
            fetchRecords();
        } catch (error) {
            showSnackbar(error.response?.data?.message || 'Operation failed', 'error');
        }
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/blasting/${selectedRecord.id}`);
            showSnackbar('Blast record deleted successfully', 'success');
            setDeleteDialog(false);
            fetchRecords();
        } catch (error) {
            showSnackbar('Failed to delete', 'error');
        }
    };

    const handleView = (record) => {
        setSelectedRecord(record);
        setViewDialog(true);
    };

    const showSnackbar = (message, severity) => {
        setSnackbar({ open: true, message, severity });
    };

    const getStatusColor = (status) => {
        const colors = {
            PLANNED: 'warning',
            COMPLETED: 'success',
            CANCELLED: 'default',
        };
        return colors[status] || 'default';
    };

    const columns = [
        { id: 'date', label: 'Date', minWidth: 100, format: (val) => new Date(val).toLocaleDateString() },
        { id: 'blastNumber', label: 'Blast #', minWidth: 120, format: (val) => <Typography sx={{ fontWeight: 'bold', color: 'primary.main', fontSize: '0.875rem' }}>{val}</Typography> },
        { id: 'location', label: 'Location', minWidth: 130 },
        { id: 'siteName', label: 'Site', minWidth: 120, format: (val, row) => row.site?.siteName || '-' },
        { id: 'totalHoles', label: 'Holes', minWidth: 90 },
        { id: 'explosiveUsed', label: 'Explosive (kg)', minWidth: 120, format: (val) => `${val}` },
        { id: 'volumeBlasted', label: 'Volume (m³)', minWidth: 120, format: (val) => `${val}` },
        {
            id: 'status',
            label: 'Status',
            minWidth: 130,
            format: (val) => (
                <Chip
                    label={val}
                    size="small"
                    color={getStatusColor(val)}
                    icon={
                        val === 'COMPLETED' ? <CheckCircleIcon fontSize="small" /> :
                            val === 'PLANNED' ? <WarningIcon fontSize="small" /> :
                                <CancelIcon fontSize="small" />
                    }
                />
            )
        },
        {
            id: 'actions',
            label: 'Actions',
            align: 'right',
            minWidth: 150,
            format: (val, row) => (
                <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                    <Tooltip title="View Details" placement="left">
                        <IconButton size="small" onClick={() => handleView(row)} sx={{ color: '#667eea' }}>
                            <ViewIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    {canEdit && (
                        <Tooltip title="Edit Record" placement="left">
                            <IconButton size="small" onClick={() => handleOpenDialog(row)} sx={{ color: '#f59e0b' }}>
                                <EditIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}
                    {canDelete && (
                        <Tooltip title="Delete Record" placement="left">
                            <IconButton size="small" color="error" onClick={() => { setSelectedRecord(row); setDeleteDialog(true); }}>
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}
                </Box>
            )
        }
    ];

    return (
        <Box>
            {/* Page Header */}
            <Box sx={{
                mb: 4,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: 3,
                p: 3,
                boxShadow: '0 10px 40px rgba(102, 126, 234, 0.3)',
                color: 'white'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{
                        bgcolor: 'rgba(255,255,255,0.2)',
                        width: 56,
                        height: 56,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                    }}>
                        <BlastIcon sx={{ fontSize: 32 }} />
                    </Avatar>
                    <Box>
                        <Typography variant="h4" fontWeight="bold" gutterBottom>
                            Blasting Records Management
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            Track and manage all blasting operations with complete details
                        </Typography>
                    </Box>
                </Box>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                {canAdd && (
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpenDialog()}
                        sx={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            '&:hover': {
                                boxShadow: '0 6px 20px rgba(102, 126, 234, 0.5)',
                                transform: 'translateY(-2px)',
                            },
                        }}
                    >
                        New Blast Record
                    </Button>
                )}
            </Box>

            {/* Advanced Table */}
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4, mt: 3 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <AdvancedTable
                    columns={columns}
                    data={records}
                    title="Blasting Records"
                    searchableFields={['blastNumber', 'location', 'status', 'supervisor', 'agency', 'remarks']}
                />
            )}

            {/* Create/Edit Dialog */}
            <Dialog open={recordDialog} onClose={() => setRecordDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>{selectedRecord ? 'Edit' : 'Create'} Blast Record</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        {/* Basic Info */}
                        <Grid item xs={12}><Typography variant="subtitle1" fontWeight="bold" gutterBottom>Basic Information</Typography></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth label="Blast Number" value={formData.blastNumber} onChange={(e) => setFormData({ ...formData, blastNumber: e.target.value })} required /></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth label="Location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} required /></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth label="Date" type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} InputLabelProps={{ shrink: true }} /></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth label="Blasting Time" type="datetime-local" value={formData.blastingTime} onChange={(e) => setFormData({ ...formData, blastingTime: e.target.value })} InputLabelProps={{ shrink: true }} /></Grid>
                        <Grid item xs={12} sm={6}><Autocomplete options={sites} getOptionLabel={(option) => option.siteName} renderInput={(params) => <TextField {...params} label="Site (Optional)" />} value={sites.find(s => s.id === formData.siteId) || null} onChange={(e, v) => setFormData({ ...formData, siteId: v?.id || null })} /></Grid>
                        <Grid item xs={12} sm={6}><FormControl fullWidth><InputLabel>Status</InputLabel><Select value={formData.status} label="Status" onChange={(e) => setFormData({ ...formData, status: e.target.value })}><MenuItem value="PLANNED">Planned</MenuItem><MenuItem value="COMPLETED">Completed</MenuItem><MenuItem value="CANCELLED">Cancelled</MenuItem></Select></FormControl></Grid>

                        {/* Drilling Details */}
                        <Grid item xs={12}><Divider sx={{ my: 1 }} /><Typography variant="subtitle1" fontWeight="bold" gutterBottom>Drilling Details</Typography></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth label="Total Holes" type="number" value={formData.totalHoles} onChange={(e) => setFormData({ ...formData, totalHoles: e.target.value })} /></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth label="Hole Depth (m)" type="number" value={formData.holeDepth} onChange={(e) => setFormData({ ...formData, holeDepth: e.target.value })} /></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth label="Stemming Length (m)" type="number" value={formData.stemmingLength} onChange={(e) => setFormData({ ...formData, stemmingLength: e.target.value })} /></Grid>

                        {/* Explosive Details */}
                        <Grid item xs={12}><Divider sx={{ my: 1 }} /><Typography variant="subtitle1" fontWeight="bold" gutterBottom>Explosive Details</Typography></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth label="Explosive Used (kg)" type="number" value={formData.explosiveUsed} onChange={(e) => setFormData({ ...formData, explosiveUsed: e.target.value })} /></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth label="Detonator Count" type="number" value={formData.detonatorCount} onChange={(e) => setFormData({ ...formData, detonatorCount: e.target.value })} /></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth label="Charge per Hole (kg)" type="number" value={formData.chargePerHole} onChange={(e) => setFormData({ ...formData, chargePerHole: e.target.value })} /></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth label="Powder Factor (kg/m³)" type="number" value={formData.powderFactor} onChange={(e) => setFormData({ ...formData, powderFactor: e.target.value })} /></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth label="Volume Blasted (m³)" type="number" value={formData.volumeBlasted} onChange={(e) => setFormData({ ...formData, volumeBlasted: e.target.value })} /></Grid>

                        {/* Environmental & Safety */}
                        <Grid item xs={12}><Divider sx={{ my: 1 }} /><Typography variant="subtitle1" fontWeight="bold" gutterBottom>Environmental & Safety</Typography></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth label="Weather Condition" value={formData.weatherCondition} onChange={(e) => setFormData({ ...formData, weatherCondition: e.target.value })} placeholder="e.g., Clear, Rainy" /></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth label="Vibration Level" type="number" value={formData.vibrationLevel} onChange={(e) => setFormData({ ...formData, vibrationLevel: e.target.value })} placeholder="mm/s" /></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth label="Flyrock Distance (m)" type="number" value={formData.flyrockDistance} onChange={(e) => setFormData({ ...formData, flyrockDistance: e.target.value })} /></Grid>
                        <Grid item xs={12}><TextField fullWidth label="Safety Measures Taken" multiline rows={2} value={formData.safetyMeasures} onChange={(e) => setFormData({ ...formData, safetyMeasures: e.target.value })} /></Grid>

                        {/* Personnel & Remarks */}
                        <Grid item xs={12}><Divider sx={{ my: 1 }} /><Typography variant="subtitle1" fontWeight="bold" gutterBottom>Personnel & Remarks</Typography></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth label="Supervisor" value={formData.supervisor} onChange={(e) => setFormData({ ...formData, supervisor: e.target.value })} /></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth label="Agency" value={formData.agency} onChange={(e) => setFormData({ ...formData, agency: e.target.value })} placeholder="Blasting agency/company" /></Grid>
                        <Grid item xs={12}><TextField fullWidth label="Remarks" multiline rows={2} value={formData.remarks} onChange={(e) => setFormData({ ...formData, remarks: e.target.value })} /></Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRecordDialog(false)}>Cancel</Button>
                    <Button onClick={handleSaveRecord} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>

            {/* View Dialog */}
            {viewDialog && selectedRecord && (
                <Dialog open={viewDialog} onClose={() => setViewDialog(false)} maxWidth="md" fullWidth>
                    <DialogTitle>Blast Record Details - {selectedRecord.blastNumber}</DialogTitle>
                    <DialogContent>
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid item xs={12}><Typography variant="subtitle1" fontWeight="bold">Basic Information</Typography></Grid>
                            <Grid item xs={6}><Typography variant="body2">Date:</Typography><Typography>{new Date(selectedRecord.date).toLocaleDateString()}</Typography></Grid>
                            <Grid item xs={6}><Typography variant="body2">Location:</Typography><Typography>{selectedRecord.location}</Typography></Grid>
                            <Grid item xs={6}><Typography variant="body2">Site:</Typography><Typography>{selectedRecord.site?.siteName || 'N/A'}</Typography></Grid>
                            <Grid item xs={6}><Typography variant="body2">Status:</Typography><Chip label={selectedRecord.status} size="small" color={getStatusColor(selectedRecord.status)} /></Grid>

                            <Grid item xs={12} sx={{ mt: 2 }}><Typography variant="subtitle1" fontWeight="bold">Drilling & Explosive Details</Typography></Grid>
                            <Grid item xs={6}><Typography variant="body2">Total Holes:</Typography><Typography>{selectedRecord.totalHoles}</Typography></Grid>
                            <Grid item xs={6}><Typography variant="body2">Hole Depth:</Typography><Typography>{selectedRecord.holeDepth} m</Typography></Grid>
                            <Grid item xs={6}><Typography variant="body2">Explosive Used:</Typography><Typography>{selectedRecord.explosiveUsed} kg</Typography></Grid>
                            <Grid item xs={6}><Typography variant="body2">Detonators:</Typography><Typography>{selectedRecord.detonatorCount}</Typography></Grid>
                            <Grid item xs={6}><Typography variant="body2">Powder Factor:</Typography><Typography>{selectedRecord.powderFactor} kg/m³</Typography></Grid>
                            <Grid item xs={6}><Typography variant="body2">Volume Blasted:</Typography><Typography>{selectedRecord.volumeBlasted} m³</Typography></Grid>

                            <Grid item xs={12} sx={{ mt: 2 }}><Typography variant="subtitle1" fontWeight="bold">Environmental Monitoring</Typography></Grid>
                            <Grid item xs={6}><Typography variant="body2">Weather:</Typography><Typography>{selectedRecord.weatherCondition || 'N/A'}</Typography></Grid>
                            <Grid item xs={6}><Typography variant="body2">Vibration:</Typography><Typography>{selectedRecord.vibrationLevel ? `${selectedRecord.vibrationLevel} mm/s` : 'N/A'}</Typography></Grid>
                            <Grid item xs={6}><Typography variant="body2">Flyrock:</Typography><Typography>{selectedRecord.flyrockDistance ? `${selectedRecord.flyrockDistance} m` : 'N/A'}</Typography></Grid>

                            <Grid item xs={12} sx={{ mt: 2 }}><Typography variant="subtitle1" fontWeight="bold">Personnel</Typography></Grid>
                            <Grid item xs={6}><Typography variant="body2">Supervisor:</Typography><Typography>{selectedRecord.supervisor || 'N/A'}</Typography></Grid>
                            <Grid item xs={6}><Typography variant="body2">Agency:</Typography><Typography>{selectedRecord.agency || 'N/A'}</Typography></Grid>

                            {selectedRecord.remarks && (
                                <Grid item xs={12} sx={{ mt: 2 }}><Typography variant="subtitle1" fontWeight="bold">Remarks</Typography><Typography>{selectedRecord.remarks}</Typography></Grid>
                            )}
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setViewDialog(false)}>Close</Button>
                    </DialogActions>
                </Dialog>
            )}

            {/* Delete Confirmation */}
            <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to delete this blast record?</Typography>
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

export default Blasting;
