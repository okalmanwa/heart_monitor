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
  Card,
  CardContent,
  Tabs,
  Tab,
  IconButton,
} from '@mui/material'
import FavoriteIcon from '@mui/icons-material/Favorite'
import LogoutIcon from '@mui/icons-material/Logout'
import { useAuth } from '../contexts/AuthContext'
import { useAdmin } from '../contexts/AdminContext'
import apiClient from '../config/axios'
import AdminUsers from '../components/admin/AdminUsers'
import AdminReadings from '../components/admin/AdminReadings'
import AdminHealthFactors from '../components/admin/AdminHealthFactors'
import AdminInsights from '../components/admin/AdminInsights'

const AdminDashboard = () => {
  const { user, logout } = useAuth()
  const { isAdmin, loading } = useAdmin()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState(0)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPatients: 0,
    totalReadings: 0,
    totalHealthFactors: 0,
    totalInsights: 0,
  })

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate('/dashboard')
    }
  }, [isAdmin, loading, navigate])

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // We'll create these endpoints or fetch from existing ones
      const [usersRes, readingsRes, factorsRes, insightsRes] = await Promise.all([
        apiClient.get('/api/auth/users/').catch(() => ({ data: { count: 0 } })),
        apiClient.get('/api/readings/').catch(() => ({ data: { count: 0 } })),
        apiClient.get('/api/health-factors/').catch(() => ({ data: { count: 0 } })),
        apiClient.get('/api/insights/').catch(() => ({ data: { count: 0 } })),
      ])

      const totalUsers = usersRes.data.count || usersRes.data.length || 0
      const totalPatients = usersRes.data.results?.filter((u: any) => 
        u.email?.includes('@patient.example.com')
      ).length || 0

      setStats({
        totalUsers,
        totalPatients,
        totalReadings: readingsRes.data.count || readingsRes.data.results?.length || 0,
        totalHealthFactors: factorsRes.data.count || factorsRes.data.results?.length || 0,
        totalInsights: insightsRes.data.count || insightsRes.data.results?.length || 0,
      })
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography>Loading...</Typography>
      </Box>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <Box>
      <AppBar position="static" sx={{ backgroundColor: '#d32f2f' }}>
        <Toolbar>
          <FavoriteIcon sx={{ mr: 1 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Moyo Admin Panel ❤️
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            {user?.email}
          </Typography>
          <IconButton color="inherit" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Admin Dashboard
        </Typography>

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Users
                </Typography>
                <Typography variant="h4">
                  {stats.totalUsers}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Patients
                </Typography>
                <Typography variant="h4">
                  {stats.totalPatients}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Readings
                </Typography>
                <Typography variant="h4">
                  {stats.totalReadings}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Health Factors
                </Typography>
                <Typography variant="h4">
                  {stats.totalHealthFactors}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Insights
                </Typography>
                <Typography variant="h4">
                  {stats.totalInsights}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs for different sections */}
        <Paper sx={{ mt: 3 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
              <Tab label="Users & Patients" />
              <Tab label="Blood Pressure Readings" />
              <Tab label="Health Factors" />
              <Tab label="Insights" />
            </Tabs>
          </Box>

          <Box sx={{ p: 3 }}>
            {activeTab === 0 && <AdminUsers onUpdate={fetchStats} />}
            {activeTab === 1 && <AdminReadings onUpdate={fetchStats} />}
            {activeTab === 2 && <AdminHealthFactors onUpdate={fetchStats} />}
            {activeTab === 3 && <AdminInsights onUpdate={fetchStats} />}
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}

export default AdminDashboard

