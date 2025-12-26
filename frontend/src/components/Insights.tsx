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
      if (response.data.has_insights && response.data.summary) {
        setSummary(response.data.summary)
      }
    } catch (err: any) {
      console.error('Failed to fetch summary:', err)
    } finally {
      setSummaryLoading(false)
    }
  }

  useEffect(() => {
    fetchInsights()
    fetchSummary()
  }, [])

  const handleGenerateInsights = async () => {
    try {
      setGenerating(true)
      setError('')
      setSuccess('')
      
      const response = await apiClient.post('/api/insights/generate/')
      
      if (response.data.insights_created > 0) {
        setSuccess(`Successfully generated ${response.data.insights_created} new insights!`)
        // Refresh insights list
        await fetchInsights()
        await fetchSummary()
        onUpdate?.()
        
        // Clear success message after 5 seconds
        setTimeout(() => setSuccess(''), 5000)
      } else {
        setError(response.data.message || 'No new insights were generated. You may need more readings.')
      }
    } catch (err: any) {
      console.error('Failed to generate insights:', err)
      setError(
        err.response?.data?.error || 
        err.response?.data?.message || 
        'Failed to generate insights. Please try again.'
      )
    } finally {
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <InsightsIcon color="primary" />
          <Typography variant="h5">
            AI Health Insights
          </Typography>
          {unreadCount > 0 && (
            <Chip 
              label={`${unreadCount} new`} 
              color="primary" 
              size="small"
            />
          )}
        </Box>
        <Button
          variant="contained"
          startIcon={generating ? <CircularProgress size={20} /> : <AutoAwesomeIcon />}
          onClick={handleGenerateInsights}
          disabled={generating}
          color="primary"
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
        <Paper sx={{ p: 3, mb: 3, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <AutoAwesomeIcon />
            <Typography variant="h6">AI Summary</Typography>
          </Box>
          {summaryLoading ? (
            <LinearProgress />
          ) : (
            <Typography variant="body1">{summary}</Typography>
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
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                    <Chip
                      icon={getSeverityIcon(insight.severity)}
                      label={insight.severity.toUpperCase()}
                      color={getSeverityColor(insight.severity)}
                      size="small"
                    />
                    <Chip
                      label={insight.insight_type.replace('_', ' ').toUpperCase()}
                      color={getTypeColor(insight.insight_type)}
                      size="small"
                      variant="outlined"
                    />
                    {!insight.is_read && (
                      <Chip
                        label="NEW"
                        color="primary"
                        size="small"
                      />
                    )}
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {format(new Date(insight.generated_at), 'MMM dd, yyyy HH:mm')}
                  </Typography>
                </Box>
                <Typography
                  variant="body1"
                  sx={{
                    mt: 1,
                    mb: 1,
                    fontWeight: insight.is_read ? 'normal' : 'medium',
                  }}
                >
                  {insight.insight_text.length > 150
                    ? `${insight.insight_text.substring(0, 150)}...`
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

