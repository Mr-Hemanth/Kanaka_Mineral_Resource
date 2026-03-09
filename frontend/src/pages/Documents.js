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
    Chip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    CircularProgress,
    Link,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Download as DownloadIcon } from '@mui/icons-material';
import api from '../utils/api';
import AdvancedTable from '../components/AdvancedTable';

const DocumentTypes = [
    'ROYALTY_BILL', 'INVOICE', 'EWAY_BILL', 'TRANSPORT_DOC', 'OTHER'
];

const Documents = () => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [file, setFile] = useState(null);
    const [docType, setDocType] = useState('OTHER');

    const fetchDocuments = async () => {
        try {
            const { data } = await api.get('/documents');
            setDocuments(data);
        } catch (error) {
            console.error('Failed to fetch documents', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
        setFile(null);
        setDocType('OTHER');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            alert('Please select a file');
            return;
        }

        const formData = new FormData();
        formData.append('document', file);
        formData.append('type', docType);

        setUploading(true);
        try {
            await api.post('/documents', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            fetchDocuments();
            handleClose();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to upload document');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this document record?')) {
            try {
                await api.delete(`/documents/${id}`);
                fetchDocuments();
            } catch (error) {
                alert(error.response?.data?.message || 'Failed to delete');
            }
        }
    };

    const columns = [
        { id: 'uploadedAt', label: 'Uploaded', minWidth: 150, format: (val) => new Date(val).toLocaleString() },
        { id: 'fileName', label: 'File Name', minWidth: 200, format: (val) => <span style={{ fontWeight: 500 }}>{val}</span> },
        {
            id: 'type',
            label: 'Type',
            minWidth: 150,
            format: (val) => <Chip label={val.replace('_', ' ')} size="small" color="primary" variant="outlined" />
        },
        {
            id: 'actions',
            label: 'Actions',
            align: 'right',
            minWidth: 120,
            format: (val, row) => (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <IconButton
                        color="primary"
                        component={Link}
                        href={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${row.fileUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        size="small"
                    >
                        <DownloadIcon fontSize="small" />
                    </IconButton>
                    <IconButton color="error" size="small" onClick={() => handleDelete(row.id)}>
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </Box>
            )
        }
    ];

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen}>
                    Upload Document
                </Button>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4, mt: 3 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <AdvancedTable
                    columns={columns}
                    data={documents}
                    title="Documents"
                    searchableFields={['fileName', 'type']}
                />
            )}

            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <form onSubmit={handleSubmit}>
                    <DialogTitle>Upload Document</DialogTitle>
                    <DialogContent>
                        <TextField
                            select
                            margin="dense"
                            label="Document Type"
                            fullWidth
                            required
                            value={docType}
                            onChange={(e) => setDocType(e.target.value)}
                            sx={{ mb: 2, mt: 1 }}
                        >
                            {DocumentTypes.map(type => (
                                <MenuItem key={type} value={type}>{type.replace('_', ' ')}</MenuItem>
                            ))}
                        </TextField>

                        <Button
                            variant="outlined"
                            component="label"
                            fullWidth
                            sx={{ py: 4, borderStyle: 'dashed', borderWidth: 2 }}
                        >
                            {file ? file.name : 'Select File (PDF, JPG, PNG)'}
                            <input
                                type="file"
                                hidden
                                onChange={(e) => setFile(e.target.files[0])}
                                accept=".pdf,.jpg,.jpeg,.png"
                            />
                        </Button>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={handleClose} disabled={uploading}>Cancel</Button>
                        <Button type="submit" variant="contained" disabled={uploading}>
                            {uploading ? <CircularProgress size={24} /> : 'Upload'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Box>
    );
};

export default Documents;
