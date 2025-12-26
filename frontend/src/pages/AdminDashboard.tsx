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
  useMediaQuery,
  useTheme,
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
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
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
      // Fetch all data with error handling
      const [usersRes, readingsRes, factorsRes, insightsRes] = await Promise.all([
        apiClient.get('/api/auth/users/').catch(() => ({ data: [] })),
        apiClient.get('/api/readings/').catch(() => ({ data: [] })),
        apiClient.get('/api/health-factors/').catch(() => ({ data: [] })),
        apiClient.get('/api/insights/').catch(() => ({ data: [] })),
      ])

      // Handle paginated or direct array responses
      const users = usersRes.data.results || usersRes.data || []
      const readings = readingsRes.data.results || readingsRes.data || []
      const factors = factorsRes.data.results || factorsRes.data || []
      const insights = insightsRes.data.results || insightsRes.data || []

      const totalUsers = Array.isArray(users) ? users.length : 0
      const totalPatients = Array.isArray(users) 
        ? users.filter((u: any) => u.email?.includes('@patient.example.com')).length 
        : 0

      setStats({
        totalUsers,
        totalPatients,
        totalReadings: Array.isArray(readings) ? readings.length : 0,
        totalHealthFactors: Array.isArray(factors) ? factors.length : 0,
        totalInsights: Array.isArray(insights) ? insights.length : 0,
      })
    } catch (error) {
      console.error('Failed to fetch stats:', error)
      // Set defaults on error
      setStats({
        totalUsers: 0,
        totalPatients: 0,
        totalReadings: 0,
        totalHealthFactors: 0,
        totalInsights: 0,
      })
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
        <Toolbar sx={{ flexWrap: 'wrap' }}>
          <FavoriteIcon sx={{ mr: 1, fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 1,
              fontSize: { xs: '0.875rem', sm: '1.25rem' }
            }}
          >
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
              Cardiac Monitor Admin Panel ❤️
            </Box>
            <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
              Admin ❤️
            </Box>
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              mr: { xs: 1, sm: 2 },
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              display: { xs: 'none', sm: 'block' }
            }}
          >
            {user?.email}
          </Typography>
          <IconButton 
            color="inherit" 
            onClick={handleLogout}
            size={isMobile ? 'small' : 'medium'}
          >
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container 
        maxWidth="xl" 
        sx={{ 
          mt: { xs: 2, sm: 4 }, 
          mb: { xs: 2, sm: 4 },
          px: { xs: 1, sm: 2 }
        }}
      >
        <Typography 
          variant="h4" 
          gutterBottom
          sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' } }}
        >
          Admin Dashboard
        </Typography>

        {/* Statistics Cards */}
        <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={6} md={2.4}>
            <Card>
              <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                <Typography 
                  color="textSecondary" 
                  gutterBottom
                  sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                >
                  Total Users
                </Typography>
                <Typography 
                  variant="h4"
                  sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' } }}
                >
                  {stats.totalUsers}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={6} md={2.4}>
            <Card>
              <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                <Typography 
                  color="textSecondary" 
                  gutterBottom
                  sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                >
                  Patients
                </Typography>
                <Typography 
                  variant="h4"
                  sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' } }}
                >
                  {stats.totalPatients}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={6} md={2.4}>
            <Card>
              <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                <Typography 
                  color="textSecondary" 
                  gutterBottom
                  sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                >
                  Readings
                </Typography>
                <Typography 
                  variant="h4"
                  sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' } }}
                >
                  {stats.totalReadings}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={6} md={2.4}>
            <Card>
              <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                <Typography 
                  color="textSecondary" 
                  gutterBottom
                  sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                >
                  Health Factors
                </Typography>
                <Typography 
                  variant="h4"
                  sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' } }}
                >
                  {stats.totalHealthFactors}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={6} md={2.4}>
            <Card>
              <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                <Typography 
                  color="textSecondary" 
                  gutterBottom
                  sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                >
                  Insights
                </Typography>
                <Typography 
                  variant="h4"
                  sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' } }}
                >
                  {stats.totalInsights}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs for different sections */}
        <Paper sx={{ mt: { xs: 2, sm: 3 } }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', overflowX: 'auto' }}>
            <Tabs 
              value={activeTab} 
              onChange={(_, newValue) => setActiveTab(newValue)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTab-root': {
                  fontSize: { xs: '0.7rem', sm: '0.875rem' },
                  minWidth: { xs: 100, sm: 160 },
                  px: { xs: 1, sm: 2 }
                }
              }}
            >
              <Tab label={isMobile ? "Users" : "Users & Patients"} />
              <Tab label={isMobile ? "Readings" : "Blood Pressure Readings"} />
              <Tab label={isMobile ? "Factors" : "Health Factors"} />
              <Tab label="Insights" />
            </Tabs>
          </Box>

          <Box sx={{ p: { xs: 2, sm: 3 }, overflow: 'auto' }}>
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

