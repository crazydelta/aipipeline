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
    monthlyTrend: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/analytics/dashboard', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setStats(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setLoading(false);
    }
  };

  const stageData = {
    labels: Object.keys(stats.stageDistribution),
    datasets: [
      {
        data: Object.values(stats.stageDistribution),
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
        ],
        borderWidth: 0,
      },
    ],
  };

  const trendData = {
    labels: stats.monthlyTrend.map(item => item.month),
    datasets: [
      {
        label: 'Deal Value ($)',
        data: stats.monthlyTrend.map(item => item.value),
        backgroundColor: '#36A2EB',
      },
    ],
  };

  if (loading) return <Typography>Loading dashboard data...</Typography>;

  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Total Deals
            </Typography>
            <Typography variant="h4">
              {stats.totalDeals}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Pipeline Value
            </Typography>
            <Typography variant="h4">
              ${stats.totalValue.toLocaleString()}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Win Rate
            </Typography>
            <Typography variant="h4">
              {stats.winRate || 0}%
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Avg. Deal Size
            </Typography>
            <Typography variant="h4">
              ${stats.avgDealSize ? stats.avgDealSize.toLocaleString() : 0}
            </Typography>
          </Paper>
        </Grid>

        {/* Charts */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Deal Stages
            </Typography>
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
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Monthly Trend
            </Typography>
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