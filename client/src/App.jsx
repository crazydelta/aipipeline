import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box, Grid } from '@mui/material';

// Components
import NavBar from './components/Layout/NavBar';
import Dashboard from './components/Dashboard/Dashboard';
import KanbanBoard from './components/Board/KanbanBoard';
import AIAssistant from './components/AI/AIAssistant';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import DealForm from './components/Deals/DealForm';
import DealList from './components/Deals/DealList';
import { useAuth } from './context/AuthContext';

// Route protection
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <NavBar />
          <Box component="main" sx={{ flexGrow: 1, px: { xs: 1, sm: 2, md: 3 } }}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/pipeline"
                element={
                  <ProtectedRoute>
                    <Grid container spacing={2} sx={{ mt: 2 }}>
                      <Grid item xs={12} md={8}>
                        <KanbanBoard />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <AIAssistant />
                      </Grid>
                    </Grid>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/deals"
                element={
                  <ProtectedRoute>
                    <DealList />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/deals/new"
                element={
                  <ProtectedRoute>
                    <DealForm />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/deals/:id"
                element={
                  <ProtectedRoute>
                    <DealForm />
                  </ProtectedRoute>
                }
              />

              <Route path="/" element={<Navigate to="/dashboard" />} />
            </Routes>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;