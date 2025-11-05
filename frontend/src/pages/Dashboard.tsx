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
} from '@mui/material'
import FavoriteIcon from '@mui/icons-material/Favorite'
import { useAuth } from '../contexts/AuthContext'
import ReadingForm from '../components/ReadingForm'
import ReadingsTable from '../components/ReadingsTable'
import BPChart from '../components/BPChart'
import HealthFactorsForm from '../components/HealthFactorsForm'
import HealthFactorsTable from '../components/HealthFactorsTable'
import MedicationForm from '../components/MedicationForm'
import MedicationsTable from '../components/MedicationsTable'
import AdvancedBPChart from '../components/AdvancedBPChart'
import CorrelationChart from '../components/CorrelationChart'
import NotificationPreferences from '../components/NotificationPreferences'
import { BloodPressureReading, HealthFactor, Medication } from '../types'
import apiClient from '../config/axios'

const Dashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [readings, setReadings] = useState<BloodPressureReading[]>([])
  const [healthFactors, setHealthFactors] = useState<HealthFactor[]>([])
  const [medications, setMedications] = useState<Medication[]>([])
  const [loading, setLoading] = useState(true)
  const [factorsLoading, setFactorsLoading] = useState(true)
  const [medicationsLoading, setMedicationsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(0)
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null)

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

  const fetchHealthFactors = async () => {
    try {
      const response = await apiClient.get('/api/health-factors/')
      setHealthFactors(response.data.results || response.data)
    } catch (error) {
      console.error('Failed to fetch health factors:', error)
    } finally {
      setFactorsLoading(false)
    }
  }

  const fetchMedications = async () => {
    try {
      const response = await apiClient.get('/api/medications/medications/')
      setMedications(response.data.results || response.data)
    } catch (error) {
      console.error('Failed to fetch medications:', error)
    } finally {
      setMedicationsLoading(false)
    }
  }

  useEffect(() => {
    fetchReadings()
    fetchHealthFactors()
    fetchMedications()
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

  const handleFactorAdded = (newFactor: HealthFactor) => {
    setHealthFactors([newFactor, ...healthFactors])
  }

  const handleFactorDeleted = (id: number) => {
    setHealthFactors(healthFactors.filter(f => f.id !== id))
  }

  const handleMedicationAdded = (newMedication: Medication) => {
    setMedications([newMedication, ...medications])
  }

  const handleMedicationDeleted = (id: number) => {
    setMedications(medications.filter(m => m.id !== id))
  }

  const handleMedicationUpdated = (updatedMedication: Medication) => {
    setMedications(medications.map(m => m.id === updatedMedication.id ? updatedMedication : m))
    setEditingMedication(null)
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
          {(user as any)?.is_staff && (
            <Button
              color="inherit"
              href="/admin"
              sx={{ mr: 1 }}
            >
              Admin Panel
            </Button>
          )}
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome, {user?.first_name || user?.username || 'User'}!
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
            <Tab label="Blood Pressure" />
            <Tab label="Health Factors" />
            <Tab label="Medications" />
            <Tab label="Charts" />
            <Tab label="Notifications" />
          </Tabs>
        </Box>

        {activeTab === 0 && (
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
                <AdvancedBPChart readings={readings} />
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
        )}

        {activeTab === 1 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Track Health Factors
                </Typography>
                <HealthFactorsForm onFactorAdded={handleFactorAdded} />
              </Paper>
            </Grid>

            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Health Factors History
                </Typography>
                <HealthFactorsTable
                  factors={healthFactors}
                  loading={factorsLoading}
                  onFactorDeleted={handleFactorDeleted}
                />
              </Paper>
            </Grid>
          </Grid>
        )}

        {activeTab === 2 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  {editingMedication ? 'Edit Medication' : 'Add Medication'}
                </Typography>
                <MedicationForm
                  onMedicationAdded={handleMedicationAdded}
                  onMedicationUpdated={handleMedicationUpdated}
                  initialData={editingMedication || undefined}
                  onCancel={() => setEditingMedication(null)}
                />
              </Paper>
            </Grid>

            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  My Medications
                </Typography>
                <MedicationsTable
                  medications={medications}
                  loading={medicationsLoading}
                  onMedicationDeleted={handleMedicationDeleted}
                  onMedicationUpdated={handleMedicationUpdated}
                  onEdit={setEditingMedication}
                />
              </Paper>
            </Grid>
          </Grid>
        )}

        {activeTab === 3 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Advanced Charts & Correlations
                </Typography>
                <Box sx={{ mb: 3 }}>
                  <AdvancedBPChart readings={readings} />
                </Box>
                <CorrelationChart readings={readings} healthFactors={healthFactors} />
              </Paper>
            </Grid>
          </Grid>
        )}

        {activeTab === 4 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <NotificationPreferences />
            </Grid>
          </Grid>
        )}
      </Container>
    </Box>
  )
}

export default Dashboard

