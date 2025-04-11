import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // reset error before new attempt
    try {
      const { data } = await authService.login({ email, password });
      login(data.token);
      navigate('/dashboard');
    } catch (err) {
      const message =
        err?.response?.data?.message || 'Login failed. Please try again.';
      setError(message);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 400, mx: 'auto', mt: 10 }}>
      <Typography variant="h5" gutterBottom>Login</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          fullWidth margin="normal" label="Email"
          value={email} onChange={e => setEmail(e.target.value)}
        />
        <TextField
          fullWidth margin="normal" label="Password" type="password"
          value={password} onChange={e => setPassword(e.target.value)}
        />
        <Button fullWidth variant="contained" type="submit" sx={{ mt: 2 }}>
          Login
        </Button>
      </Box>
    </Paper>
  );
};

export default Login;