import React, { useState } from 'react';
import { Box, Paper, Typography, TextField, Button, CircularProgress, Divider, List, ListItem, ListItemText } from '@mui/material';
import axios from 'axios';

const AIAssistant = ({ deals }) => {
  const [prompt, setPrompt] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleGetSuggestions = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        'http://localhost:5000/api/ai/suggestions',
        { prompt, deals },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setSuggestions(response.data.suggestions);
      setLoading(false);
    } catch (error) {
      console.error('Error getting AI suggestions:', error);
      setLoading(false);
    }
  };

  const handleQuickPrompt = (quickPrompt) => {
    setPrompt(quickPrompt);
  };

  return (
    <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" gutterBottom>
        AI Sales Assistant
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          Quick prompts:
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Button 
            size="small" 
            variant="outlined" 
            onClick={() => handleQuickPrompt('Which deals should I prioritize today?')}
          >
            Prioritize Deals
          </Button>
          <Button 
            size="small" 
            variant="outlined" 
            onClick={() => handleQuickPrompt('Suggest follow-up actions for stalled deals')}
          >
            Stalled Deals
          </Button>
          <Button 
            size="small" 
            variant="outlined" 
            onClick={() => handleQuickPrompt('Analyze conversion rates by stage')}
          >
            Analyze Conversion
          </Button>
        </Box>
      </Box>
      
      <TextField
        fullWidth
        label="Ask about your sales pipeline"
        multiline
        rows={2}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        variant="outlined"
        sx={{ mb: 2 }}
      />
      
      <Button 
        variant="contained" 
        onClick={handleGetSuggestions} 
        disabled={loading || !prompt}
        sx={{ mb: 2 }}
      >
        {loading ? <CircularProgress size={24} /> : 'Get Suggestions'}
      </Button>
      
      <Divider sx={{ mb: 2 }} />
      
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        {suggestions.length > 0 ? (
          <List>
            {suggestions.map((suggestion, index) => (
              <ListItem key={index} divider={index < suggestions.length - 1}>
                <ListItemText 
                  primary={suggestion.title} 
                  secondary={suggestion.description} 
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography color="textSecondary" align="center">
            {loading ? 'Thinking...' : 'Ask me about your sales pipeline to get AI-powered insights'}
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

export default AIAssistant;