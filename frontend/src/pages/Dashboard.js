import React, { useEffect, useState } from 'react';
import {
    Grid,
    Paper,
    Typography,
    Box,
    CircularProgress,
    Alert,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Card,
    CardContent,
} from '@mui/material';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, AreaChart, Area,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import api from '../utils/api';
import {
    LocalShipping, LocalGasStation, Receipt, AccountBalanceWallet,
    TrendingUp, TrendingDown, ShoppingCart, CheckCircle, Warning,
    Engineering, People, AttachMoney
} from '@mui/icons-material';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'];

const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);

const Dashboard = () => {
    const [summary, setSummary] = useState(null);
    const [charts, setCharts] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [period, setPeriod] = useState('30');

    useEffect(() => {
        fetchDashboardData();
    }, [period]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [summaryRes, chartsRes] = await Promise.all([
                api.get('/dashboard/summary'),
                api.get(`/dashboard/charts?period=${period}`),
            ]);
            setSummary(summaryRes.data);
            setCharts(chartsRes.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to load dashboard data');
            setLoading(false);
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
    if (error) return <Alert severity="error">{error}</Alert>;

    // Combine revenue and expenses for the chart
    const profitLossData = charts?.revenueTrend?.map((item, index) => ({
        date: item.date,
        Revenue: item.revenue,
        Expenses: charts.expenseTrend[index]?.expenses || 0,
        Profit: item.revenue - (charts.expenseTrend[index]?.expenses || 0),
    })) || [];

    const StatCard = ({ title, value, icon, color, trend }) => (
        <Card elevation={2} sx={{ borderRadius: 2 }}>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Typography variant="body2" color="text.secondary" fontWeight="bold" gutterBottom>
                            {title}
                        </Typography>
                        <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
                            {typeof value === 'number' ? value.toLocaleString() : value}
                        </Typography>
                        {trend && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                {trend > 0 ? <TrendingUp color="success" fontSize="small" /> : <TrendingDown color="error" fontSize="small" />}
                                <Typography variant="caption" color={trend > 0 ? 'success.main' : 'error.main'}>
                                    {Math.abs(trend)}% vs last month
                                </Typography>
                            </Box>
                        )}
                    </Box>
                    <Box sx={{ 
                        p: 1.5, 
                        borderRadius: '50%', 
                        backgroundColor: `${color}.light`, 
                        color: `${color}.main`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {icon}
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" fontWeight="bold">
                    Dashboard Analytics
                </Typography>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Time Period</InputLabel>
                    <Select
                        value={period}
                        label="Time Period"
                        onChange={(e) => setPeriod(e.target.value)}
                    >
                        <MenuItem value="7">Last 7 Days</MenuItem>
                        <MenuItem value="15">Last 15 Days</MenuItem>
                        <MenuItem value="30">Last 30 Days</MenuItem>
                        <MenuItem value="90">Last 90 Days</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            {/* KPI Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Active Vehicles"
                        value={`${summary?.activeVehicles || 0}/${summary?.totalVehicles || 0}`}
                        icon={<LocalShipping />}
                        color="primary"
                        trend={5}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Revenue"
                        value={formatCurrency(summary?.totalRevenue || 0)}
                        icon={<AccountBalanceWallet />}
                        color="success"
                        trend={12}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Expenses"
                        value={formatCurrency(summary?.totalExpenses || 0)}
                        icon={<Receipt />}
                        color="error"
                        trend={-3}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Profit/Loss"
                        value={formatCurrency(summary?.profitLoss || 0)}
                        icon={summary?.profitLoss >= 0 ? <TrendingUp /> : <TrendingDown />}
                        color={summary?.profitLoss >= 0 ? 'success' : 'error'}
                        trend={summary?.profitLoss >= 0 ? 8 : -8}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Diesel Used (L)"
                        value={(summary?.totalDieselUsed || 0).toFixed(2)}
                        icon={<LocalGasStation />}
                        color="warning"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Purchase Orders"
                        value={summary?.totalPOs || 0}
                        icon={<ShoppingCart />}
                        color="info"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Pending POs"
                        value={summary?.pendingPOs || 0}
                        icon={<Warning />}
                        color="warning"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Labour Cost"
                        value={formatCurrency(summary?.totalLabourCost || 0)}
                        icon={<People />}
                        color="secondary"
                    />
                </Grid>
            </Grid>

            {/* Monthly Comparison */}
            {charts?.monthlyComparison && (
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12}>
                        <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                                Monthly Performance Comparison
                            </Typography>
                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={6}>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography variant="body2" color="text.secondary">Current Month</Typography>
                                        <Typography variant="h3" color="primary" fontWeight="bold">
                                            {formatCurrency(charts.monthlyComparison.currentMonth || 0)}
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography variant="body2" color="text.secondary">Previous Month</Typography>
                                        <Typography variant="h3" color="secondary" fontWeight="bold">
                                            {formatCurrency(charts.monthlyComparison.previousMonth || 0)}
                                        </Typography>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>
                </Grid>
            )}

            {/* Revenue vs Expenses Trend */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} lg={8}>
                    <Paper elevation={2} sx={{ p: 3, borderRadius: 2, height: 400 }}>
                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                            Revenue vs Expenses Trend
                        </Typography>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={profitLossData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="date" tickLine={false} axisLine={false} />
                                <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `₹${(value/1000).toFixed(1)}k`} />
                                <Tooltip formatter={(value) => formatCurrency(value)} />
                                <Legend />
                                <Area type="monotone" dataKey="Revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRevenue)" />
                                <Area type="monotone" dataKey="Expenses" stroke="#ef4444" fillOpacity={1} fill="url(#colorExpenses)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                <Grid item xs={12} lg={4}>
                    <Paper elevation={2} sx={{ p: 3, borderRadius: 2, height: 400 }}>
                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                            Vehicle Status Distribution
                        </Typography>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={charts.vehicleStatus}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ status, count }) => `${status}: ${count}`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="count"
                                >
                                    {charts.vehicleStatus?.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>
            </Grid>

            {/* Expense Breakdown & Diesel Consumption */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} lg={6}>
                    <Paper elevation={2} sx={{ p: 3, borderRadius: 2, height: 350 }}>
                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                            Expenses by Category
                        </Typography>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={charts.expenseByCategory}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="category" tickLine={false} axisLine={false} angle={-45} textAnchor="end" height={80} />
                                <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `₹${(value/1000).toFixed(1)}k`} />
                                <Tooltip formatter={(value) => formatCurrency(value)} />
                                <Bar dataKey="amount" fill="#2563eb" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                <Grid item xs={12} lg={6}>
                    <Paper elevation={2} sx={{ p: 3, borderRadius: 2, height: 350 }}>
                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                            Diesel Consumption Trend
                        </Typography>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={charts.dieselTrend}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="date" tickLine={false} axisLine={false} />
                                <YAxis tickLine={false} axisLine={false} />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="diesel" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} name="Diesel (L)" />
                            </LineChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>
            </Grid>

            {/* Top Vehicles & Material Distribution */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} lg={6}>
                    <Paper elevation={2} sx={{ p: 3, borderRadius: 2, height: 350 }}>
                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                            Top 10 Performing Vehicles
                        </Typography>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={charts.topVehicles} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                <XAxis type="number" tickLine={false} axisLine={false} tickFormatter={(value) => `₹${(value/1000).toFixed(1)}k`} />
                                <YAxis dataKey="truckNumber" type="category" tickLine={false} axisLine={false} width={100} />
                                <Tooltip formatter={(value) => formatCurrency(value)} />
                                <Bar dataKey="totalRevenue" fill="#10b981" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                <Grid item xs={12} lg={6}>
                    <Paper elevation={2} sx={{ p: 3, borderRadius: 2, height: 350 }}>
                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                            Material Type Distribution
                        </Typography>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={charts.materialDistribution}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ materialType, totalTonnage }) => `${materialType}: ${totalTonnage.toFixed(1)} tons`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="totalTonnage"
                                >
                                    {charts.materialDistribution?.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => `${value.toFixed(2)} tons`} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>
            </Grid>

            {/* Daily Dispatches & PO Status */}
            <Grid container spacing={3}>
                <Grid item xs={12} lg={8}>
                    <Paper elevation={2} sx={{ p: 3, borderRadius: 2, height: 350 }}>
                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                            Daily Dispatch Count
                        </Typography>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={charts.dailyDispatches}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="date" tickLine={false} axisLine={false} />
                                <YAxis tickLine={false} axisLine={false} />
                                <Tooltip />
                                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                <Grid item xs={12} lg={4}>
                    <Paper elevation={2} sx={{ p: 3, borderRadius: 2, height: 350 }}>
                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                            Purchase Order Status
                        </Typography>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={charts.poStatus}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ status, count }) => `${status}: ${count}`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="count"
                                >
                                    {charts.poStatus?.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Dashboard;
