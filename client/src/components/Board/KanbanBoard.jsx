import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Button, Card, CardContent, Chip,
  IconButton, Modal, TextField, Select, MenuItem, FormControl,
  InputLabel, Snackbar
} from '@mui/material';
import { MoreVert, AttachMoney } from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import API from '../../utils/api';

const stages = ['Lead', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];

const KanbanBoard = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [newDeal, setNewDeal] = useState({
    title: '',
    company: '',
    value: '',
    stage: 'Lead',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    probability: '',
    notes: '',
    expectedCloseDate: '',
  });

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      const response = await API.get('/deals');
      setDeals(response.data);
    } catch (error) {
      console.error('Error fetching deals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDeal = async () => {
    if (!newDeal.title || !newDeal.company || !newDeal.value) {
      alert('Please fill in all required fields.');
      return;
    }

    try {
      const response = await API.post('/deals', {
        ...newDeal,
        value: parseFloat(newDeal.value),
        probability: parseInt(newDeal.probability),
      });
      setDeals(prev => [...prev, response.data]);
      setOpenModal(false);
      setNewDeal({
        title: '',
        company: '',
        value: '',
        stage: 'Lead',
        contactName: '',
        contactEmail: '',
        contactPhone: '',
        probability: '',
        notes: '',
        expectedCloseDate: '',
      });
      setSuccessMessage('Deal created successfully!');
    } catch (error) {
      console.error('Error creating deal:', error);
    }
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination || source.droppableId === destination.droppableId) return;

    try {
      await API.patch(`/deals/${draggableId}/stage`, {
        stage: destination.droppableId
      });
      fetchDeals();
    } catch (error) {
      console.error('Error updating deal stage:', error);
    }
  };

  if (loading) return <Typography>Loading deals...</Typography>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', m: 2 }}>
        <Button variant="contained" onClick={() => setOpenModal(true)}>
          + Add Deal
        </Button>
      </Box>

      <Box sx={{ display: 'flex', overflowX: 'auto', px: 2, height: 'calc(100vh - 120px)' }}>
        <DragDropContext onDragEnd={onDragEnd}>
          {stages.map((stage) => (
            <Box key={stage} sx={{ minWidth: 280, mx: 1 }}>
              <Paper sx={{ p: 1, bgcolor: '#f5f5f5', height: '100%' }}>
                <Typography variant="h6" sx={{ p: 1, fontWeight: 'bold' }}>
                  {stage} ({deals.filter(d => d.stage === stage).length})
                </Typography>

                <Droppable droppableId={stage}>
                  {(provided) => (
                    <Box
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      sx={{ height: 'calc(100% - 40px)', overflowY: 'auto' }}
                    >
                      {deals
                        .filter(deal => deal.stage === stage)
                        .map((deal, index) => (
                          <Draggable key={deal._id} draggableId={deal._id} index={index}>
                            {(provided) => (
                              <Card
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                sx={{ mb: 2, bgcolor: 'white' }}
                              >
                                <CardContent>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="h6">{deal.title}</Typography>
                                    <IconButton size="small"><MoreVert /></IconButton>
                                  </Box>
                                  <Typography variant="body2" color="textSecondary">
                                    {deal.company}
                                  </Typography>
                                  <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between' }}>
                                    <Chip
                                      icon={<AttachMoney />}
                                      label={`$${deal.value.toLocaleString()}`}
                                      size="small"
                                      color="primary"
                                    />
                                    <Typography variant="caption">
                                      {new Date(deal.updatedAt).toLocaleDateString()}
                                    </Typography>
                                  </Box>
                                </CardContent>
                              </Card>
                            )}
                          </Draggable>
                        ))}
                      {provided.placeholder}
                    </Box>
                  )}
                </Droppable>
              </Paper>
            </Box>
          ))}
        </DragDropContext>
      </Box>

      {/* Add Deal Modal */}
      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          p: 3,
          bgcolor: 'white',
          width: '90%',
          maxWidth: 400,
          maxHeight: '90vh',
          overflowY: 'auto',
          borderRadius: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}>
          <Typography variant="h6">Add New Deal</Typography>
          <TextField label="Title" value={newDeal.title} onChange={(e) => setNewDeal({ ...newDeal, title: e.target.value })} />
          <TextField label="Company" value={newDeal.company} onChange={(e) => setNewDeal({ ...newDeal, company: e.target.value })} />
          <TextField label="Value" type="number" value={newDeal.value} onChange={(e) => setNewDeal({ ...newDeal, value: e.target.value })} />
          <FormControl fullWidth>
            <InputLabel>Stage</InputLabel>
            <Select
              value={newDeal.stage}
              label="Stage"
              onChange={(e) => setNewDeal({ ...newDeal, stage: e.target.value })}
            >
              {stages.map(stage => (
                <MenuItem key={stage} value={stage}>{stage}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField label="Contact Name" value={newDeal.contactName} onChange={(e) => setNewDeal({ ...newDeal, contactName: e.target.value })} />
          <TextField label="Contact Email" value={newDeal.contactEmail} onChange={(e) => setNewDeal({ ...newDeal, contactEmail: e.target.value })} />
          <TextField label="Contact Phone" value={newDeal.contactPhone} onChange={(e) => setNewDeal({ ...newDeal, contactPhone: e.target.value })} />
          <TextField label="Probability (%)" type="number" value={newDeal.probability} onChange={(e) => setNewDeal({ ...newDeal, probability: e.target.value })} />
          <TextField label="Notes" multiline minRows={2} value={newDeal.notes} onChange={(e) => setNewDeal({ ...newDeal, notes: e.target.value })} />
          <TextField
            label="Expected Close Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={newDeal.expectedCloseDate}
            onChange={(e) => setNewDeal({ ...newDeal, expectedCloseDate: e.target.value })}
          />
          <Button variant="contained" onClick={handleCreateDeal}>Create</Button>
        </Box>
      </Modal>

      {/* Snackbar */}
      <Snackbar
        open={Boolean(successMessage)}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage('')}
        message={successMessage}
      />
    </Box>
  );
};

export default KanbanBoard;
