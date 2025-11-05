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
} from '@mui/material'
import FavoriteIcon from '@mui/icons-material/Favorite'
import { useAuth } from '../contexts/AuthContext'
import ReadingForm from '../components/ReadingForm'
import ReadingsTable from '../components/ReadingsTable'
import BPChart from '../components/BPChart'
import { BloodPressureReading } from '../types'
import apiClient from '../config/axios'

const Dashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [readings, setReadings] = useState<BloodPressureReading[]>([])
  const [loading, setLoading] = useState(true)

  const fetchReadings = async () => {
    try {
      const response = await apiClient.get('/api/readings/')
      setReadings(response.data.results || response.data)
    } catch (error) {
      console.error('Failed to fetch readings:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReadings()
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleReadingAdded = (newReading: BloodPressureReading) => {
    setReadings([newReading, ...readings])
  }

  const handleReadingDeleted = (id: number) => {
    setReadings(readings.filter(r => r.id !== id))
  }

  return (
    <Box>
      <AppBar position="static" sx={{ backgroundColor: '#d32f2f' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <FavoriteIcon /> Moyo - Cardiac Health Monitoring
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            {user?.email}
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome, {user?.first_name || user?.username || 'User'}!
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Add Reading
              </Typography>
              <ReadingForm onReadingAdded={handleReadingAdded} />
            </Paper>
          </Grid>

          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Blood Pressure Trends
              </Typography>
              <BPChart readings={readings} />
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                All Readings
              </Typography>
              <ReadingsTable
                readings={readings}
                loading={loading}
                onReadingDeleted={handleReadingDeleted}
                onExportPDF={async () => {
                  try {
                    const response = await apiClient.get('/api/readings/export-pdf/', {
                      responseType: 'blob',
                    })
                    const url = window.URL.createObjectURL(new Blob([response.data]))
                    const link = document.createElement('a')
                    link.href = url
                    link.setAttribute('download', 'moyo_blood_pressure_report.pdf')
                    document.body.appendChild(link)
                    link.click()
                    link.remove()
                  } catch (error) {
                    console.error('Failed to export PDF:', error)
                    alert('Failed to export PDF. Please try again.')
                  }
                }}
              />
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}

export default Dashboard

