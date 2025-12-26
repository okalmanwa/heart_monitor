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
        <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <AutoAwesomeIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
            <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>AI Summary</Typography>
          </Box>
          {summaryLoading ? (
            <LinearProgress />
          ) : (
            <Typography variant="body1" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>{summary}</Typography>
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
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {insights.map((insight) => (
            <Card
              key={insight.id}
              sx={{
                cursor: 'pointer',
                transition: 'all 0.2s',
                border: insight.is_read ? '1px solid transparent' : '2px solid',
                borderColor: insight.is_read ? 'transparent' : 'primary.main',
                '&:hover': {
                  boxShadow: 4,
                  transform: 'translateY(-2px)',
                },
              }}
              onClick={() => handleOpenDialog(insight)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1, flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1, sm: 0 } }}>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                    <Chip
                      icon={getSeverityIcon(insight.severity)}
                      label={insight.severity.toUpperCase()}
                      color={getSeverityColor(insight.severity)}
                      size="small"
                      sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                    />
                    <Chip
                      label={insight.insight_type.replace('_', ' ').toUpperCase()}
                      color={getTypeColor(insight.insight_type)}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                    />
                    {!insight.is_read && (
                      <Chip
                        label="NEW"
                        color="primary"
                        size="small"
                        sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                      />
                    )}
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                    {format(new Date(insight.generated_at), 'MMM dd, yyyy HH:mm')}
                  </Typography>
                </Box>
                <Typography
                  variant="body1"
                  sx={{
                    mt: 1,
                    mb: 1,
                    fontWeight: insight.is_read ? 'normal' : 'medium',
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  }}
                >
                  {insight.insight_text.length > (isMobile ? 100 : 150)
                    ? `${insight.insight_text.substring(0, isMobile ? 100 : 150)}...`
                    : insight.insight_text}
                </Typography>
                {insight.is_read && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                    <CheckCircleIcon fontSize="small" color="success" />
                    <Typography variant="caption" color="text.secondary">
                      Read
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Insight Detail Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {selectedInsight && getSeverityIcon(selectedInsight.severity)}
            <Typography variant="h6">
              Health Insight
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedInsight && (
            <Box>
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                <Chip
                  icon={getSeverityIcon(selectedInsight.severity)}
                  label={`Severity: ${selectedInsight.severity.toUpperCase()}`}
                  color={getSeverityColor(selectedInsight.severity)}
                />
                <Chip
                  label={`Type: ${selectedInsight.insight_type.replace('_', ' ').toUpperCase()}`}
                  color={getTypeColor(selectedInsight.insight_type)}
                  variant="outlined"
                />
                <Chip
                  label={format(new Date(selectedInsight.generated_at), 'MMM dd, yyyy HH:mm')}
                  variant="outlined"
                />
              </Box>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
                {selectedInsight.insight_text}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Insights

