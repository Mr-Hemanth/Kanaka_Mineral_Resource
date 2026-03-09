import React, { useState, useMemo } from 'react';
import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    TableSortLabel,
    TextField,
    InputAdornment,
    Toolbar,
    Typography,
    Button,
    IconButton,
    Tooltip,
} from '@mui/material';
import {
    Search as SearchIcon,
    PictureAsPdf as PdfIcon,
    TableChart as ExcelIcon,
} from '@mui/icons-material';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';

/**
 * AdvancedTable - A generalized, reusable Material-UI Table component
 * 
 * @param {Array} columns - Array of objects { id: string, label: string, minWidth: number, align: string, format: function }
 * @param {Array} data - Array of data objects
 * @param {String} title - Table Title (used for exports)
 * @param {Array} searchableFields - Array of column IDs that should be searchable
 */
const AdvancedTable = ({
    columns,
    data = [],
    title = 'Data Export',
    searchableFields = [],
}) => {
    // State
    const [order, setOrder] = useState('desc');
    const [orderBy, setOrderBy] = useState(columns[0]?.id || '');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchQuery, setSearchQuery] = useState('');

    // --- Handlers ---
    const handleRequestSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
        setPage(0);
    };

    // --- Data Processing (Search & Sort) ---
    const processedData = useMemo(() => {
        let filteredData = [...data];

        // 1. Search Filtering
        if (searchQuery && searchableFields.length > 0) {
            const lowerQuery = searchQuery.toLowerCase();
            filteredData = filteredData.filter((row) => {
                return searchableFields.some((field) => {
                    const value = row[field];
                    if (value == null) return false;
                    return String(value).toLowerCase().includes(lowerQuery);
                });
            });
        }

        // 2. Sorting
        filteredData.sort((a, b) => {
            const valueA = a[orderBy];
            const valueB = b[orderBy];

            if (valueA == null) return 1;
            if (valueB == null) return -1;

            if (typeof valueA === 'string' && typeof valueB === 'string') {
                return order === 'asc'
                    ? valueA.localeCompare(valueB)
                    : valueB.localeCompare(valueA);
            }

            return order === 'asc' ? (valueA < valueB ? -1 : 1) : (valueA > valueB ? -1 : 1);
        });

        return filteredData;
    }, [data, order, orderBy, searchQuery, searchableFields]);

    const paginatedData = processedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    // --- Export Functions ---
    const exportToPDF = () => {
        const doc = new jsPDF('landscape');

        // Header
        doc.setFontSize(18);
        doc.text(title, 14, 22);
        doc.setFontSize(11);
        doc.text(`Generated on: ${format(new Date(), 'PPpp')}`, 14, 30);

        // Map column headers
        const tableColumn = columns.map(col => col.label);

        // Map row data based on columns
        const tableRows = processedData.map(row => {
            return columns.map(col => {
                // If the column has a formatting function, use it for the export text
                if (col.format && typeof col.format === 'function') {
                    // Skip React Elements for text export, fallback to raw value
                    const formatted = col.format(row[col.id], row);
                    if (React.isValidElement(formatted)) return row[col.id] || '-';
                    return formatted;
                }
                return row[col.id] || '-';
            });
        });

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 35,
            theme: 'striped',
            headStyles: { fillColor: [41, 128, 185], textColor: 255 },
            styles: { fontSize: 9 },
        });

        doc.save(`${title.replace(/\s+/g, '_')}_${format(new Date(), 'yyyyMMdd')}.pdf`);
    };

    const exportToExcel = () => {
        // Create an array of objects mapping column labels to values
        const exportData = processedData.map(row => {
            const rowData = {};
            columns.forEach(col => {
                let value = row[col.id];
                if (col.format && typeof col.format === 'function') {
                    const formatted = col.format(value, row);
                    // Skip React components
                    value = React.isValidElement(formatted) ? value : formatted;
                }
                rowData[col.label] = value || '-';
            });
            return rowData;
        });

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

        // Auto-size columns roughly
        const colWidths = columns.map(col => ({ wch: Math.max(col.label.length, 15) }));
        worksheet['!cols'] = colWidths;

        XLSX.writeFile(workbook, `${title.replace(/\s+/g, '_')}_${format(new Date(), 'yyyyMMdd')}.xlsx`);
    };

    return (
        <Paper elevation={3} sx={{ width: '100%', overflow: 'hidden', borderRadius: 2, mb: 4 }}>
            <Toolbar sx={{ pl: { sm: 2 }, pr: { xs: 1, sm: 1 }, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', py: 2, gap: 2 }}>
                <Typography variant="h6" id="tableTitle" component="div" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    {title}
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                    {searchableFields.length > 0 && (
                        <TextField
                            variant="outlined"
                            size="small"
                            placeholder="Search records..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon color="action" />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ minWidth: 250 }}
                        />
                    )}

                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Export to Excel">
                            <Button
                                variant="outlined"
                                color="success"
                                size="small"
                                startIcon={<ExcelIcon />}
                                onClick={exportToExcel}
                            >
                                Excel
                            </Button>
                        </Tooltip>
                        <Tooltip title="Export to PDF">
                            <Button
                                variant="outlined"
                                color="error"
                                size="small"
                                startIcon={<PdfIcon />}
                                onClick={exportToPDF}
                            >
                                PDF
                            </Button>
                        </Tooltip>
                    </Box>
                </Box>
            </Toolbar>

            <TableContainer sx={{ maxHeight: 650 }}>
                <Table stickyHeader aria-label="advanced table">
                    <TableHead>
                        <TableRow>
                            {columns.map((column) => (
                                <TableCell
                                    key={column.id}
                                    align={column.align || 'left'}
                                    style={{ minWidth: column.minWidth, fontWeight: 'bold', backgroundColor: '#f8fafc' }}
                                    sortDirection={orderBy === column.id ? order : false}
                                >
                                    <TableSortLabel
                                        active={orderBy === column.id}
                                        direction={orderBy === column.id ? order : 'asc'}
                                        onClick={() => handleRequestSort(column.id)}
                                    >
                                        {column.label}
                                    </TableSortLabel>
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedData.length > 0 ? (
                            paginatedData.map((row, index) => {
                                return (
                                    <TableRow hover role="checkbox" tabIndex={-1} key={row.id || index}>
                                        {columns.map((column) => {
                                            const value = row[column.id];
                                            return (
                                                <TableCell key={column.id} align={column.align || 'left'}>
                                                    {column.format ? column.format(value, row) : value}
                                                </TableCell>
                                            );
                                        })}
                                    </TableRow>
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} align="center" sx={{ py: 4 }}>
                                    <Typography variant="body1" color="text.secondary">
                                        No data found matching your search.
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                rowsPerPageOptions={[10, 25, 50, 100]}
                component="div"
                count={processedData.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </Paper>
    );
};

export default AdvancedTable;
