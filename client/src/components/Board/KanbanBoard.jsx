import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Box, Paper, Typography, Button, Card, CardContent, Chip, IconButton } from '@mui/material';
import { MoreVert, AttachMoney } from '@mui/icons-material';
import axios from 'axios';

const stages = ['Lead', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];

const KanbanBoard = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/deals', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setDeals(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching deals:', error);
      setLoading(false);
    }
  };

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    
    const { source, destination, draggableId } = result;
    
    if (source.droppableId === destination.droppableId) return;
    
    try {
      const response = await axios.patch(
        `http://localhost:5000/api/deals/${draggableId}/stage`,
        { stage: destination.droppableId },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      
      fetchDeals();
    } catch (error) {
      console.error('Error updating deal stage:', error);
    }
  };

  if (loading) return <Typography>Loading deals...</Typography>;

  return (
    <Box sx={{ display: 'flex', overflowX: 'auto', p: 1, height: 'calc(100vh - 120px)' }}>
      <DragDropContext onDragEnd={onDragEnd}>
        {stages.map((stage) => (
          <Box key={stage} sx={{ minWidth: 280, mx: 1 }}>
            <Paper sx={{ p: 1, bgcolor: '#f5f5f5', height: '100%' }}>
              <Typography variant="h6" sx={{ p: 1, fontWeight: 'bold' }}>
                {stage} ({deals.filter(deal => deal.stage === stage).length})
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
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                  <Typography variant="h6">{deal.title}</Typography>
                                  <IconButton size="small"><MoreVert /></IconButton>
                                </Box>
                                <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                                  {deal.company}
                                </Typography>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Chip 
                                    icon={<AttachMoney />} 
                                    label={`$${deal.value.toLocaleString()}`} 
                                    size="small" 
                                    color="primary"
                                  />
                                  <Typography variant="caption" color="textSecondary">
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
  );
};

export default KanbanBoard;