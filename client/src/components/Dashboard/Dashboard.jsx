import React, { useState, useEffect } from 'react';
import {
  Grid, Box, Paper, Typography, TextField,
  FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart, CategoryScale, LinearScale, BarElement,
  ArcElement, Title, Tooltip, Legend
} from 'chart.js';
import API from '../../utils/api'; 
Chart.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [deals, setDeals] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStage, setFilterStage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const stages = ['Lead', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      const res = await API.get('/deals');
      setDeals(res.data);
    } catch (err) {
      console.error('Error fetching deals:', err);
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  const filteredDeals = deals.filter((deal) => {
    const matchesSearch =
      (deal.title && deal.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (deal.company && deal.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (deal.contactName && deal.contactName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStage = filterStage ? deal.stage === filterStage : true;
    return matchesSearch && matchesStage;
  });

  // Stage distribution
  const stageCounts = stages.reduce((acc, stage) => {
    acc[stage] = filteredDeals.filter(d => d.stage === stage).length;
    return acc;
  }, {});

  // Win rate
  const closedWon = filteredDeals.filter(d => d.stage === 'Closed Won').length;
  const closedLost = filteredDeals.filter(d => d.stage === 'Closed Lost').length;
  const totalClosed = closedWon + closedLost;
  const winRate = totalClosed > 0 ? Math.round((closedWon / totalClosed) * 100) : 0;

  // Total value
  const totalValue = filteredDeals.reduce((sum, d) => sum + (d.value || 0), 0);

  // Avg deal size
  const avgDealSize = filteredDeals.length > 0 ? Math.round(totalValue / filteredDeals.length) : 0;

  // Monthly trend
  const monthlyTrend = filteredDeals.reduce((acc, deal) => {
    if (!deal.createdAt) return acc;
    const date = new Date(deal.createdAt);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const label = date.toLocaleString('default', { month: 'short', year: 'numeric' });

    const existing = acc.find(entry => entry.key === key);
    if (existing) {
      existing.value += deal.value || 0;
    } else {
      acc.push({ key, month: label, value: deal.value || 0 });
    }
    return acc;
  }, []).sort((a, b) => new Date(a.key) - new Date(b.key));

  // Charts
  const stageData = {
    labels: Object.keys(stageCounts),
    datasets: [
      {
        data: Object.values(stageCounts),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#66bb6a', '#ef5350'],
        borderWidth: 0,
      },
    ],
  };

  const trendData = {
    labels: monthlyTrend.map(item => item.month),
    datasets: [
      {
        label: 'Deal Value ($)',
        data: monthlyTrend.map(item => item.value),
        backgroundColor: '#42a5f5',
      },
    ],
  };

  if (loading) return <Typography sx={{ mt: 4, textAlign: 'center' }}>Loading dashboard data...</Typography>;
  if (error) return <Typography color="error" sx={{ mt: 4, textAlign: 'center' }}>{error}</Typography>;

  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={3}>
        {/* Filter Section */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <TextField
              label="Search deals..."
              variant="outlined"
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ width: 300 }}
            />
            <FormControl sx={{ width: 200 }}>
              <InputLabel>Filter by Stage</InputLabel>
              <Select
                value={filterStage}
                onChange={(e) => setFilterStage(e.target.value)}
              >
                <MenuItem value="">All Stages</MenuItem>
                {stages.map(stage => (
                  <MenuItem key={stage} value={stage}>{stage}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Grid>

        {/* Summary Cards */}
        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Total Deals</Typography>
            <Typography variant="h4">{filteredDeals.length}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Pipeline Value</Typography>
            <Typography variant="h4">${totalValue.toLocaleString()}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Win Rate</Typography>
            <Typography variant="h4">{winRate}%</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Avg. Deal Size</Typography>
            <Typography variant="h4">${avgDealSize.toLocaleString()}</Typography>
          </Paper>
        </Grid>

        {/* Charts */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Deal Stages</Typography>
            <Box sx={{ height: 300 }}>
              <Doughnut
                data={stageData}
                options={{
                  maintainAspectRatio: false,
                  plugins: { legend: { position: 'right' } }
                }}
              />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Monthly Trend</Typography>
            <Box sx={{ height: 300 }}>
              <Bar
                data={trendData}
                options={{
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: { y: { beginAtZero: true } }
                }}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Recent Deals */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Recent Deals</Typography>
            {filteredDeals.length > 0 ? (
              filteredDeals.slice(0, 5).map((deal, i) => (
                <Box key={i} sx={{ mb: 1 }}>
                  <Typography>{deal.title} - ${deal.value} - {deal.stage}</Typography>
                </Box>
              ))
            ) : (
              <Typography>No deals found.</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
