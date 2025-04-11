import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { useAuth } from '../../context/AuthContext';

const DealList = () => {
  const [deals, setDeals] = useState([]);
  const { token } = useAuth();

  useEffect(() => {
    const fetchDeals = async () => {
      const res = await fetch('https://aipipeline-l70a.onrender.com/api/deals', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      setDeals(data);
    };
    fetchDeals();
  }, [token]);

  return (
    <Box p={3}>
      <Typography variant="h4">Deals</Typography>
      {deals.map(deal => (
        <Paper key={deal.id} sx={{ p: 2, my: 1 }}>
          <Typography variant="h6">{deal.title}</Typography>
          <Typography variant="body2">{deal.description}</Typography>
        </Paper>
      ))}
    </Box>
  );
};

export default DealList;

