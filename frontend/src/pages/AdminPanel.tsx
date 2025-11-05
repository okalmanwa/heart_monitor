import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Container,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Grid,
  Paper,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
} from '@mui/material'
import FavoriteIcon from '@mui/icons-material/Favorite'
import { useAuth } from '../contexts/AuthContext'
import AdminUsers from '../components/admin/AdminUsers'
import AdminReadings from '../components/admin/AdminReadings'
import AdminHealthFactors from '../components/admin/AdminHealthFactors'
import AdminInsights from '../components/admin/AdminInsights'
import apiClient from '../config/axios'

const AdminPanel = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState(0)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    // Check if user is admin (you can add proper admin check via API)
    // For now, we'll allow access if user exists
    // In production, you'd check user.is_staff or user.is_superuser from backend
    if (user) {
      setIsAdmin(true)
      setLoading(false)
    } else {
      setError('You must be logged in to access admin panel')
      setLoading(false)
    }
  }, [user])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    )
  }

  if (error || !isAdmin) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">
          {error || 'You do not have permission to access this page.'}
        </Alert>
        <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/dashboard')}>
          Go to Dashboard
        </Button>
      </Container>
    )
  }

  return (
    <Box>
      <AppBar position="static" sx={{ backgroundColor: '#d32f2f' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <FavoriteIcon /> Moyo Admin Panel ❤️
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            {user?.email}
          </Typography>
          <Button color="inherit" onClick={() => navigate('/dashboard')} sx={{ mr: 1 }}>
            Dashboard
          </Button>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Admin Control Panel
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Manage patients, readings, health factors, and insights
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
            <Tab label="Users" />
            <Tab label="Blood Pressure Readings" />
            <Tab label="Health Factors" />
            <Tab label="Insights" />
          </Tabs>
        </Box>

        {activeTab === 0 && <AdminUsers />}
        {activeTab === 1 && <AdminReadings />}
        {activeTab === 2 && <AdminHealthFactors />}
        {activeTab === 3 && <AdminInsights />}
      </Container>
    </Box>
  )
}

export default AdminPanel

