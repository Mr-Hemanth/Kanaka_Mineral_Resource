import React, { useEffect, useState } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, IconButton, Button, Dialog, DialogTitle,
    DialogContent, DialogActions, TextField, Grid, Chip, Alert,
    CircularProgress, Snackbar, MenuItem, Select, FormControl, InputLabel,
    Tabs, Tab, Card, CardContent, Badge, Divider,
} from '@mui/material';
import {
    Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
    Visibility as ViewIcon, Business as BusinessIcon,
    People as PeopleIcon, LocalShipping as VehicleIcon,
    PrecisionManufacturing as MachineIcon, CheckCircle as CheckCircleIcon,
    Warning as WarningIcon, Build as BuildIcon,
} from '@mui/icons-material';
import api from '../utils/api';

const Sites = () => {
    const [sites, setSites] = useState([]);
    const [selectedSite, setSelectedSite] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tabValue, setTabValue] = useState(0);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    
    // Dialogs
    const [siteDialog, setSiteDialog] = useState(false);
    const [staffDialog, setStaffDialog] = useState(false);
    const [vehicleDialog, setVehicleDialog] = useState(false);
    const [machineDialog, setMachineDialog] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [deleteType, setDeleteType] = useState(''); // 'site', 'staff', 'vehicle', 'machine'
    
    // Data
    const [staff, setStaff] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [machines, setMachines] = useState([]);
    
    // Forms
    const [siteForm, setSiteForm] = useState({
        siteName: '',
        location: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        status: 'ACTIVE',
        siteManager: '',
        contactNumber: '',
        description: '',
    });
    
    const [staffForm, setStaffForm] = useState({
        name: '',
        role: 'OTHER',
        phone: '',
        email: '',
        aadharNumber: '',
        notes: '',
    });
    
    const [vehicleForm, setVehicleForm] = useState({
        vehicleNumber: '',
        vehicleType: 'OTHER',
        driverName: '',
        driverPhone: '',
        fuelLevel: 100,
        hoursWorked: 0,
        lastService: new Date().toISOString().split('T')[0],
        notes: '',
    });
    
    const [machineForm, setMachineForm] = useState({
        machineName: '',
        machineType: 'OTHER',
        modelNumber: '',
        serialNumber: '',
        capacity: '',
        purchaseDate: new Date().toISOString().split('T')[0],
        lastMaintenance: new Date().toISOString().split('T')[0],
        nextMaintenance: '',
        hoursUsed: 0,
        notes: '',
    });

    useEffect(() => {
        fetchSites();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (selectedSite) {
            fetchSiteDetails(selectedSite.id);
        }
    }, [selectedSite]);

    const fetchSites = async () => {
        try {
            setLoading(true);
            const response = await api.get('/sites');
            setSites(response.data);
            setLoading(false);
        } catch (error) {
            showSnackbar('Failed to load sites', 'error');
            setLoading(false);
        }
    };

    const fetchSiteDetails = async (siteId) => {
        try {
            const [staffRes, vehiclesRes, machinesRes] = await Promise.all([
                api.get(`/sites/${siteId}/staff`),
                api.get(`/sites/${siteId}/vehicles`),
                api.get(`/sites/${siteId}/machines`),
            ]);
            setStaff(staffRes.data);
            setVehicles(vehiclesRes.data);
            setMachines(machinesRes.data);
        } catch (error) {
            console.error('Failed to fetch site details');
        }
    };

    const handleSelectSite = (site) => {
        setSelectedSite(site);
        setTabValue(0);
    };

    const handleOpenSiteDialog = (site = null) => {
        if (site) {
            setSiteForm({
                siteName: site.siteName,
                location: site.location,
                startDate: site.startDate ? new Date(site.startDate).toISOString().split('T')[0] : '',
                endDate: site.endDate ? new Date(site.endDate).toISOString().split('T')[0] : '',
                status: site.status,
                siteManager: site.siteManager || '',
                contactNumber: site.contactNumber || '',
                description: site.description || '',
            });
        } else {
            setSiteForm({
                siteName: '',
                location: '',
                startDate: new Date().toISOString().split('T')[0],
                endDate: '',
                status: 'ACTIVE',
                siteManager: '',
                contactNumber: '',
                description: '',
            });
        }
        setSelectedSite(site);
        setSiteDialog(true);
    };

    const handleSaveSite = async () => {
        try {
            if (selectedSite) {
                await api.put(`/sites/${selectedSite.id}`, siteForm);
                showSnackbar('Site updated successfully', 'success');
            } else {
                await api.post('/sites', siteForm);
                showSnackbar('Site created successfully', 'success');
            }
            setSiteDialog(false);
            fetchSites();
        } catch (error) {
            showSnackbar(error.response?.data?.message || 'Operation failed', 'error');
        }
    };

    const handleSaveStaff = async () => {
        try {
            if (staffForm.id) {
                await api.put(`/sites/staff/${staffForm.id}`, staffForm);
                showSnackbar('Staff updated successfully', 'success');
            } else {
                await api.post(`/sites/${selectedSite.id}/staff`, staffForm);
                showSnackbar('Staff added successfully', 'success');
            }
            setStaffDialog(false);
            fetchSiteDetails(selectedSite.id);
        } catch (error) {
            showSnackbar('Operation failed', 'error');
        }
    };

    const handleSaveVehicle = async () => {
        try {
            if (vehicleForm.id) {
                await api.put(`/sites/vehicles/${vehicleForm.id}`, vehicleForm);
                showSnackbar('Vehicle updated successfully', 'success');
            } else {
                await api.post(`/sites/${selectedSite.id}/vehicles`, vehicleForm);
                showSnackbar('Vehicle added successfully', 'success');
            }
            setVehicleDialog(false);
            fetchSiteDetails(selectedSite.id);
        } catch (error) {
            showSnackbar('Operation failed', 'error');
        }
    };

    const handleSaveMachine = async () => {
        try {
            if (machineForm.id) {
                await api.put(`/sites/machines/${machineForm.id}`, machineForm);
                showSnackbar('Machine updated successfully', 'success');
            } else {
                await api.post(`/sites/${selectedSite.id}/machines`, machineForm);
                showSnackbar('Machine added successfully', 'success');
            }
            setMachineDialog(false);
            fetchSiteDetails(selectedSite.id);
        } catch (error) {
            showSnackbar('Operation failed', 'error');
        }
    };

    const handleDelete = async () => {
        try {
            if (deleteType === 'site') {
                await api.delete(`/sites/${selectedSite.id}`);
                showSnackbar('Site deleted successfully', 'success');
                setSelectedSite(null);
                fetchSites();
            } else if (deleteType === 'staff') {
                await api.delete(`/sites/staff/${staffForm.id}`);
                showSnackbar('Staff removed', 'success');
                fetchSiteDetails(selectedSite.id);
            } else if (deleteType === 'vehicle') {
                await api.delete(`/sites/vehicles/${vehicleForm.id}`);
                showSnackbar('Vehicle removed', 'success');
                fetchSiteDetails(selectedSite.id);
            } else if (deleteType === 'machine') {
                await api.delete(`/sites/machines/${machineForm.id}`);
                showSnackbar('Machine removed', 'success');
                fetchSiteDetails(selectedSite.id);
            }
            setDeleteDialog(false);
        } catch (error) {
            showSnackbar('Failed to delete', 'error');
        }
    };

    const showSnackbar = (message, severity) => {
        setSnackbar({ open: true, message, severity });
    };

    const getStatusColor = (status) => {
        const colors = {
            ACTIVE: 'success',
            COMPLETED: 'primary',
            ON_HOLD: 'warning',
            OPERATIONAL: 'success',
            UNDER_REPAIR: 'warning',
            OUT_OF_ORDER: 'error',
            MAINTENANCE: 'warning',
            IDLE: 'default',
        };
        return colors[status] || 'default';
    };

    const getRoleColor = (role) => {
        const colors = {
            MANAGER: 'primary',
            SUPERVISOR: 'success',
            OPERATOR: 'info',
            LABORER: 'default',
            SECURITY: 'warning',
        };
        return colors[role] || 'default';
    };

    return (
        <Box>
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
                Site Management
            </Typography>

            <Grid container spacing={3}>
                {/* Sites List */}
                <Grid item xs={12} md={4}>
                    <Paper elevation={2} sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" fontWeight="bold">All Sites</Typography>
                            <Button size="small" variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenSiteDialog()}>
                                New
                            </Button>
                        </Box>

                        {loading ? (
                            <CircularProgress size={24} />
                        ) : (
                            <Box sx={{ maxHeight: 'calc(100vh - 250px)', overflow: 'auto' }}>
                                {sites.map((site) => (
                                    <Card
                                        key={site.id}
                                        onClick={() => handleSelectSite(site)}
                                        sx={{
                                            mb: 1,
                                            cursor: 'pointer',
                                            backgroundColor: selectedSite?.id === site.id ? 'action.selected' : 'background.paper',
                                            '&:hover': { backgroundColor: 'action.hover' },
                                        }}
                                    >
                                        <CardContent sx={{ p: 2 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <Box>
                                                    <Typography variant="subtitle1" fontWeight="bold">{site.siteName}</Typography>
                                                    <Typography variant="body2" color="text.secondary">{site.location}</Typography>
                                                </Box>
                                                <Chip label={site.status} size="small" color={getStatusColor(site.status)} />
                                            </Box>
                                            <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                                                <Badge badgeContent={site._count?.staff || 0} color="primary">
                                                    <PeopleIcon fontSize="small" />
                                                </Badge>
                                                <Badge badgeContent={site._count?.vehicles || 0} color="secondary">
                                                    <VehicleIcon fontSize="small" />
                                                </Badge>
                                                <Badge badgeContent={site._count?.machines || 0} color="success">
                                                    <MachineIcon fontSize="small" />
                                                </Badge>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                ))}
                                {sites.length === 0 && (
                                    <Alert severity="info" sx={{ mt: 2 }}>No sites found. Create your first site!</Alert>
                                )}
                            </Box>
                        )}
                    </Paper>
                </Grid>

                {/* Site Details */}
                <Grid item xs={12} md={8}>
                    {selectedSite ? (
                        <Paper elevation={2} sx={{ p: 3 }}>
                            {/* Site Header */}
                            <Box sx={{ mb: 3 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                    <Box>
                                        <Typography variant="h5" fontWeight="bold">{selectedSite.siteName}</Typography>
                                        <Typography variant="body2" color="text.secondary">{selectedSite.location}</Typography>
                                        {selectedSite.siteManager && (
                                            <Typography variant="body2">Manager: {selectedSite.siteManager} | {selectedSite.contactNumber}</Typography>
                                        )}
                                    </Box>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Button size="small" startIcon={<EditIcon />} onClick={() => handleOpenSiteDialog(selectedSite)}>
                                            Edit
                                        </Button>
                                        <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => { setDeleteType('site'); setDeleteDialog(true); }}>
                                            Delete
                                        </Button>
                                    </Box>
                                </Box>

                                <Divider sx={{ mb: 2 }} />

                                {/* Tabs */}
                                <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 2 }}>
                                    <Tab icon={<PeopleIcon />} iconPosition="start" label={`Staff (${staff.length})`} />
                                    <Tab icon={<VehicleIcon />} iconPosition="start" label={`Vehicles (${vehicles.length})`} />
                                    <Tab icon={<MachineIcon />} iconPosition="start" label={`Machines (${machines.length})`} />
                                </Tabs>

                                {/* Staff Tab */}
                                {tabValue === 0 && (
                                    <Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                            <Typography variant="h6" fontWeight="bold">Site Staff</Typography>
                                            <Button size="small" variant="contained" startIcon={<AddIcon />} onClick={() => { setStaffForm({ name: '', role: 'OTHER', phone: '', email: '', aadharNumber: '', notes: '' }); setStaffDialog(true); }}>
                                                Add Staff
                                            </Button>
                                        </Box>
                                        <TableContainer>
                                            <Table size="small">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>Name</TableCell>
                                                        <TableCell>Role</TableCell>
                                                        <TableCell>Phone</TableCell>
                                                        <TableCell>Status</TableCell>
                                                        <TableCell align="right">Actions</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {staff.map((s) => (
                                                        <TableRow key={s.id}>
                                                            <TableCell>{s.name}</TableCell>
                                                            <TableCell><Chip label={s.role} size="small" color={getRoleColor(s.role)} /></TableCell>
                                                            <TableCell>{s.phone || '-'}</TableCell>
                                                            <TableCell>{s.isActive ? <CheckCircleIcon color="success" fontSize="small" /> : <WarningIcon color="warning" fontSize="small" />}</TableCell>
                                                            <TableCell align="right">
                                                                <IconButton size="small" onClick={() => { setStaffForm({ ...s }); setStaffDialog(true); }}><EditIcon fontSize="small" /></IconButton>
                                                                <IconButton size="small" color="error" onClick={() => { setStaffForm(s); setDeleteType('staff'); setDeleteDialog(true); }}><DeleteIcon fontSize="small" /></IconButton>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                    {staff.length === 0 && <TableRow><TableCell colSpan={5} align="center"><Alert severity="info">No staff assigned</Alert></TableCell></TableRow>}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </Box>
                                )}

                                {/* Vehicles Tab */}
                                {tabValue === 1 && (
                                    <Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                            <Typography variant="h6" fontWeight="bold">Site Vehicles</Typography>
                                            <Button size="small" variant="contained" startIcon={<AddIcon />} onClick={() => { setVehicleForm({ vehicleNumber: '', vehicleType: 'OTHER', driverName: '', driverPhone: '', fuelLevel: 100, hoursWorked: 0, lastService: new Date().toISOString().split('T')[0], notes: '' }); setVehicleDialog(true); }}>
                                                Add Vehicle
                                            </Button>
                                        </Box>
                                        <TableContainer>
                                            <Table size="small">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>Vehicle</TableCell>
                                                        <TableCell>Type</TableCell>
                                                        <TableCell>Driver</TableCell>
                                                        <TableCell>Fuel</TableCell>
                                                        <TableCell>Status</TableCell>
                                                        <TableCell align="right">Actions</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {vehicles.map((v) => (
                                                        <TableRow key={v.id}>
                                                            <TableCell>{v.vehicleNumber}</TableCell>
                                                            <TableCell><Chip label={v.vehicleType} size="small" /></TableCell>
                                                            <TableCell>{v.driverName || '-'}<br /><Typography variant="caption">{v.driverPhone || ''}</Typography></TableCell>
                                                            <TableCell>{v.fuelLevel}%</TableCell>
                                                            <TableCell><Chip label={v.status} size="small" color={getStatusColor(v.status)} /></TableCell>
                                                            <TableCell align="right">
                                                                <IconButton size="small" onClick={() => { setVehicleForm({ ...v }); setVehicleDialog(true); }}><EditIcon fontSize="small" /></IconButton>
                                                                <IconButton size="small" color="error" onClick={() => { setVehicleForm(v); setDeleteType('vehicle'); setDeleteDialog(true); }}><DeleteIcon fontSize="small" /></IconButton>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                    {vehicles.length === 0 && <TableRow><TableCell colSpan={6} align="center"><Alert severity="info">No vehicles assigned</Alert></TableCell></TableRow>}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </Box>
                                )}

                                {/* Machines Tab */}
                                {tabValue === 2 && (
                                    <Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                            <Typography variant="h6" fontWeight="bold">Site Machines</Typography>
                                            <Button size="small" variant="contained" startIcon={<AddIcon />} onClick={() => { setMachineForm({ machineName: '', machineType: 'OTHER', modelNumber: '', serialNumber: '', capacity: '', purchaseDate: new Date().toISOString().split('T')[0], lastMaintenance: new Date().toISOString().split('T')[0], nextMaintenance: '', hoursUsed: 0, notes: '' }); setMachineDialog(true); }}>
                                                Add Machine
                                            </Button>
                                        </Box>
                                        <TableContainer>
                                            <Table size="small">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>Machine</TableCell>
                                                        <TableCell>Type</TableCell>
                                                        <TableCell>Model</TableCell>
                                                        <TableCell>Status</TableCell>
                                                        <TableCell>Hours Used</TableCell>
                                                        <TableCell align="right">Actions</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {machines.map((m) => (
                                                        <TableRow key={m.id}>
                                                            <TableCell>{m.machineName}<br /><Typography variant="caption">{m.serialNumber || ''}</Typography></TableCell>
                                                            <TableCell><Chip label={m.machineType} size="small" /></TableCell>
                                                            <TableCell>{m.modelNumber || '-'}</TableCell>
                                                            <TableCell><Chip label={m.status} size="small" color={getStatusColor(m.status)} /></TableCell>
                                                            <TableCell>{m.hoursUsed || 0} hrs</TableCell>
                                                            <TableCell align="right">
                                                                <IconButton size="small" onClick={() => { setMachineForm({ ...m }); setMachineDialog(true); }}><EditIcon fontSize="small" /></IconButton>
                                                                <IconButton size="small" color="error" onClick={() => { setMachineForm(m); setDeleteType('machine'); setDeleteDialog(true); }}><DeleteIcon fontSize="small" /></IconButton>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                    {machines.length === 0 && <TableRow><TableCell colSpan={6} align="center"><Alert severity="info">No machines assigned</Alert></TableCell></TableRow>}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </Box>
                                )}
                            </Box>
                        </Paper>
                    ) : (
                        <Paper elevation={2} sx={{ p: 6, textAlign: 'center' }}>
                            <BusinessIcon sx={{ fontSize: 80, color: 'text.secondary', opacity: 0.3, mb: 2 }} />
                            <Typography variant="h6" color="text.secondary">Select a site to view details</Typography>
                            <Typography variant="body2" color="text.secondary">Or create a new site to get started</Typography>
                        </Paper>
                    )}
                </Grid>
            </Grid>

            {/* Site Dialog */}
            <Dialog open={siteDialog} onClose={() => setSiteDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{selectedSite?.id ? 'Edit' : 'Create'} Site</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}><TextField fullWidth label="Site Name" value={siteForm.siteName} onChange={(e) => setSiteForm({ ...siteForm, siteName: e.target.value })} required /></Grid>
                        <Grid item xs={12}><TextField fullWidth label="Location" value={siteForm.location} onChange={(e) => setSiteForm({ ...siteForm, location: e.target.value })} required /></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth label="Start Date" type="date" value={siteForm.startDate} onChange={(e) => setSiteForm({ ...siteForm, startDate: e.target.value })} InputLabelProps={{ shrink: true }} /></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth label="End Date" type="date" value={siteForm.endDate} onChange={(e) => setSiteForm({ ...siteForm, endDate: e.target.value })} InputLabelProps={{ shrink: true }} /></Grid>
                        <Grid item xs={12} sm={6}><FormControl fullWidth><InputLabel>Status</InputLabel><Select value={siteForm.status} label="Status" onChange={(e) => setSiteForm({ ...siteForm, status: e.target.value })}><MenuItem value="ACTIVE">Active</MenuItem><MenuItem value="COMPLETED">Completed</MenuItem><MenuItem value="ON_HOLD">On Hold</MenuItem></Select></FormControl></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth label="Site Manager" value={siteForm.siteManager} onChange={(e) => setSiteForm({ ...siteForm, siteManager: e.target.value })} /></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth label="Contact Number" value={siteForm.contactNumber} onChange={(e) => setSiteForm({ ...siteForm, contactNumber: e.target.value })} /></Grid>
                        <Grid item xs={12}><TextField fullWidth label="Description" multiline rows={2} value={siteForm.description} onChange={(e) => setSiteForm({ ...siteForm, description: e.target.value })} /></Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSiteDialog(false)}>Cancel</Button>
                    <Button onClick={handleSaveSite} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>

            {/* Staff Dialog */}
            <Dialog open={staffDialog} onClose={() => setStaffDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{staffForm.id ? 'Edit' : 'Add'} Staff Member</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}><TextField fullWidth label="Name" value={staffForm.name} onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })} required /></Grid>
                        <Grid item xs={12} sm={6}><FormControl fullWidth required><InputLabel>Role</InputLabel><Select value={staffForm.role} label="Role" onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })}><MenuItem value="MANAGER">Manager</MenuItem><MenuItem value="SUPERVISOR">Supervisor</MenuItem><MenuItem value="OPERATOR">Operator</MenuItem><MenuItem value="LABORER">Laborer</MenuItem><MenuItem value="SECURITY">Security</MenuItem><MenuItem value="OTHER">Other</MenuItem></Select></FormControl></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth label="Phone" value={staffForm.phone} onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })} /></Grid>
                        <Grid item xs={12}><TextField fullWidth label="Email" type="email" value={staffForm.email} onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })} /></Grid>
                        <Grid item xs={12}><TextField fullWidth label="Aadhar Number" value={staffForm.aadharNumber} onChange={(e) => setStaffForm({ ...staffForm, aadharNumber: e.target.value })} /></Grid>
                        <Grid item xs={12}><TextField fullWidth label="Notes" multiline rows={2} value={staffForm.notes} onChange={(e) => setStaffForm({ ...staffForm, notes: e.target.value })} /></Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setStaffDialog(false)}>Cancel</Button>
                    <Button onClick={handleSaveStaff} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>

            {/* Vehicle Dialog */}
            <Dialog open={vehicleDialog} onClose={() => setVehicleDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{vehicleForm.id ? 'Edit' : 'Add'} Vehicle</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}><TextField fullWidth label="Vehicle Number" value={vehicleForm.vehicleNumber} onChange={(e) => setVehicleForm({ ...vehicleForm, vehicleNumber: e.target.value })} required /></Grid>
                        <Grid item xs={12} sm={6}><FormControl fullWidth required><InputLabel>Vehicle Type</InputLabel><Select value={vehicleForm.vehicleType} label="Vehicle Type" onChange={(e) => setVehicleForm({ ...vehicleForm, vehicleType: e.target.value })}><MenuItem value="TRUCK">Truck</MenuItem><MenuItem value="EXCAVATOR">Excavator</MenuItem><MenuItem value="LOADER">Loader</MenuItem><MenuItem value="CRANE">Crane</MenuItem><MenuItem value="DOZER">Dozer</MenuItem><MenuItem value="JCB">JCB</MenuItem><MenuItem value="OTHER">Other</MenuItem></Select></FormControl></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth label="Driver Name" value={vehicleForm.driverName} onChange={(e) => setVehicleForm({ ...vehicleForm, driverName: e.target.value })} /></Grid>
                        <Grid item xs={12}><TextField fullWidth label="Driver Phone" value={vehicleForm.driverPhone} onChange={(e) => setVehicleForm({ ...vehicleForm, driverPhone: e.target.value })} /></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth label="Fuel Level (%)" type="number" value={vehicleForm.fuelLevel} onChange={(e) => setVehicleForm({ ...vehicleForm, fuelLevel: parseFloat(e.target.value) || 0 })} /></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth label="Hours Worked" type="number" value={vehicleForm.hoursWorked} onChange={(e) => setVehicleForm({ ...vehicleForm, hoursWorked: parseFloat(e.target.value) || 0 })} /></Grid>
                        <Grid item xs={12}><TextField fullWidth label="Last Service Date" type="date" value={vehicleForm.lastService} onChange={(e) => setVehicleForm({ ...vehicleForm, lastService: e.target.value })} InputLabelProps={{ shrink: true }} /></Grid>
                        <Grid item xs={12}><TextField fullWidth label="Notes" multiline rows={2} value={vehicleForm.notes} onChange={(e) => setVehicleForm({ ...vehicleForm, notes: e.target.value })} /></Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setVehicleDialog(false)}>Cancel</Button>
                    <Button onClick={handleSaveVehicle} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>

            {/* Machine Dialog */}
            <Dialog open={machineDialog} onClose={() => setMachineDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{machineForm.id ? 'Edit' : 'Add'} Machine</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}><TextField fullWidth label="Machine Name" value={machineForm.machineName} onChange={(e) => setMachineForm({ ...machineForm, machineName: e.target.value })} required /></Grid>
                        <Grid item xs={12} sm={6}><FormControl fullWidth required><InputLabel>Machine Type</InputLabel><Select value={machineForm.machineType} label="Machine Type" onChange={(e) => setMachineForm({ ...machineForm, machineType: e.target.value })}><MenuItem value="GENERATOR">Generator</MenuItem><MenuItem value="COMPRESSOR">Compressor</MenuItem><MenuItem value="PUMP">Pump</MenuItem><MenuItem value="MIXER">Mixer</MenuItem><MenuItem value="CRUSHER">Crusher</MenuItem><MenuItem value="OTHER">Other</MenuItem></Select></FormControl></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth label="Model Number" value={machineForm.modelNumber} onChange={(e) => setMachineForm({ ...machineForm, modelNumber: e.target.value })} /></Grid>
                        <Grid item xs={12}><TextField fullWidth label="Serial Number" value={machineForm.serialNumber} onChange={(e) => setMachineForm({ ...machineForm, serialNumber: e.target.value })} /></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth label="Capacity" value={machineForm.capacity} onChange={(e) => setMachineForm({ ...machineForm, capacity: e.target.value })} placeholder="e.g., 500 kVA" /></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth label="Hours Used" type="number" value={machineForm.hoursUsed} onChange={(e) => setMachineForm({ ...machineForm, hoursUsed: parseFloat(e.target.value) || 0 })} /></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth label="Purchase Date" type="date" value={machineForm.purchaseDate} onChange={(e) => setMachineForm({ ...machineForm, purchaseDate: e.target.value })} InputLabelProps={{ shrink: true }} /></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth label="Last Maintenance" type="date" value={machineForm.lastMaintenance} onChange={(e) => setMachineForm({ ...machineForm, lastMaintenance: e.target.value })} InputLabelProps={{ shrink: true }} /></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth label="Next Maintenance" type="date" value={machineForm.nextMaintenance} onChange={(e) => setMachineForm({ ...machineForm, nextMaintenance: e.target.value })} InputLabelProps={{ shrink: true }} /></Grid>
                        <Grid item xs={12}><TextField fullWidth label="Notes" multiline rows={2} value={machineForm.notes} onChange={(e) => setMachineForm({ ...machineForm, notes: e.target.value })} /></Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setMachineDialog(false)}>Cancel</Button>
                    <Button onClick={handleSaveMachine} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to delete this {deleteType}?</Typography>
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

export default Sites;
