import React, { useEffect, useState } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, IconButton, Button, Dialog, DialogTitle,
    DialogContent, DialogActions, TextField, Grid, Chip, Alert,
    CircularProgress, Snackbar, MenuItem, Select, FormControl, InputLabel,
    Card, CardContent, Badge, Divider, Autocomplete, Avatar, Tooltip,
} from '@mui/material';
import {
    Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
    Visibility as ViewIcon, Warning as WarningIcon, Cancel as CancelIcon, 
    Assessment as AssessmentIcon, CalendarToday as CalendarIcon, 
    LocationOn as LocationIcon, Person as PersonIcon, Business as BusinessIcon, 
    AccessTime as AccessTimeIcon, Security as SecurityIcon, Engineering as EngineeringIcon, 
    TrendingUp as TrendingIcon, Gavel as BlastIcon, CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

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
    
    // Search & Filter
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [siteFilter, setSiteFilter] = useState(null);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
    
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
    }, [pagination.page, search, statusFilter, siteFilter]);

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
            const params = {
                page: pagination.page,
                limit: pagination.limit,
                search,
                status: statusFilter,
                siteId: siteFilter?.id || '',
            };
            const response = await api.get('/blasting', { params });
            setRecords(response.data.data);
            setPagination(prev => ({
                ...prev,
                total: response.data.total,
                totalPages: response.data.totalPages,
            }));
            setLoading(false);
        } catch (error) {
            showSnackbar('Failed to load blast records', 'error');
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

    const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);

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

            {/* Filters */}
            <Paper elevation={0} sx={{ 
                p: 3, 
                mb: 3,
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                border: '1px solid rgba(0,0,0,0.08)'
            }}>
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            fullWidth
                            label="Search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Blast #, Location..."
                            InputProps={{
                                startAdornment: <Box sx={{ mr: 1, color: 'text.secondary' }}>🔍</Box>,
                            }}
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth>
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={statusFilter}
                                label="Status"
                                onChange={(e) => setStatusFilter(e.target.value)}
                                startAdornment={<Box sx={{ mr: 1 }}>📊</Box>}
                            >
                                <MenuItem value="ALL">All Status</MenuItem>
                                <MenuItem value="PLANNED">Planned</MenuItem>
                                <MenuItem value="COMPLETED">Completed</MenuItem>
                                <MenuItem value="CANCELLED">Cancelled</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Autocomplete
                            options={sites}
                            getOptionLabel={(option) => option.siteName}
                            renderInput={(params) => (
                                <TextField 
                                    {...params} 
                                    label="Filter by Site" 
                                    InputProps={{
                                        ...params.InputProps,
                                        startAdornment: (
                                            <Box sx={{ mr: 1, color: 'text.secondary' }}>🏢</Box>
                                        ),
                                    }}
                                />
                            )}
                            value={siteFilter}
                            onChange={(e, v) => setSiteFilter(v)}
                            clearText="Clear Site"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        {canAdd && (
                            <Button
                                fullWidth
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => handleOpenDialog()}
                                sx={{ 
                                    height: '56px',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                                    '&:hover': {
                                        boxShadow: '0 6px 20px rgba(102, 126, 234, 0.5)',
                                        transform: 'translateY(-2px)',
                                    },
                                }}
                            >
                                New Blast Record
                            </Button>
                        )}
                    </Grid>
                </Grid>
            </Paper>

            {/* Records Table */}
            <Paper elevation={0} sx={{ 
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                border: '1px solid rgba(0,0,0,0.08)',
                overflow: 'hidden'
            }}>
                {loading ? (
                    <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        p: 8,
                        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                        borderRadius: 3
                    }}>
                        <CircularProgress size={40} thickness={4} />
                    </Box>
                ) : (
                    <TableContainer>
                        <Table>
                            <TableHead sx={{ 
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            }}>
                                <TableRow>
                                    {[
                                        { label: 'Date', icon: '📅' },
                                        { label: 'Blast #', icon: '💥' },
                                        { label: 'Location', icon: '📍' },
                                        { label: 'Site', icon: '🏢' },
                                        { label: 'Holes', icon: '⚙️' },
                                        { label: 'Explosive (kg)', icon: '🧨' },
                                        { label: 'Volume (m³)', icon: '📊' },
                                        { label: 'Status', icon: '✅' },
                                        { label: 'Actions', icon: '🔧' },
                                    ].map((col) => (
                                        <TableCell 
                                            key={col.label}
                                            sx={{ 
                                                fontWeight: 'bold',
                                                color: 'white',
                                                fontSize: '0.9rem',
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <span>{col.icon}</span>
                                                {col.label}
                                            </Box>
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {records.map((record, index) => (
                                    <TableRow 
                                        key={record.id} 
                                        hover
                                        sx={{
                                            '&:hover': {
                                                backgroundColor: '#f5f7fa',
                                                transform: 'scale(1.005)',
                                                transition: 'all 0.2s ease-in-out',
                                            },
                                            backgroundColor: index % 2 === 0 ? '#ffffff' : '#fafbfc',
                                        }}
                                    >
                                        <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>{record.blastNumber}</TableCell>
                                        <TableCell>{record.location}</TableCell>
                                        <TableCell>{record.site?.siteName || '-'}</TableCell>
                                        <TableCell>{record.totalHoles}</TableCell>
                                        <TableCell>{record.explosiveUsed} kg</TableCell>
                                        <TableCell>{record.volumeBlasted} m³</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={record.status}
                                                size="small"
                                                color={getStatusColor(record.status)}
                                                icon={
                                                    record.status === 'COMPLETED' ? <CheckCircleIcon fontSize="small" /> :
                                                    record.status === 'PLANNED' ? <WarningIcon fontSize="small" /> :
                                                    <CancelIcon fontSize="small" />
                                                }
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                                                <Tooltip title="View Details" placement="left">
                                                    <IconButton 
                                                        size="small" 
                                                        onClick={() => handleView(record)}
                                                        sx={{
                                                            color: '#667eea',
                                                            '&:hover': { 
                                                                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                                                                transform: 'scale(1.1)',
                                                            },
                                                        }}
                                                    >
                                                        <ViewIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                {canEdit && (
                                                    <Tooltip title="Edit Record" placement="left">
                                                        <IconButton 
                                                            size="small" 
                                                            onClick={() => handleOpenDialog(record)}
                                                            sx={{
                                                                color: '#f59e0b',
                                                                '&:hover': { 
                                                                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                                                                    transform: 'scale(1.1)',
                                                                },
                                                            }}
                                                        >
                                                            <EditIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                                {canDelete && (
                                                    <Tooltip title="Delete Record" placement="left">
                                                        <IconButton 
                                                            size="small" 
                                                            color="error"
                                                            onClick={() => { setSelectedRecord(record); setDeleteDialog(true); }}
                                                            sx={{
                                                                '&:hover': { 
                                                                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                                                    transform: 'scale(1.1)',
                                                                },
                                                            }}
                                                        >
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {records.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={9} align="center">
                                            <Alert severity="info">No blast records found</Alert>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>

            {/* Pagination */}
            <Paper elevation={0} sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                p: 2,
                mt: 2,
                borderRadius: 3,
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                border: '1px solid rgba(0,0,0,0.08)'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <AssessmentIcon sx={{ color: '#667eea' }} />
                    <Typography variant="body2" fontWeight="bold">
                        Showing {records.length > 0 ? ((pagination.page - 1) * pagination.limit) + 1 : 0} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} records
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                        disabled={pagination.page === 1}
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                        variant="outlined"
                        startIcon={<span>←</span>}
                        sx={{
                            borderRadius: 2,
                            '&:hover': {
                                transform: 'translateX(-2px)',
                                transition: 'all 0.2s',
                            },
                        }}
                    >
                        Previous
                    </Button>
                    <Button
                        disabled={pagination.page >= pagination.totalPages}
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                        variant="contained"
                        endIcon={<span>→</span>}
                        sx={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            borderRadius: 2,
                            '&:hover': {
                                transform: 'translateX(2px)',
                                transition: 'all 0.2s',
                            },
                        }}
                    >
                        Next
                    </Button>
                </Box>
            </Paper>

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
