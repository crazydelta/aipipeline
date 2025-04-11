import React, { useState, useEffect } from 'react';
import { Grid, Box, Paper, Typography } from '@mui/material';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import axios from 'axios';

Chart.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalDeals: 0,
    totalValue: 0,
    stageDistribution: {},
    monthlyTrend: [],
    winRate: 0,
    avgDealSize: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get('https://aipipeline-l70a.onrender.com/api/analytics/dashboard', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      console.log('Dashboard stats:', response.data);
      setStats({
        totalDeals: response.data.totalDeals || 0,
        totalValue: response.data.totalValue || 0,
        stageDistribution: response.data.stageDistribution || {},
        monthlyTrend: response.data.monthlyTrend || [],
        winRate: response.data.winRate || 0,
        avgDealSize: response.data.avgDealSize || 0,
        insights: response.data.insights || [],
        recentDeals: response.data.recentDeals || [],  // ✅ Add this
      });
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };
  

 /* const fetchStats = async () => {
    try {
      const response = await axios.get('https://aipipeline-l70a.onrender.com/api/analytics/dashboard', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      console.log('Dashboard stats:', response.data);
      setStats({
        totalDeals: response.data.totalDeals || 0,
        totalValue: response.data.totalValue || 0,
        stageDistribution: response.data.stageDistribution || {},
        monthlyTrend: response.data.monthlyTrend || [],
        winRate: response.data.winRate || 0,
        avgDealSize: response.data.avgDealSize || 0,
      });
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };*/

  const stageData = {
    labels: Object.keys(stats.stageDistribution || {}),
    datasets: [
      {
        data: Object.values(stats.stageDistribution || {}),
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
        ],
        borderWidth: 0,
      },
    ],
  };

  const trendData = {
    labels: (stats.monthlyTrend || []).map(item => item.month),
    datasets: [
      {
        label: 'Deal Value ($)',
        data: (stats.monthlyTrend || []).map(item => item.value),
        backgroundColor: '#36A2EB',
      },
    ],
  };

  if (loading) return <Typography sx={{ mt: 4, textAlign: 'center' }}>Loading dashboard data...</Typography>;
  if (error) return <Typography color="error" sx={{ mt: 4, textAlign: 'center' }}>{error}</Typography>;

  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>Total Deals</Typography>
            <Typography variant="h4">{stats.totalDeals}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>Pipeline Value</Typography>
            <Typography variant="h4">${stats.totalValue.toLocaleString()}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>Win Rate</Typography>
            <Typography variant="h4">{stats.winRate}%</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>Avg. Deal Size</Typography>
            <Typography variant="h4">${stats.avgDealSize.toLocaleString()}</Typography>
          </Paper>
        </Grid>

        {/* Charts */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              AI Insights
            </Typography>
            {stats.insights && stats.insights.length > 0 ? (
              <ul>
                {stats.insights.map((insight, index) => (
                  <li key={index}>
                    <Typography>{insight}</Typography>
                  </li>
                ))}
              </ul>
            ) : (
              <Typography>No insights available yet.</Typography>
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Deal Stages</Typography>
            <Box sx={{ height: 300 }}>
              <Doughnut 
                data={stageData} 
                options={{ 
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'right',
                    }
                  }
                }} 
              />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Recent Deals</Typography>
            {stats.recentDeals && stats.recentDeals.length > 0 ? (
              stats.recentDeals.slice(0, 5).map((deal, index) => (
                <Box key={index} sx={{ mb: 1 }}>
                  <Typography variant="body1">
                    {deal.title} - ${deal.value} - {deal.stage}
                  </Typography>
                </Box>
              ))
            ) : (
              <Typography>No recent deals.</Typography>
            )}
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
                  plugins: {
                    legend: {
                      display: false
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true
                    }
                  }
                }} 
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
