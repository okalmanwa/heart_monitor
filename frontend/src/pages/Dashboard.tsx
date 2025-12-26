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
  useMediaQuery,
  useTheme,
} from '@mui/material'
import FavoriteIcon from '@mui/icons-material/Favorite'
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart'
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety'
import MedicationIcon from '@mui/icons-material/Medication'
import BarChartIcon from '@mui/icons-material/BarChart'
import LightbulbIcon from '@mui/icons-material/Lightbulb'
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
import PulseRateChart from '../components/PulseRateChart'
import Insights from '../components/Insights'
import { BloodPressureReading, HealthFactor, Medication } from '../types'
import apiClient from '../config/axios'

const Dashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
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
    // Update local state immediately with the updated medication
    if (updatedMedication.id) {
      setMedications(medications.map(m => m.id === updatedMedication.id ? updatedMedication : m))
    }
    setEditingMedication(null)
  }

  return (
    <Box>
      <AppBar position="static" sx={{ backgroundColor: '#d32f2f' }}>
        <Toolbar sx={{ flexWrap: 'wrap' }}>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 1, 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              fontSize: { xs: '1rem', sm: '1.25rem' }
            }}
          >
            <FavoriteIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }} /> 
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
              Cardiac Monitor
            </Box>
            <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
              CM
            </Box>
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Typography 
              variant="body2" 
              sx={{ 
                mr: { xs: 0, sm: 2 },
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                display: { xs: 'none', sm: 'block' }
              }}
            >
              {user?.email}
            </Typography>
            {(user as any)?.is_staff && (
              <Button
                color="inherit"
                href="/admin"
                sx={{ 
                  mr: { xs: 0.5, sm: 1 },
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  px: { xs: 1, sm: 2 }
                }}
              >
                Admin
              </Button>
            )}
            <Button 
              color="inherit" 
              onClick={handleLogout}
              sx={{ 
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                px: { xs: 1, sm: 2 }
              }}
            >
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: { xs: 2, sm: 4 }, mb: { xs: 2, sm: 4 }, px: { xs: 1, sm: 2 } }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: { xs: 2, sm: 3 }, overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <Tabs 
            value={activeTab} 
            onChange={(_, newValue) => setActiveTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              minHeight: { xs: 48, sm: 64 },
              '& .MuiTabs-scrollButtons': {
                width: { xs: 32, sm: 40 },
                '&.Mui-disabled': {
                  opacity: 0.3,
                },
              },
              '& .MuiTab-root': {
                fontSize: { xs: '0.8rem', sm: '0.9rem' },
                fontWeight: 500,
                minWidth: { xs: 80, sm: 120 },
                px: { xs: 1.5, sm: 2.5 },
                py: { xs: 1, sm: 1.5 },
                textTransform: 'none',
                color: 'text.secondary',
                minHeight: { xs: 48, sm: 64 },
                '&:hover': {
                  color: 'primary.main',
                },
                '&.Mui-selected': {
                  color: 'primary.main',
                  fontWeight: 600,
                },
                '& .MuiTab-iconWrapper': {
                  marginRight: { xs: '0.5rem', sm: '0.75rem' },
                },
              },
            }}
          >
            <Tab 
              icon={<MonitorHeartIcon sx={{ fontSize: { xs: '1.1rem', sm: '1.2rem' } }} />}
              iconPosition="start"
              label={isMobile ? "BP" : "Blood Pressure"}
              aria-label="Blood Pressure"
            />
            <Tab 
              icon={<HealthAndSafetyIcon sx={{ fontSize: { xs: '1.1rem', sm: '1.2rem' } }} />}
              iconPosition="start"
              label={isMobile ? "Health" : "Health Factors"}
              aria-label="Health Factors"
            />
            <Tab 
              icon={<MedicationIcon sx={{ fontSize: { xs: '1.1rem', sm: '1.2rem' } }} />}
              iconPosition="start"
              label={isMobile ? "Meds" : "Medications"}
              aria-label="Medications"
            />
            <Tab 
              icon={<BarChartIcon sx={{ fontSize: { xs: '1.1rem', sm: '1.2rem' } }} />}
              iconPosition="start"
              label="Charts"
              aria-label="Charts"
            />
            <Tab 
              icon={<LightbulbIcon sx={{ fontSize: { xs: '1.1rem', sm: '1.2rem' } }} />}
              iconPosition="start"
              label="Insights"
              aria-label="AI Insights"
            />
          </Tabs>
        </Box>

        {activeTab === 0 && (
          <Grid container spacing={{ xs: 2, sm: 3 }}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: { xs: 2, sm: 3 } }}>
                <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
                  Add Reading
                </Typography>
                <ReadingForm onReadingAdded={handleReadingAdded} />
              </Paper>
            </Grid>

            <Grid item xs={12} md={8}>
              <Paper sx={{ p: { xs: 2, sm: 3 } }}>
                <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
                  Blood Pressure Trends
                </Typography>
                <AdvancedBPChart readings={readings} />
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper sx={{ p: { xs: 2, sm: 3 }, overflow: 'auto' }}>
                <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
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
                      link.setAttribute('download', 'cardiac_monitor_blood_pressure_report.pdf')
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
          <Grid container spacing={{ xs: 2, sm: 3 }}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: { xs: 2, sm: 3 } }}>
                <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
                  Track Health Factors
                </Typography>
                <HealthFactorsForm onFactorAdded={handleFactorAdded} />
              </Paper>
            </Grid>

            <Grid item xs={12} md={8}>
              <Paper sx={{ p: { xs: 2, sm: 3 }, overflow: 'auto' }}>
                <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
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
          <Grid container spacing={{ xs: 2, sm: 3 }}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: { xs: 2, sm: 3 } }}>
                <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
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
              <Paper sx={{ p: { xs: 2, sm: 3 }, overflow: 'auto' }}>
                <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
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
          <Grid container spacing={{ xs: 2, sm: 3 }}>
            <Grid item xs={12}>
              <Paper sx={{ p: { xs: 2, sm: 3 }, overflow: 'auto' }}>
                <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
                  Advanced Charts & Correlations
                </Typography>
                <Box sx={{ mb: { xs: 2, sm: 3 } }}>
                  <AdvancedBPChart readings={readings} />
                </Box>
                <Box sx={{ mb: { xs: 2, sm: 3 } }}>
                  <PulseRateChart readings={readings} />
                </Box>
                <CorrelationChart readings={readings} healthFactors={healthFactors} />
              </Paper>
            </Grid>
          </Grid>
        )}

        {activeTab === 4 && (
          <Grid container spacing={{ xs: 2, sm: 3 }}>
            <Grid item xs={12}>
              <Paper sx={{ p: { xs: 2, sm: 3 } }}>
                <Insights />
              </Paper>
            </Grid>
          </Grid>
        )}
      </Container>
    </Box>
  )
}

export default Dashboard

