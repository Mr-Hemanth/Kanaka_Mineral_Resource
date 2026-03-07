import React, { useState } from 'react';
import {
    Box,
    TextField,
    IconButton,
    Menu,
    MenuItem,
    Button,
    Tooltip,
    Chip,
    FormControl,
    InputLabel,
    Select,
    OutlinedInput,
} from '@mui/material';
import {
    Search as SearchIcon,
    FilterList as FilterIcon,
    Refresh as RefreshIcon,
    Download as DownloadIcon,
    Clear as ClearIcon,
} from '@mui/icons-material';

const SearchFilter = ({
    onSearch,
    onFilter,
    onSort,
    onExport,
    filters = [],
    sortOptions = [],
    placeholder = 'Search...',
    showExport = true,
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterAnchorEl, setFilterAnchorEl] = useState(null);
    const [sortAnchorEl, setSortAnchorEl] = useState(null);
    const [exportAnchorEl, setExportAnchorEl] = useState(null);
    const [selectedFilters, setSelectedFilters] = useState({});
    const [sortBy, setSortBy] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        if (onSearch) {
            // Debounce search
            setTimeout(() => {
                onSearch(value);
            }, 300);
        }
    };

    const handleFilterClick = (event) => {
        setFilterAnchorEl(event.currentTarget);
    };

    const handleFilterClose = () => {
        setFilterAnchorEl(null);
    };

    const handleSortClick = (event) => {
        setSortAnchorEl(event.currentTarget);
    };

    const handleSortClose = () => {
        setSortAnchorEl(null);
    };

    const handleExportClick = (event) => {
        setExportAnchorEl(event.currentTarget);
    };

    const handleExportClose = () => {
        setExportAnchorEl(null);
    };

    const handleFilterChange = (filterName, value) => {
        const newFilters = { ...selectedFilters, [filterName]: value };
        setSelectedFilters(newFilters);
        if (onFilter) {
            onFilter(newFilters);
        }
    };

    const handleSortOptionClick = (option) => {
        if (sortBy === option) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(option);
            setSortOrder('asc');
        }
        if (onSort) {
            onSort({ sortBy: option, order: sortOrder === 'asc' ? 'desc' : 'asc' });
        }
        setSortAnchorEl(null);
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setSelectedFilters({});
        setSortBy('');
        if (onSearch) onSearch('');
        if (onFilter) onFilter({});
        if (onSort) onSort({ sortBy: '', order: 'asc' });
    };

    const hasActiveFilters = searchTerm || Object.keys(selectedFilters).length > 0 || sortBy;

    return (
        <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                {/* Search Field */}
                <TextField
                    size="small"
                    placeholder={placeholder}
                    value={searchTerm}
                    onChange={handleSearchChange}
                    InputProps={{
                        startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                        endAdornment: searchTerm && (
                            <IconButton size="small" onClick={() => handleSearchChange({ target: { value: '' } })}>
                                <ClearIcon />
                            </IconButton>
                        ),
                    }}
                    sx={{ flexGrow: 1, minWidth: 250 }}
                />

                {/* Filter Button */}
                {filters.length > 0 && (
                    <>
                        <Tooltip title="Filters">
                            <IconButton onClick={handleFilterClick} color={hasActiveFilters ? 'primary' : 'default'}>
                                <FilterIcon />
                            </IconButton>
                        </Tooltip>
                        <Menu
                            anchorEl={filterAnchorEl}
                            open={Boolean(filterAnchorEl)}
                            onClose={handleFilterClose}
                        >
                            {filters.map((filter) => (
                                <MenuItem key={filter.name}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>{filter.label}</InputLabel>
                                        <Select
                                            value={selectedFilters[filter.name] || ''}
                                            label={filter.label}
                                            onChange={(e) => handleFilterChange(filter.name, e.target.value)}
                                            input={<OutlinedInput label={filter.label} />}
                                            renderValue={(selected) => selected || filter.label}
                                        >
                                            <MenuItem value="">All</MenuItem>
                                            {filter.options.map((option) => (
                                                <MenuItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </MenuItem>
                            ))}
                        </Menu>
                    </>
                )}

                {/* Sort Button */}
                {sortOptions.length > 0 && (
                    <>
                        <Tooltip title="Sort By">
                            <IconButton onClick={handleSortClick} color={sortBy ? 'primary' : 'default'}>
                                <FilterIcon sx={{ transform: sortOrder === 'desc' ? 'rotate(180deg)' : 'none' }} />
                            </IconButton>
                        </Tooltip>
                        <Menu
                            anchorEl={sortAnchorEl}
                            open={Boolean(sortAnchorEl)}
                            onClose={handleSortClose}
                        >
                            {sortOptions.map((option) => (
                                <MenuItem
                                    key={option.value}
                                    onClick={() => handleSortOptionClick(option.value)}
                                    selected={sortBy === option.value}
                                >
                                    {option.label} {sortBy === option.value && (sortOrder === 'asc' ? '↑' : '↓')}
                                </MenuItem>
                            ))}
                        </Menu>
                    </>
                )}

                {/* Export Button */}
                {showExport && onExport && (
                    <>
                        <Tooltip title="Export">
                            <IconButton onClick={handleExportClick} color="success">
                                <DownloadIcon />
                            </IconButton>
                        </Tooltip>
                        <Menu
                            anchorEl={exportAnchorEl}
                            open={Boolean(exportAnchorEl)}
                            onClose={handleExportClose}
                        >
                            <MenuItem onClick={() => { onExport('excel'); handleExportClose(); }}>
                                Excel (.xlsx)
                            </MenuItem>
                            <MenuItem onClick={() => { onExport('pdf'); handleExportClose(); }}>
                                PDF (.pdf)
                            </MenuItem>
                            <MenuItem onClick={() => { onExport('word'); handleExportClose(); }}>
                                Word (.docx)
                            </MenuItem>
                        </Menu>
                    </>
                )}

                {/* Clear Filters */}
                {hasActiveFilters && (
                    <Tooltip title="Clear all filters">
                        <IconButton onClick={handleClearFilters} color="error">
                            <RefreshIcon />
                        </IconButton>
                    </Tooltip>
                )}
            </Box>

            {/* Active Filters Display */}
            {hasActiveFilters && (
                <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {searchTerm && (
                        <Chip
                            label={`Search: "${searchTerm}"`}
                            onDelete={() => handleSearchChange({ target: { value: '' } })}
                            size="small"
                        />
                    )}
                    {Object.entries(selectedFilters).map(([key, value]) => {
                        const filter = filters.find(f => f.name === key);
                        const option = filter?.options.find(o => o.value === value);
                        return (
                            <Chip
                                key={key}
                                label={`${filter?.label}: ${option?.label || value}`}
                                onDelete={() => handleFilterChange(key, '')}
                                size="small"
                            />
                        );
                    })}
                    {sortBy && (
                        <Chip
                            label={`Sort: ${sortOptions.find(o => o.value === sortBy)?.label} (${sortOrder})`}
                            onDelete={() => setSortBy('')}
                            size="small"
                        />
                    )}
                </Box>
            )}
        </Box>
    );
};

export default SearchFilter;
