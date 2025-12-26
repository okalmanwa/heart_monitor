import { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import {
  Insights as InsightsIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  AutoAwesome as AutoAwesomeIcon,
} from '@mui/icons-material'
import { format } from 'date-fns'
import apiClient from '../config/axios'
import { UserInsight } from '../types'

interface InsightsProps {
  onUpdate?: () => void
}

const Insights: React.FC<InsightsProps> = ({ onUpdate }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [insights, setInsights] = useState<UserInsight[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [summary, setSummary] = useState<string | null>(null)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')
  const [selectedInsight, setSelectedInsight] = useState<UserInsight | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const fetchInsights = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await apiClient.get('/api/insights/')
      const insightsData = response.data.results || response.data
      setInsights(Array.isArray(insightsData) ? insightsData : [])
    } catch (err: any) {
      console.error('Failed to fetch insights:', err)
      setError('Failed to load insights. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fetchSummary = async () => {
    try {
      setSummaryLoading(true)
      const response = await apiClient.get('/api/insights/summary/')
      // Only set summary if it exists and has_insights is true
      if (response.data.has_insights && response.data.summary) {
        setSummary(response.data.summary)
      } else {
        // Clear summary if no insights or summary unavailable
        setSummary(null)
      }
    } catch (err: any) {
      console.error('Failed to fetch summary:', err)
      setSummary(null)
    } finally {
      setSummaryLoading(false)
    }
  }

  useEffect(() => {
    fetchInsights()
    fetchSummary()
  }, [])

  const handleGenerateInsights = async () => {
    setGenerating(true)
    setError('')
    setSuccess('')
    
    // Set a timeout to ensure loading state is cleared even if request hangs
    const timeoutId = setTimeout(() => {
      console.warn('Insights generation request timed out, clearing loading state')
      setGenerating(false)
      setError('Request timed out. Please try again.')
    }, 30000) // 30 second timeout
    
    try {
      console.log('Generating insights...')
      const response = await apiClient.post('/api/insights/generate/', {}, {
        timeout: 30000 // 30 second timeout
      })
      clearTimeout(timeoutId)
      console.log('Insights generation response:', response.status, response.data)
      
      // Handle async processing (202 Accepted)
      if (response.status === 202) {
        setSuccess('Insights are being generated. Refreshing in a few seconds...')
        setGenerating(false)
        
        // Poll for new insights after a delay
        setTimeout(async () => {
          await fetchInsights()
          await fetchSummary()
          onUpdate?.()
        }, 5000) // Wait 5 seconds then refresh
        
        // Clear success message after 10 seconds
        setTimeout(() => setSuccess(''), 10000)
        return
      }
      
      // Check if response is successful (200 or 201)
      if (response.status === 200 || response.status === 201) {
        // Check if response has insights_created field
        const insightsCreated = response.data?.insights_created ?? 0
        
        if (insightsCreated > 0) {
          setSuccess(`Successfully generated ${insightsCreated} new insights!`)
          // Refresh insights list
          await fetchInsights()
          // Wait a moment before fetching summary to ensure insights are saved
          setTimeout(async () => {
            await fetchSummary()
          }, 1000)
          onUpdate?.()
          
          // Clear success message after 5 seconds
          setTimeout(() => setSuccess(''), 5000)
        } else {
          const message = response.data?.message || 'No new insights were generated. You may need more readings.'
          setError(message)
          // Still refresh to show any existing insights
          await fetchInsights()
          await fetchSummary()
        }
      } else {
        // Unexpected status code
        setError('Unexpected response from server. Please try again.')
        await fetchInsights()
      }
    } catch (err: any) {
      clearTimeout(timeoutId)
      console.error('Failed to generate insights:', err)
      const errorMessage = 
        err.response?.data?.error || 
        err.response?.data?.message || 
        err.message ||
        'Failed to generate insights. Please try again.'
      setError(errorMessage)
      
      // Still refresh insights in case some were created before the error
      try {
        await fetchInsights()
        await fetchSummary()
      } catch (refreshErr) {
        console.error('Failed to refresh insights after error:', refreshErr)
      }
    } finally {
      clearTimeout(timeoutId)
      console.log('Clearing generating state')
      setGenerating(false)
    }
  }

  const handleMarkAsRead = async (insight: UserInsight) => {
    try {
      await apiClient.post(`/api/insights/${insight.id}/mark_read/`)
      // Update local state
      setInsights(insights.map(i => 
        i.id === insight.id ? { ...i, is_read: true } : i
      ))
    } catch (err: any) {
      console.error('Failed to mark insight as read:', err)
    }
  }

  const handleOpenDialog = (insight: UserInsight) => {
    setSelectedInsight(insight)
    setDialogOpen(true)
    
    // Mark as read when viewing
    if (!insight.is_read) {
      handleMarkAsRead(insight)
    }
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setSelectedInsight(null)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'error'
      case 'medium': return 'warning'
      case 'low': return 'info'
      default: return 'default'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <ErrorIcon />
      case 'medium': return <WarningIcon />
      case 'low': return <InfoIcon />
      default: return <InfoIcon />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'alert': return 'error'
      case 'anomaly': return 'warning'
      case 'trend': return 'info'
      case 'correlation': return 'success'
      default: return 'default'
    }
  }

  const unreadCount = insights.filter(i => !i.is_read).length

  return (
    <Box>
      <style>
        {`
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
              transform: scale(1);
            }
            50% {
              opacity: 0.8;
              transform: scale(1.05);
            }
          }
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
      {/* Header with Generate Button */}
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', sm: 'center' }, 
          mb: 3,
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 2, sm: 0 }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <InsightsIcon color="primary" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }} />
          <Typography variant="h5" sx={{ fontSize: { xs: '1.1rem', sm: '1.5rem' } }}>
            AI Health Insights
          </Typography>
          {unreadCount > 0 && (
            <Chip 
              label={`${unreadCount} new`} 
              color="primary" 
              size="small"
              sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
            />
          )}
        </Box>
        <Button
          variant="contained"
          startIcon={generating ? <CircularProgress size={20} /> : <AutoAwesomeIcon />}
          onClick={handleGenerateInsights}
          disabled={generating}
          color="primary"
          fullWidth={isMobile}
          size={isMobile ? 'small' : 'medium'}
        >
          {generating ? 'Generating...' : 'Generate Insights'}
        </Button>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {/* AI Summary */}
      {summary && (
        <Paper 
          sx={{ 
            p: { xs: 2, sm: 3 }, 
            mb: 3,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: 3,
            boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              right: 0,
              width: '200px',
              height: '200px',
              background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
              borderRadius: '50%',
              transform: 'translate(30%, -30%)',
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, position: 'relative', zIndex: 1 }}>
            <AutoAwesomeIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' }, animation: 'pulse 2s ease-in-out infinite' }} />
            <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' }, fontWeight: 600 }}>AI Summary</Typography>
          </Box>
          {summaryLoading ? (
            <LinearProgress sx={{ bgcolor: 'rgba(255,255,255,0.3)', '& .MuiLinearProgress-bar': { bgcolor: 'white' } }} />
          ) : (
            <Typography 
              variant="body1" 
              sx={{ 
                fontSize: { xs: '0.875rem', sm: '1rem' },
                lineHeight: 1.8,
                position: 'relative',
                zIndex: 1,
                textShadow: '0 1px 2px rgba(0,0,0,0.1)'
              }}
            >
              {summary}
            </Typography>
          )}
        </Paper>
      )}

      {/* Insights List */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : insights.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <InsightsIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No insights yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Generate AI-powered insights based on your health data. You'll need at least 3 blood pressure readings.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AutoAwesomeIcon />}
            onClick={handleGenerateInsights}
            disabled={generating}
          >
            Generate Insights
          </Button>
        </Paper>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {insights.map((insight, index) => {
            const getGradient = () => {
              switch (insight.severity) {
                case 'high':
                  return 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                case 'medium':
                  return 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
                case 'low':
                  return 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
                default:
                  return 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)'
              }
            }

            const getBorderColor = () => {
              switch (insight.severity) {
                case 'high': return '#f5576c'
                case 'medium': return '#fcb69f'
                case 'low': return '#a8edea'
                default: return '#8ec5fc'
              }
            }

            return (
              <Card
                key={insight.id}
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  border: insight.is_read ? '1px solid #e0e0e0' : `2px solid ${getBorderColor()}`,
                  borderRadius: 3,
                  background: insight.is_read 
                    ? 'white' 
                    : `linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.98) 100%)`,
                  boxShadow: insight.is_read 
                    ? '0 2px 8px rgba(0,0,0,0.1)' 
                    : `0 8px 24px rgba(0,0,0,0.12), 0 0 0 1px ${getBorderColor()}20`,
                  position: 'relative',
                  overflow: 'hidden',
                  animation: !insight.is_read ? `slideIn 0.5s ease-out ${index * 0.1}s both` : 'none',
                  '&::before': !insight.is_read ? {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: '4px',
                    background: getGradient(),
                  } : {},
                  '&:hover': {
                    boxShadow: `0 12px 32px rgba(0,0,0,0.15), 0 0 0 1px ${getBorderColor()}40`,
                    transform: 'translateY(-4px) scale(1.01)',
                    borderColor: getBorderColor(),
                  },
                }}
                onClick={() => handleOpenDialog(insight)}
              >
                <CardContent sx={{ p: { xs: 2, sm: 3 }, position: 'relative' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1.5, sm: 0 } }}>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                      <Chip
                        icon={getSeverityIcon(insight.severity)}
                        label={insight.severity.toUpperCase()}
                        color={getSeverityColor(insight.severity)}
                        size="small"
                        sx={{ 
                          fontSize: { xs: '0.65rem', sm: '0.75rem' },
                          fontWeight: 600,
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        }}
                      />
                      <Chip
                        label={insight.insight_type.replace('_', ' ').toUpperCase()}
                        color={getTypeColor(insight.insight_type)}
                        size="small"
                        variant="outlined"
                        sx={{ 
                          fontSize: { xs: '0.65rem', sm: '0.75rem' },
                          fontWeight: 500,
                          borderWidth: 2,
                        }}
                      />
                      {!insight.is_read && (
                        <Chip
                          label="NEW"
                          color="primary"
                          size="small"
                          sx={{ 
                            fontSize: { xs: '0.65rem', sm: '0.75rem' },
                            fontWeight: 700,
                            animation: 'pulse 2s ease-in-out infinite',
                            boxShadow: '0 2px 8px rgba(25, 118, 210, 0.4)',
                          }}
                        />
                      )}
                    </Box>
                    <Typography 
                      variant="caption" 
                      color="text.secondary" 
                      sx={{ 
                        fontSize: { xs: '0.65rem', sm: '0.75rem' },
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                      }}
                    >
                      <AutoAwesomeIcon sx={{ fontSize: '0.875rem' }} />
                      {format(new Date(insight.generated_at), 'MMM dd, yyyy HH:mm')}
                    </Typography>
                  </Box>
                  <Typography
                    variant="body1"
                    sx={{
                      mt: 1,
                      mb: 1,
                      fontWeight: insight.is_read ? 400 : 500,
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                      lineHeight: 1.7,
                      color: insight.is_read ? 'text.secondary' : 'text.primary',
                      background: insight.is_read ? 'transparent' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      backgroundClip: insight.is_read ? 'unset' : 'text',
                      WebkitBackgroundClip: insight.is_read ? 'unset' : 'text',
                      WebkitTextFillColor: insight.is_read ? 'inherit' : 'transparent',
                    }}
                  >
                    {insight.insight_text.length > (isMobile ? 100 : 150)
                      ? `${insight.insight_text.substring(0, isMobile ? 100 : 150)}...`
                      : insight.insight_text}
                  </Typography>
                  {insight.is_read && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 2, pt: 1.5, borderTop: '1px solid #f0f0f0' }}>
                      <CheckCircleIcon fontSize="small" color="success" />
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                        Read
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </Box>
      )}

      {/* Insight Detail Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }
        }}
      >
        <DialogTitle
          sx={{
            background: selectedInsight 
              ? (selectedInsight.severity === 'high' 
                  ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                  : selectedInsight.severity === 'medium'
                  ? 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
                  : 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)')
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            pb: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {selectedInsight && (
              <Box
                sx={{
                  p: 1,
                  borderRadius: '50%',
                  bgcolor: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {getSeverityIcon(selectedInsight.severity)}
              </Box>
            )}
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              AI Health Insight
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedInsight && (
            <Box>
              <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
                <Chip
                  icon={getSeverityIcon(selectedInsight.severity)}
                  label={`Severity: ${selectedInsight.severity.toUpperCase()}`}
                  color={getSeverityColor(selectedInsight.severity)}
                  sx={{ fontWeight: 600, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                />
                <Chip
                  label={`Type: ${selectedInsight.insight_type.replace('_', ' ').toUpperCase()}`}
                  color={getTypeColor(selectedInsight.insight_type)}
                  variant="outlined"
                  sx={{ fontWeight: 500, borderWidth: 2 }}
                />
                <Chip
                  icon={<AutoAwesomeIcon />}
                  label={format(new Date(selectedInsight.generated_at), 'MMM dd, yyyy HH:mm')}
                  variant="outlined"
                  sx={{ fontWeight: 500 }}
                />
              </Box>
              <Paper
                sx={{
                  p: 3,
                  bgcolor: 'grey.50',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'grey.200',
                }}
              >
                <Typography 
                  variant="body1" 
                  sx={{ 
                    whiteSpace: 'pre-wrap', 
                    lineHeight: 1.9,
                    fontSize: '1rem',
                    color: 'text.primary',
                  }}
                >
                  {selectedInsight.insight_text}
                </Typography>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button 
            onClick={handleCloseDialog}
            variant="contained"
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              px: 3,
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Insights

