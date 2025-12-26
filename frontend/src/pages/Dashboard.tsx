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
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5', display: 'flex', flexDirection: 'column' }}>
      <AppBar 
        position="static" 
        sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
        }}
      >
        <Toolbar sx={{ flexWrap: 'wrap', py: { xs: 1, sm: 1.5 } }}>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 1, 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1.5,
              fontSize: { xs: '1.1rem', sm: '1.5rem' },
              fontWeight: 700,
            }}
          >
            <FavoriteIcon sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }} /> 
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
              Cardiac Monitor
            </Box>
            <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
              CM
            </Box>
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Typography 
              variant="body2" 
              sx={{ 
                fontSize: { xs: '0.8rem', sm: '0.9rem' },
                display: { xs: 'none', sm: 'block' },
                opacity: 0.9,
              }}
            >
              {user?.email}
            </Typography>
            <Button 
              variant="outlined"
              onClick={handleLogout}
              sx={{ 
                fontSize: { xs: '0.8rem', sm: '0.9rem' },
                px: { xs: 1.5, sm: 2.5 },
                py: { xs: 0.5, sm: 0.75 },
                borderColor: 'rgba(255, 255, 255, 0.5)',
                color: 'white',
                textTransform: 'none',
                borderRadius: 2,
                fontWeight: 500,
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: { xs: 3, sm: 4 }, mb: { xs: 3, sm: 4 }, px: { xs: 2, sm: 3 } }}>
        <Paper 
          elevation={0}
          sx={{ 
            mb: { xs: 3, sm: 4 },
            borderRadius: 3,
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Tabs 
            value={activeTab} 
            onChange={(_, newValue) => setActiveTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              minHeight: { xs: 56, sm: 72 },
              backgroundColor: 'background.paper',
              '& .MuiTabs-scrollButtons': {
                width: { xs: 36, sm: 44 },
                '&.Mui-disabled': {
                  opacity: 0.3,
                },
              },
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: '3px 3px 0 0',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              },
              '& .MuiTab-root': {
                fontSize: { xs: '0.85rem', sm: '0.95rem' },
                fontWeight: 500,
                minWidth: { xs: 90, sm: 130 },
                px: { xs: 2, sm: 3 },
                py: { xs: 1.5, sm: 2 },
                textTransform: 'none',
                color: 'text.secondary',
                minHeight: { xs: 56, sm: 72 },
                transition: 'all 0.2s ease',
                '&:hover': {
                  color: 'primary.main',
                  backgroundColor: 'rgba(102, 126, 234, 0.04)',
                },
                '&.Mui-selected': {
                  color: 'primary.main',
                  fontWeight: 600,
                },
                '& .MuiTab-iconWrapper': {
                  marginRight: { xs: '0.75rem', sm: '1rem' },
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
        </Paper>

        {activeTab === 0 && (
          <Grid container spacing={{ xs: 2, sm: 3 }}>
            <Grid item xs={12} md={4}>
              <Paper 
                elevation={2}
                sx={{ 
                  p: { xs: 2.5, sm: 3.5 },
                  borderRadius: 3,
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                }}
              >
                <Typography 
                  variant="h6" 
                  gutterBottom 
                  sx={{ 
                    fontSize: { xs: '1.2rem', sm: '1.4rem' },
                    fontWeight: 600,
                    mb: 2.5,
                  }}
                >
                  Add Reading
                </Typography>
                <ReadingForm onReadingAdded={handleReadingAdded} />
              </Paper>
            </Grid>

            <Grid item xs={12} md={8}>
              <Paper 
                elevation={2}
                sx={{ 
                  p: { xs: 2.5, sm: 3.5 },
                  borderRadius: 3,
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                }}
              >
                <Typography 
                  variant="h6" 
                  gutterBottom 
                  sx={{ 
                    fontSize: { xs: '1.2rem', sm: '1.4rem' },
                    fontWeight: 600,
                    mb: 2.5,
                  }}
                >
                  Blood Pressure Trends
                </Typography>
                <AdvancedBPChart readings={readings} />
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper 
                elevation={2}
                sx={{ 
                  p: { xs: 2.5, sm: 3.5 },
                  overflow: 'auto',
                  borderRadius: 3,
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                }}
              >
                <Typography 
                  variant="h6" 
                  gutterBottom 
                  sx={{ 
                    fontSize: { xs: '1.2rem', sm: '1.4rem' },
                    fontWeight: 600,
                    mb: 2.5,
                  }}
                >
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
              <Paper 
                elevation={2}
                sx={{ 
                  p: { xs: 2.5, sm: 3.5 },
                  borderRadius: 3,
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                }}
              >
                <Typography 
                  variant="h6" 
                  gutterBottom 
                  sx={{ 
                    fontSize: { xs: '1.2rem', sm: '1.4rem' },
                    fontWeight: 600,
                    mb: 2.5,
                  }}
                >
                  Track Health Factors
                </Typography>
                <HealthFactorsForm onFactorAdded={handleFactorAdded} />
              </Paper>
            </Grid>

            <Grid item xs={12} md={8}>
              <Paper 
                elevation={2}
                sx={{ 
                  p: { xs: 2.5, sm: 3.5 },
                  overflow: 'auto',
                  borderRadius: 3,
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                }}
              >
                <Typography 
                  variant="h6" 
                  gutterBottom 
                  sx={{ 
                    fontSize: { xs: '1.2rem', sm: '1.4rem' },
                    fontWeight: 600,
                    mb: 2.5,
                  }}
                >
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
              <Paper 
                elevation={2}
                sx={{ 
                  p: { xs: 2.5, sm: 3.5 },
                  borderRadius: 3,
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                }}
              >
                <Typography 
                  variant="h6" 
                  gutterBottom 
                  sx={{ 
                    fontSize: { xs: '1.2rem', sm: '1.4rem' },
                    fontWeight: 600,
                    mb: 2.5,
                  }}
                >
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
              <Paper 
                elevation={2}
                sx={{ 
                  p: { xs: 2.5, sm: 3.5 },
                  overflow: 'auto',
                  borderRadius: 3,
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                }}
              >
                <Typography 
                  variant="h6" 
                  gutterBottom 
                  sx={{ 
                    fontSize: { xs: '1.2rem', sm: '1.4rem' },
                    fontWeight: 600,
                    mb: 2.5,
                  }}
                >
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
              <Paper 
                elevation={2}
                sx={{ 
                  p: { xs: 2.5, sm: 3.5 },
                  overflow: 'auto',
                  borderRadius: 3,
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                }}
              >
                <Typography 
                  variant="h6" 
                  gutterBottom 
                  sx={{ 
                    fontSize: { xs: '1.2rem', sm: '1.4rem' },
                    fontWeight: 600,
                    mb: 3,
                  }}
                >
                  Charts & Analysis
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
              <Paper 
                elevation={2}
                sx={{ 
                  p: { xs: 2.5, sm: 3.5 },
                  borderRadius: 3,
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                }}
              >
                <Insights />
              </Paper>
            </Grid>
          </Grid>
        )}
      </Container>
      
      {/* Footer */}
      <Box
        component="footer"
        sx={{
          mt: 'auto',
          py: 3,
          px: 2,
          backgroundColor: 'background.paper',
          borderTop: '1px solid',
          borderColor: 'divider',
          textAlign: 'center',
        }}
      >
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{
            fontSize: '0.875rem',
            fontWeight: 400,
            letterSpacing: '0.01em',
            opacity: 0.8,
          }}
        >
          © {new Date().getFullYear()} Tyronne. All rights reserved.
        </Typography>
      </Box>
    </Box>
  )
}

export default Dashboard

