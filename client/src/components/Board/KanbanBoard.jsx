import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import {
  Box, Paper, Typography, Button, Card, CardContent, Chip,
  IconButton, Modal, TextField, Select, MenuItem, FormControl,
  InputLabel, Menu
} from '@mui/material';
import { MoreVert, AttachMoney } from '@mui/icons-material';
import API from '../../utils/api';

const stages = ['Lead', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];

const KanbanBoard = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedDealId, setSelectedDealId] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuDealId, setMenuDealId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newDeal, setNewDeal] = useState({
    title: '', company: '', value: '', stage: 'Lead',
    contactName: '', contactEmail: '', contactPhone: '',
    probability: '', notes: '', expectedCloseDate: ''
  });

  // File upload state
  const [uploadFile, setUploadFile] = useState(null);

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

  const handleCreateOrUpdateDeal = async () => {
    try {
      if (isEditing && selectedDealId) {
        const response = await API.put(`/deals/${selectedDealId}`, newDeal);
        setDeals(prev => prev.map(d => d._id === selectedDealId ? response.data : d));
      } else {
        const response = await API.post('/deals', newDeal);
        setDeals(prev => [...prev, response.data]);
      }
      setOpenModal(false);
      resetModal();
    } catch (error) {
      console.error('Error saving deal:', error);
    }
  };

  const handleDeleteDeal = async (id) => {
    try {
      await API.delete(`/deals/${id}`);
      setDeals(prev => prev.filter(d => d._id !== id));
    } catch (error) {
      console.error('Error deleting deal:', error);
    }
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination || source.droppableId === destination.droppableId) return;

    try {
      await API.patch(`/deals/${draggableId}/stage`, { stage: destination.droppableId });
      fetchDeals();
    } catch (error) {
      console.error('Error updating deal stage:', error);
    }
  };

  const openMenu = (event, id) => {
    setAnchorEl(event.currentTarget);
    setMenuDealId(id);
  };

  const closeMenu = () => {
    setAnchorEl(null);
    setMenuDealId(null);
  };

  const handleEdit = (deal) => {
    setNewDeal(deal);
    setSelectedDealId(deal._id);
    setIsEditing(true);
    setOpenModal(true);
    closeMenu();
  };

  const resetModal = () => {
    setIsEditing(false);
    setSelectedDealId(null);
    setNewDeal({
      title: '', company: '', value: '', stage: 'Lead',
      contactName: '', contactEmail: '', contactPhone: '',
      probability: '', notes: '', expectedCloseDate: ''
    });
  };

  const filteredDeals = deals.filter(deal =>
    deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    deal.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    deal.contactName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle JSON file upload
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadFile(file);
    }
  };

  const handleFileUpload = async () => {
    if (!uploadFile) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const jsonData = JSON.parse(e.target.result);
        if (Array.isArray(jsonData)) {
          for (let deal of jsonData) {
            const response = await API.post('/deals', deal);
            setDeals(prev => [...prev, response.data]);
          }
        } else {
          console.error('Invalid JSON format: Not an array');
        }
      } catch (error) {
        console.error('Error parsing JSON file:', error);
      }
    };
    reader.readAsText(uploadFile);
  };

  if (loading) return <Typography>Loading deals...</Typography>;

  return (
    <Box>
      {/* Top Controls: Add + Search + File Upload */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', m: 2 }}>
        <Button variant="contained" onClick={() => setOpenModal(true)}>
          + Add Deal
        </Button>
        <TextField
          label="Search deals..."
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ width: 300 }}
        />
        <Button variant="contained" component="label">
          Upload Deals
          <input type="file" accept=".json" hidden onChange={handleFileChange} />
        </Button>
        <Button variant="contained" onClick={handleFileUpload} disabled={!uploadFile}>
          Upload
        </Button>
      </Box>

      <Box sx={{ display: 'flex', overflowX: 'auto', px: 2, height: 'calc(100vh - 120px)' }}>
        <DragDropContext onDragEnd={onDragEnd}>
          {stages.map((stage) => (
            <Box key={stage} sx={{ minWidth: 280, mx: 1 }}>
              <Paper sx={{ p: 1, bgcolor: '#f5f5f5', height: '100%' }}>
                <Typography variant="h6" sx={{ p: 1, fontWeight: 'bold' }}>
                  {stage} ({filteredDeals.filter(d => d.stage === stage).length})
                </Typography>

                <Droppable droppableId={stage}>
                  {(provided) => (
                    <Box ref={provided.innerRef} {...provided.droppableProps} sx={{ height: 'calc(100% - 40px)', overflowY: 'auto' }}>
                      {filteredDeals
                        .filter(deal => deal.stage === stage)
                        .map((deal, index) => (
                          <Draggable key={deal._id} draggableId={deal._id} index={index}>
                            {(provided) => (
                              <Card ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} sx={{ mb: 2, bgcolor: 'white' }}>
                                <CardContent>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="h6">{deal.title}</Typography>
                                    <IconButton size="small" onClick={(e) => openMenu(e, deal._id)}><MoreVert /></IconButton>
                                  </Box>
                                  <Typography variant="body2" color="textSecondary">{deal.company}</Typography>
                                  <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between' }}>
                                    <Chip icon={<AttachMoney />} label={`$${deal.value.toLocaleString()}`} size="small" color="primary" />
                                    <Typography variant="caption">{new Date(deal.updatedAt).toLocaleDateString()}</Typography>
                                  </Box>
                                </CardContent>

                                <Menu
                                  anchorEl={anchorEl}
                                  open={menuDealId === deal._id}
                                  onClose={closeMenu}
                                >
                                  <MenuItem onClick={() => handleEdit(deal)}>Edit</MenuItem>
                                  <MenuItem onClick={() => handleDeleteDeal(deal._id)}>Delete</MenuItem>
                                </Menu>
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

      {/* Modal for Add/Edit Deal */}
      <Modal open={openModal} onClose={() => { setOpenModal(false); resetModal(); }}>
        <Box sx={{
          p: 3, bgcolor: 'white', width: 400, maxHeight: '90vh', overflowY: 'auto',
          mx: 'auto', mt: 5, display: 'flex', flexDirection: 'column', gap: 2, borderRadius: 2
        }}>
          <Typography variant="h6">{isEditing ? 'Edit Deal' : 'Add New Deal'}</Typography>
          <TextField label="Title" value={newDeal.title} onChange={(e) => setNewDeal({ ...newDeal, title: e.target.value })} />
          <TextField label="Company" value={newDeal.company} onChange={(e) => setNewDeal({ ...newDeal, company: e.target.value })} />
          <TextField label="Value" type="number" value={newDeal.value} onChange={(e) => setNewDeal({ ...newDeal, value: e.target.value })} />
          <FormControl fullWidth>
            <InputLabel>Stage</InputLabel>
            <Select value={newDeal.stage} label="Stage" onChange={(e) => setNewDeal({ ...newDeal, stage: e.target.value })}>
              {stages.map(stage => (<MenuItem key={stage} value={stage}>{stage}</MenuItem>))}
            </Select>
          </FormControl>
          <TextField label="Contact Name" value={newDeal.contactName} onChange={(e) => setNewDeal({ ...newDeal, contactName: e.target.value })} />
          <TextField label="Contact Email" value={newDeal.contactEmail} onChange={(e) => setNewDeal({ ...newDeal, contactEmail: e.target.value })} />
          <TextField label="Contact Phone" value={newDeal.contactPhone} onChange={(e) => setNewDeal({ ...newDeal, contactPhone: e.target.value })} />
          <TextField label="Probability (%)" type="number" value={newDeal.probability} onChange={(e) => setNewDeal({ ...newDeal, probability: e.target.value })} />
          <TextField label="Notes" multiline minRows={2} value={newDeal.notes} onChange={(e) => setNewDeal({ ...newDeal, notes: e.target.value })} />
          <TextField label="Expected Close Date" type="date" InputLabelProps={{ shrink: true }} value={newDeal.expectedCloseDate} onChange={(e) => setNewDeal({ ...newDeal, expectedCloseDate: e.target.value })} />
          <Button variant="contained" onClick={handleCreateOrUpdateDeal}>{isEditing ? 'Update' : 'Create'}</Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default KanbanBoard;
