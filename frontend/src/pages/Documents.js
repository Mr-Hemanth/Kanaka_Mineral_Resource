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

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4" fontWeight="bold">Documents</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen}>
                    Upload Document
                </Button>
            </Box>

            <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2 }}>
                <Table>
                    <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Uploaded</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>File Name</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={4} align="center"><CircularProgress size={24} /></TableCell></TableRow>
                        ) : documents.length === 0 ? (
                            <TableRow><TableCell colSpan={4} align="center">No documents found</TableCell></TableRow>
                        ) : (
                            documents.map((doc) => (
                                <TableRow key={doc.id} hover>
                                    <TableCell>{new Date(doc.uploadedAt).toLocaleString()}</TableCell>
                                    <TableCell sx={{ fontWeight: 'medium' }}>{doc.fileName}</TableCell>
                                    <TableCell>
                                        <Chip label={doc.type.replace('_', ' ')} size="small" color="primary" variant="outlined" />
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            color="primary"
                                            component={Link}
                                            href={`http://localhost:5000${doc.fileUrl}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            download
                                        >
                                            <DownloadIcon size="small" />
                                        </IconButton>
                                        <IconButton color="error" onClick={() => handleDelete(doc.id)}>
                                            <DeleteIcon size="small" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

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
