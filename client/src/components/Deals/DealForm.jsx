import React, { useState } from 'react';
import { Box, TextField, Button, Typography } from '@mui/material';
import { useAuth } from '../../context/AuthContext';

const DealForm = () => {
  const { token } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('https://aipipeline-l70a.onrender.com/api/deals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ title, description })
    });
    const data = await res.json();
    alert('Deal created!');
    setTitle('');
    setDescription('');
  };

  return (
    <Box p={3} component="form" onSubmit={handleSubmit}>
      <Typography variant="h5" mb={2}>Create New Deal</Typography>
      <TextField fullWidth label="Title" value={title} onChange={e => setTitle(e.target.value)} margin="normal" />
      <TextField fullWidth label="Description" value={description} onChange={e => setDescription(e.target.value)} margin="normal" />
      <Button variant="contained" type="submit">Create</Button>
    </Box>
  );
};

export default DealForm;

