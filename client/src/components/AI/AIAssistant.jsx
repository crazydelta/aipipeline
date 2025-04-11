import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Divider,
} from '@mui/material';

const AIAssistant = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Hi! I\'m your assistant. Ask me anything about your pipeline or deals.' },
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('https://aipipeline-l70a.onrender.com/api/ai/assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: input }),
      });

      const data = await res.json();
      const aiReply = {
        sender: 'ai',
        text: data.insights || 'Sorry, no response received.',
      };
      setMessages((prev) => [...prev, aiReply]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: 'Oops, something went wrong.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Paper elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2 }}>
      <Typography variant="h6" gutterBottom>
        AI Assistant 🤖
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <Box sx={{ flexGrow: 1, overflowY: 'auto', mb: 2 }}>
        {messages.map((msg, index) => (
          <Box
            key={index}
            sx={{
              mb: 1,
              textAlign: msg.sender === 'user' ? 'right' : 'left',
              color: msg.sender === 'user' ? 'primary.main' : 'text.secondary',
            }}
          >
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
              {msg.text}
            </Typography>
          </Box>
        ))}
      </Box>
      <Box component="form" onSubmit={(e) => { e.preventDefault(); handleSend(); }}>
        <TextField
          fullWidth
          multiline
          minRows={2}
          maxRows={4}
          placeholder="Ask something like: Suggest deals to prioritize..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          disabled={loading}
        />
        <Button
          fullWidth
          variant="contained"
          sx={{ mt: 1 }}
          onClick={handleSend}
          disabled={loading}
        >
          {loading ? 'Thinking...' : 'Send'}
        </Button>
      </Box>
    </Paper>
  );
};

export default AIAssistant;
