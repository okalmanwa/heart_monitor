import { useState, useEffect, useRef, useMemo, Fragment } from 'react'
import ReactMarkdown from 'react-markdown'
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
  useMediaQuery,
  useTheme,
  Snackbar,
  LinearProgress,
  Divider,
} from '@mui/material'
import {
  Insights as InsightsIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  AutoAwesome as AutoAwesomeIcon,
  Close as CloseIcon,
  FiberManualRecord as DotIcon,
} from '@mui/icons-material'
import { format, isToday, isYesterday, startOfDay, differenceInDays } from 'date-fns'
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
  const [generationStatus, setGenerationStatus] = useState<string>('')
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')
  const [selectedInsight, setSelectedInsight] = useState<UserInsight | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [summary, setSummary] = useState<string | null>(null)
  const [summaryLoading, setSummaryLoading] = useState(false)
  
  // Use ref to track polling interval so we can clear it
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)

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
      if (response.data.summary) {
        setSummary(response.data.summary)
      } else {
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
    
    // Cleanup polling interval on unmount
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
        pollIntervalRef.current = null
      }
    }
  }, [])

  const handleGenerateInsights = async () => {
    // Prevent multiple simultaneous generations
    if (generating) {
      return
    }
    
    // Clear any existing polling interval and reset state
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current)
      pollIntervalRef.current = null
    }
    
    // Reset any previous error/success messages
    setError('')
    setSuccess('')
    
    setGenerating(true)
    setProgress(0)
    setGenerationStatus('Initializing AI analysis...')
    
    let isPolling = false // Track if we're polling to prevent clearing state
    let responseStatus: number | null = null // Track response status for finally block
    
    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev // Don't go to 100% until we get response
        return prev + Math.random() * 10
      })
    }, 500)
    
    // Update status messages
    const statusMessages = [
      'Analyzing your blood pressure readings...',
      'Identifying health patterns and trends...',
      'Correlating with your health factors...',
      'Checking medication interactions...',
      'Generating personalized insights...',
      'Finalizing recommendations...'
    ]
    let statusIndex = 0
    const statusInterval = setInterval(() => {
      if (statusIndex < statusMessages.length - 1) {
        statusIndex++
        setGenerationStatus(statusMessages[statusIndex])
      }
    }, 3000)
    
    // Set a timeout to ensure loading state is cleared even if request hangs
    const timeoutId = setTimeout(() => {
      console.warn('Insights generation request timed out, clearing loading state')
      clearInterval(progressInterval)
      clearInterval(statusInterval)
      setGenerating(false)
      setProgress(0)
      setGenerationStatus('')
      setError('Request timed out. The insights may still be generating in the background. Please refresh in a moment.')
    }, 60000) // 60 second timeout
    
    try {
      console.log('Generating insights...')
      const response = await apiClient.post('/api/insights/generate/', {}, {
        timeout: 60000 // 60 second timeout
      })
      responseStatus = response.status
      clearTimeout(timeoutId)
      clearInterval(progressInterval)
      clearInterval(statusInterval)
      console.log('Insights generation response:', response.status, response.data)
      
      // Handle async processing (202 Accepted)
      if (response.status === 202) {
        isPolling = true // Mark that we're polling
        setProgress(95)
        setGenerationStatus('Processing insights asynchronously...')
        // Keep generating state true - don't clear it here
        
        // Store initial insights IDs for comparison (more reliable than count)
        const initialInsightIds = new Set(insights.map(i => i.id))
        const initialInsightsCount = insights.length
        
        // Clear any existing polling interval
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current)
          pollIntervalRef.current = null
        }
        
        // Poll for new insights with progress updates
        let pollCount = 0
        const maxPolls = 12 // Poll for up to 60 seconds (12 * 5s)
        const pollInterval = setInterval(async () => {
          pollCount++
          // Calculate progress: 95% to 99% over maxPolls
          const progressValue = Math.min(95 + (pollCount / maxPolls) * 4, 99)
          setProgress(progressValue)
          
          try {
            const currentInsightsResponse = await apiClient.get('/api/insights/')
            const insightsData = currentInsightsResponse.data.results || currentInsightsResponse.data
            const currentInsights = Array.isArray(insightsData) ? insightsData : []
            
            // Check for new insights by comparing IDs
            const currentInsightIds = new Set(currentInsights.map(i => i.id))
            const hasNewInsights = currentInsights.some(insight => !initialInsightIds.has(insight.id))
            const newInsightsCount = currentInsights.length - initialInsightsCount
            
            console.log(`Poll ${pollCount}: Found ${currentInsights.length} insights (initial: ${initialInsightsCount}, new: ${newInsightsCount > 0 ? newInsightsCount : 0})`)
            
            // If we got new insights, we're done
            if (hasNewInsights || newInsightsCount > 0) {
              clearInterval(pollInterval)
              if (pollIntervalRef.current === pollInterval) {
                pollIntervalRef.current = null
              }
              isPolling = false
              setProgress(100)
              setGenerationStatus('Complete!')
              setSuccess(`Successfully generated ${newInsightsCount} new insights!`)
              
              // Update insights state immediately with the fresh data
              setInsights(currentInsights)
              // Fetch updated summary
              fetchSummary()
              onUpdate?.()
              
              // Clear generating state after a delay
              setTimeout(() => {
                setGenerating(false)
                setSuccess('')
                setGenerationStatus('')
                setProgress(0)
              }, 3000)
            } else if (pollCount >= maxPolls) {
              // Timeout polling
              clearInterval(pollInterval)
              if (pollIntervalRef.current === pollInterval) {
                pollIntervalRef.current = null
              }
              isPolling = false
              setGenerating(false)
              setProgress(0)
              setGenerationStatus('')
              // Refresh insights one more time in case they were just created
              await fetchInsights()
              setSuccess('Insights generation completed. Check your insights below.')
              setTimeout(() => setSuccess(''), 10000)
            }
          } catch (pollErr) {
            console.error('Error polling for insights:', pollErr)
            // Continue polling on error, but stop after max polls
            if (pollCount >= maxPolls) {
              clearInterval(pollInterval)
              if (pollIntervalRef.current === pollInterval) {
                pollIntervalRef.current = null
              }
              isPolling = false
              setGenerating(false)
              setProgress(0)
              setGenerationStatus('')
              setError('Polling timed out. Please refresh the page to see your insights.')
            }
          }
        }, 5000) // Poll every 5 seconds
        
        // Store the interval reference
        pollIntervalRef.current = pollInterval
        
        return // Exit early, don't clear generating state in finally block
      }
      
      // Check if response is successful (200 or 201)
      if (response.status === 200 || response.status === 201) {
        setProgress(100)
        setGenerationStatus('Complete!')
        
        // Check if response has insights_created field
        const insightsCreated = response.data?.insights_created ?? 0
        
        if (insightsCreated > 0) {
          setSuccess(`Successfully generated ${insightsCreated} new insights!`)
          // Refresh insights list
          await fetchInsights()
          onUpdate?.()
          
          setTimeout(() => {
            setGenerating(false)
            setProgress(0)
            setGenerationStatus('')
            setSuccess('')
          }, 3000)
        } else {
          const message = response.data?.message || 'No new insights were generated. You may need more readings.'
          setError(message)
          setGenerating(false)
          setProgress(0)
          setGenerationStatus('')
          // Still refresh to show any existing insights
          await fetchInsights()
        }
      } else {
        // Unexpected status code
        setError('Unexpected response from server. Please try again.')
        setGenerating(false)
        setProgress(0)
        setGenerationStatus('')
        await fetchInsights()
      }
    } catch (err: any) {
      clearTimeout(timeoutId)
      clearInterval(progressInterval)
      clearInterval(statusInterval)
      console.error('Failed to generate insights:', err)
      
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        setGenerationStatus('')
        setProgress(0)
        setError('The request is taking longer than expected. Your insights may still be generating in the background. Please refresh the page in a moment.')
      } else {
        const errorMessage = 
          err.response?.data?.error || 
          err.response?.data?.message || 
          err.message ||
          'Failed to generate insights. Please try again.'
        setError(errorMessage)
        setProgress(0)
        setGenerationStatus('')
      }
      
      // Still refresh insights in case some were created before the error
      try {
        await fetchInsights()
      } catch (refreshErr) {
        console.error('Failed to refresh insights after error:', refreshErr)
      }
    } finally {
      clearTimeout(timeoutId)
      // Only clear generating state if we're not polling (202 response handles its own cleanup)
      // For 202 responses, we return early so this doesn't execute
      // For other responses, we handle cleanup in their respective blocks
      if (!isPolling && responseStatus !== 202) {
        console.log('Clearing generating state')
        setGenerating(false)
        setProgress(0)
        setGenerationStatus('')
      }
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

  // Group insights by date
  const groupedInsights = useMemo(() => {
    const groups: { [key: string]: UserInsight[] } = {}
    
    insights.forEach(insight => {
      const date = new Date(insight.generated_at)
      let groupKey: string
      
      if (isToday(date)) {
        groupKey = 'Today'
      } else if (isYesterday(date)) {
        groupKey = 'Yesterday'
      } else {
        const daysDiff = differenceInDays(new Date(), date)
        if (daysDiff <= 7) {
          groupKey = 'This Week'
        } else if (daysDiff <= 30) {
          groupKey = 'This Month'
        } else {
          groupKey = format(date, 'MMMM yyyy')
        }
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = []
      }
      groups[groupKey].push(insight)
    })
    
    // Sort groups by date (most recent first)
    const sortedGroups = Object.entries(groups).sort((a, b) => {
      const dateA = new Date(a[1][0].generated_at)
      const dateB = new Date(b[1][0].generated_at)
      return dateB.getTime() - dateA.getTime()
    })
    
    // Sort insights within each group (most recent first)
    sortedGroups.forEach(([_, insights]) => {
      insights.sort((a, b) => 
        new Date(b.generated_at).getTime() - new Date(a.generated_at).getTime()
      )
    })
    
    return sortedGroups
  }, [insights])

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
              opacity: 0.85;
              transform: scale(1.05);
            }
          }
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateX(20px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateX(0) scale(1);
            }
          }
          @keyframes shimmer {
            0% {
              background-position: -200% 0;
            }
            100% {
              background-position: 200% 0;
            }
          }
        `}
      </style>
      {/* AI Summary Section */}
      {summary && (
        <Card
          sx={{
            mb: 4,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
            border: 'none',
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <AutoAwesomeIcon sx={{ fontSize: '1.5rem' }} />
                </Box>
                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      fontSize: { xs: '1rem', sm: '1.25rem' },
                    }}
                  >
                    AI Health Summary
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="contained"
                startIcon={generating ? <CircularProgress size={20} color="inherit" /> : <AutoAwesomeIcon />}
                onClick={handleGenerateInsights}
                disabled={generating}
                sx={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  px: { xs: 2, sm: 3 },
                  py: 1,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: { xs: '0.8rem', sm: '0.9rem' },
                  fontWeight: 600,
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.3)',
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                  },
                  '&:disabled': {
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'rgba(255, 255, 255, 0.5)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                {generating ? (generationStatus || 'Generating...') : 'Generate New'}
              </Button>
            </Box>
            <Box
              sx={{
                '& p': {
                  margin: '0 0 1em 0',
                  lineHeight: 1.8,
                  fontSize: { xs: '0.95rem', sm: '1.05rem' },
                  opacity: 0.95,
                  '&:last-child': {
                    marginBottom: 0,
                  },
                },
                '& ul, & ol': {
                  margin: '0 0 1em 0',
                  paddingLeft: '1.5em',
                  lineHeight: 1.8,
                  fontSize: { xs: '0.95rem', sm: '1.05rem' },
                  opacity: 0.95,
                },
                '& li': {
                  marginBottom: '0.5em',
                },
                '& strong': {
                  fontWeight: 700,
                },
                '& em': {
                  fontStyle: 'italic',
                },
                '& h1, & h2, & h3, & h4, & h5, & h6': {
                  margin: '1em 0 0.5em 0',
                  fontWeight: 700,
                  fontSize: { xs: '1.1rem', sm: '1.25rem' },
                  opacity: 1,
                  '&:first-of-type': {
                    marginTop: 0,
                  },
                },
                '& code': {
                  background: 'rgba(255, 255, 255, 0.2)',
                  padding: '0.2em 0.4em',
                  borderRadius: '4px',
                  fontSize: '0.9em',
                  fontFamily: 'monospace',
                },
                '& pre': {
                  background: 'rgba(255, 255, 255, 0.15)',
                  padding: '1em',
                  borderRadius: '8px',
                  overflow: 'auto',
                  '& code': {
                    background: 'transparent',
                    padding: 0,
                  },
                },
                '& blockquote': {
                  borderLeft: '3px solid rgba(255, 255, 255, 0.5)',
                  paddingLeft: '1em',
                  margin: '1em 0',
                  opacity: 0.9,
                },
                '& a': {
                  color: 'rgba(255, 255, 255, 0.9)',
                  textDecoration: 'underline',
                  '&:hover': {
                    opacity: 0.8,
                  },
                },
              }}
            >
              <ReactMarkdown>{summary}</ReactMarkdown>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Header */}
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2, 
          mb: 4,
          pb: 2,
          borderBottom: '2px solid',
          borderColor: 'divider',
          flexWrap: 'wrap',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
            }}
          >
            <InsightsIcon sx={{ fontSize: '1.75rem', color: 'white' }} />
          </Box>
          <Box>
            <Typography 
              variant="h4" 
              sx={{ 
                fontSize: { xs: '1.5rem', sm: '2rem' }, 
                fontWeight: 700,
                mb: 0.5,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              AI Health Insights
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'text.secondary',
                  fontSize: { xs: '0.8rem', sm: '0.875rem' }
                }}
              >
                {insights.length} {insights.length === 1 ? 'insight' : 'insights'} available
              </Typography>
              {unreadCount > 0 && (
                <Chip 
                  icon={<DotIcon sx={{ fontSize: '0.75rem !important' }} />}
                  label={`${unreadCount} new`} 
                  color="error"
                  size="small"
                  sx={{ 
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    height: '22px',
                    '& .MuiChip-icon': {
                      color: 'inherit',
                    }
                  }}
                />
              )}
            </Box>
          </Box>
        </Box>
        {!summary && (
          <Button
            variant="contained"
            startIcon={generating ? <CircularProgress size={20} color="inherit" /> : <AutoAwesomeIcon />}
            onClick={handleGenerateInsights}
            disabled={generating}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              px: 3,
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: { xs: '0.875rem', sm: '1rem' },
              fontWeight: 600,
              boxShadow: '0 4px 16px rgba(102, 126, 234, 0.4)',
              '&:hover': {
                boxShadow: '0 6px 20px rgba(102, 126, 234, 0.5)',
                transform: 'translateY(-2px)',
              },
              '&:disabled': {
                background: 'rgba(102, 126, 234, 0.5)',
              },
              transition: 'all 0.2s ease',
              fullWidth: isMobile,
            }}
          >
            {generating ? (generationStatus || 'Generating...') : 'Generate Insights'}
          </Button>
        )}
      </Box>

      {/* Generation Progress Indicator */}
      {generating && (
        <Paper 
          sx={{ 
            p: { xs: 2.5, sm: 3 }, 
            mb: 3,
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            boxShadow: 'none',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: 'linear-gradient(90deg, #667eea 0%, #764ba2 50%, #667eea 100%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 2s linear infinite',
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                animation: 'pulse 2s ease-in-out infinite',
              }}
            >
              <AutoAwesomeIcon sx={{ fontSize: '1.5rem', color: 'white' }} />
            </Box>
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  fontWeight: 600, 
                  mb: 0.5,
                  color: 'text.primary',
                  fontSize: { xs: '0.95rem', sm: '1rem' }
                }}
              >
                {generationStatus || 'Generating AI Insights...'}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={progress} 
                sx={{ 
                  height: 4,
                  borderRadius: 2,
                  bgcolor: 'rgba(102, 126, 234, 0.1)',
                  mb: 1,
                  '& .MuiLinearProgress-bar': { 
                    background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: 2,
                    transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  }
                }} 
              />
              <Typography 
                variant="caption" 
                sx={{ 
                  display: 'block', 
                  color: 'text.secondary',
                  fontSize: '0.75rem',
                  fontWeight: 500
                }}
              >
                {Math.min(Math.round(progress), 99)}% complete
              </Typography>
            </Box>
          </Box>
        </Paper>
      )}

      {/* Alerts */}
      {error && (
        <Alert 
          severity="error" 
          onClose={() => setError('')} 
          sx={{ 
            mb: 2,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'error.light',
            backgroundColor: 'rgba(211, 47, 47, 0.08)',
            '& .MuiAlert-icon': {
              color: 'error.main',
            },
            '& .MuiAlert-message': {
              color: 'error.dark',
              fontWeight: 500,
            },
            '& .MuiAlert-action': {
              paddingTop: 0,
            }
          }}
        >
          {error}
        </Alert>
      )}
      <Snackbar
        open={!!success}
        autoHideDuration={success.includes('Refreshing') ? 10000 : 5000}
        onClose={() => setSuccess('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{
          '& .MuiSnackbarContent-root': {
            backgroundColor: 'transparent',
            boxShadow: 'none',
            padding: 0,
            minWidth: 'auto',
          }
        }}
      >
        <Paper
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            px: 3,
            py: 2,
            borderRadius: 2,
            background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.95) 0%, rgba(56, 142, 60, 0.95) 100%)',
            color: 'white',
            boxShadow: '0 8px 24px rgba(76, 175, 80, 0.3)',
            minWidth: { xs: '280px', sm: '320px' },
            maxWidth: { xs: '90vw', sm: '400px' },
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          <CheckCircleIcon sx={{ fontSize: '1.5rem', flexShrink: 0 }} />
          <Typography 
            sx={{ 
              flexGrow: 1,
              fontWeight: 500,
              fontSize: { xs: '0.9rem', sm: '1rem' },
              lineHeight: 1.5,
            }}
          >
            {success}
          </Typography>
          <IconButton
            size="small"
            onClick={() => setSuccess('')}
            sx={{
              color: 'white',
              opacity: 0.8,
              '&:hover': {
                opacity: 1,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              }
            }}
          >
            <CloseIcon sx={{ fontSize: '1.2rem' }} />
          </IconButton>
        </Paper>
      </Snackbar>

      {/* Insights List */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : insights.length === 0 ? (
        <Card
          sx={{
            py: 8,
            px: 4,
            textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.03) 0%, rgba(118, 75, 162, 0.03) 100%)',
            border: '2px dashed',
            borderColor: 'divider',
            borderRadius: 4,
          }}
        >
          <Box
            sx={{
              width: 100,
              height: 100,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3,
              mx: 'auto',
              boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)',
            }}
          >
            <InsightsIcon sx={{ fontSize: 48, color: 'white' }} />
          </Box>
          <Typography 
            variant="h5" 
            sx={{ 
              color: 'text.primary',
              fontWeight: 700,
              mb: 1.5,
              fontSize: { xs: '1.25rem', sm: '1.5rem' }
            }}
          >
            No insights yet
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: 'text.secondary',
              mb: 4,
              maxWidth: '500px',
              mx: 'auto',
              fontSize: { xs: '0.95rem', sm: '1rem' },
              lineHeight: 1.7,
            }}
          >
            Generate AI-powered insights based on your health data. Our AI will analyze your blood pressure readings, health factors, and medications to provide personalized recommendations.
          </Typography>
          <Button
            variant="contained"
            startIcon={generating ? <CircularProgress size={20} color="inherit" /> : <AutoAwesomeIcon />}
            onClick={handleGenerateInsights}
            disabled={generating}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: 3,
              px: 4,
              py: 1.5,
              textTransform: 'none',
              fontSize: { xs: '0.95rem', sm: '1rem' },
              fontWeight: 600,
              boxShadow: '0 4px 16px rgba(102, 126, 234, 0.4)',
              '&:hover': {
                boxShadow: '0 6px 20px rgba(102, 126, 234, 0.5)',
                transform: 'translateY(-2px)',
              },
              '&:disabled': {
                background: 'rgba(102, 126, 234, 0.5)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            {generating ? (generationStatus || 'Generating...') : 'Generate Insights'}
          </Button>
        </Card>
      ) : (
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 3,
          }}
        >
          {groupedInsights.map(([groupLabel, groupInsights]) => (
            <Box key={groupLabel}>
              {/* Date Header */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Typography
                  variant="overline"
                  sx={{
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: 'text.secondary',
                    textTransform: 'uppercase',
                    letterSpacing: '1.5px',
                  }}
                >
                  {groupLabel}
                </Typography>
                <Divider sx={{ flexGrow: 1 }} />
                <Chip
                  label={`${groupInsights.length}`}
                  size="small"
                  sx={{
                    fontWeight: 600,
                    minWidth: 32,
                    height: 24,
                  }}
                />
              </Box>

              {/* Insights Cards */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {groupInsights.map((insight, index) => {
                  const isUnread = !insight.is_read
                  const severityColors = {
                    high: { bg: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)', border: '#ff5252' },
                    medium: { bg: 'linear-gradient(135deg, #ffa726 0%, #fb8c00 100%)', border: '#ff9800' },
                    low: { bg: 'linear-gradient(135deg, #42a5f5 0%, #1e88e5 100%)', border: '#2196f3' },
                  }
                  const colors = severityColors[insight.severity as keyof typeof severityColors] || severityColors.low
                  
                  return (
                    <Card
                      key={insight.id}
                      onClick={() => handleOpenDialog(insight)}
                      sx={{
                        cursor: 'pointer',
                        border: `2px solid ${isUnread ? colors.border : 'transparent'}`,
                        borderRadius: 3,
                        boxShadow: isUnread 
                          ? `0 4px 20px ${colors.border}40`
                          : '0 2px 8px rgba(0,0,0,0.08)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        animation: isUnread ? `slideIn 0.3s ease-out ${index * 0.05}s both` : 'none',
                        position: 'relative',
                        overflow: 'visible',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: isUnread 
                            ? `0 8px 24px ${colors.border}50`
                            : '0 4px 16px rgba(0,0,0,0.12)',
                        },
                        '&::before': isUnread ? {
                          content: '""',
                          position: 'absolute',
                          top: -2,
                          left: -2,
                          right: -2,
                          bottom: -2,
                          background: colors.bg,
                          borderRadius: 3,
                          zIndex: -1,
                          opacity: 0.1,
                        } : {},
                      }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                          {/* Severity Indicator */}
                          <Box
                            sx={{
                              width: 48,
                              height: 48,
                              borderRadius: 2,
                              background: colors.bg,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              boxShadow: `0 4px 12px ${colors.border}40`,
                            }}
                          >
                            {getSeverityIcon(insight.severity)}
                          </Box>

                          {/* Content */}
                          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5, flexWrap: 'wrap' }}>
                              <Chip
                                label={insight.insight_type.replace('_', ' ')}
                                size="small"
                                sx={{
                                  fontWeight: 600,
                                  fontSize: '0.7rem',
                                  height: 22,
                                  textTransform: 'capitalize',
                                }}
                              />
                              <Chip
                                label={insight.severity}
                                size="small"
                                color={getSeverityColor(insight.severity)}
                                sx={{
                                  fontWeight: 600,
                                  fontSize: '0.7rem',
                                  height: 22,
                                  textTransform: 'capitalize',
                                }}
                              />
                              {isUnread && (
                                <Chip
                                  icon={<DotIcon sx={{ fontSize: '0.6rem !important' }} />}
                                  label="New"
                                  size="small"
                                  color="error"
                                  sx={{
                                    fontSize: '0.65rem',
                                    height: 20,
                                    fontWeight: 600,
                                  }}
                                />
                              )}
                            </Box>
                            
                            <Typography
                              variant="body1"
                              sx={{
                                fontSize: { xs: '0.95rem', sm: '1rem' },
                                lineHeight: 1.7,
                                fontWeight: 400,
                                color: 'text.primary',
                                mb: 2,
                                wordBreak: 'break-word',
                                display: '-webkit-box',
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                              }}
                            >
                              {insight.insight_text}
                            </Typography>

                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                              <Typography
                                variant="caption"
                                sx={{
                                  fontSize: '0.75rem',
                                  color: 'text.secondary',
                                  fontWeight: 500,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 0.5,
                                }}
                              >
                                {format(new Date(insight.generated_at), 'MMM dd, yyyy • HH:mm')}
                              </Typography>
                              {insight.is_read && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <CheckCircleIcon 
                                    sx={{ 
                                      fontSize: '0.875rem', 
                                      color: 'success.main',
                                    }} 
                                  />
                                  <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
                                    Read
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  )
                })}
              </Box>
            </Box>
          ))}
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
            borderRadius: 4,
            boxShadow: '0 24px 48px rgba(0,0,0,0.2)',
            overflow: 'hidden',
          }
        }}
      >
        {selectedInsight && (() => {
          const severityColors = {
            high: { bg: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)', border: '#ff5252' },
            medium: { bg: 'linear-gradient(135deg, #ffa726 0%, #fb8c00 100%)', border: '#ff9800' },
            low: { bg: 'linear-gradient(135deg, #42a5f5 0%, #1e88e5 100%)', border: '#2196f3' },
          }
          const colors = severityColors[selectedInsight.severity as keyof typeof severityColors] || severityColors.low
          
          return (
            <>
              <DialogTitle
                sx={{
                  background: colors.bg,
                  color: 'white',
                  py: 3,
                  px: 3,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 2,
                      bgcolor: 'rgba(255,255,255,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    {getSeverityIcon(selectedInsight.severity)}
                  </Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                      Health Insight
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.875rem' }}>
                      {format(new Date(selectedInsight.generated_at), 'MMMM dd, yyyy • HH:mm')}
                    </Typography>
                  </Box>
                </Box>
              </DialogTitle>
              <DialogContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
                  <Chip
                    icon={getSeverityIcon(selectedInsight.severity)}
                    label={selectedInsight.severity}
                    color={getSeverityColor(selectedInsight.severity)}
                    sx={{ 
                      fontWeight: 600, 
                      fontSize: '0.8rem',
                      height: 28,
                      textTransform: 'capitalize',
                    }}
                  />
                  <Chip
                    label={selectedInsight.insight_type.replace('_', ' ')}
                    variant="outlined"
                    sx={{ 
                      fontWeight: 600, 
                      fontSize: '0.8rem',
                      height: 28,
                      borderWidth: 2,
                      textTransform: 'capitalize',
                    }}
                  />
                </Box>
                <Card
                  sx={{
                    p: 3,
                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.03) 0%, rgba(118, 75, 162, 0.03) 100%)',
                    borderRadius: 3,
                    border: `1px solid ${colors.border}30`,
                  }}
                >
                  <Box
                    sx={{
                      '& p': {
                        margin: '0 0 1em 0',
                        lineHeight: 1.9,
                        fontSize: { xs: '0.95rem', sm: '1.05rem' },
                        color: 'text.primary',
                        fontWeight: 400,
                        '&:last-child': {
                          marginBottom: 0,
                        },
                      },
                      '& ul, & ol': {
                        margin: '0 0 1em 0',
                        paddingLeft: '1.5em',
                        lineHeight: 1.9,
                        fontSize: { xs: '0.95rem', sm: '1.05rem' },
                        color: 'text.primary',
                      },
                      '& li': {
                        marginBottom: '0.5em',
                      },
                      '& strong': {
                        fontWeight: 700,
                        color: 'text.primary',
                      },
                      '& em': {
                        fontStyle: 'italic',
                      },
                      '& h1, & h2, & h3, & h4, & h5, & h6': {
                        margin: '1em 0 0.5em 0',
                        fontWeight: 700,
                        fontSize: { xs: '1.1rem', sm: '1.25rem' },
                        color: 'text.primary',
                        '&:first-of-type': {
                          marginTop: 0,
                        },
                      },
                      '& code': {
                        background: 'rgba(0, 0, 0, 0.05)',
                        padding: '0.2em 0.4em',
                        borderRadius: '4px',
                        fontSize: '0.9em',
                        fontFamily: 'monospace',
                        color: 'text.primary',
                      },
                      '& pre': {
                        background: 'rgba(0, 0, 0, 0.05)',
                        padding: '1em',
                        borderRadius: '8px',
                        overflow: 'auto',
                        '& code': {
                          background: 'transparent',
                          padding: 0,
                        },
                      },
                      '& blockquote': {
                        borderLeft: '3px solid',
                        borderColor: 'primary.main',
                        paddingLeft: '1em',
                        margin: '1em 0',
                        fontStyle: 'italic',
                      },
                      '& a': {
                        color: 'primary.main',
                        textDecoration: 'underline',
                        '&:hover': {
                          opacity: 0.8,
                        },
                      },
                    }}
                  >
                    <ReactMarkdown>{selectedInsight.insight_text}</ReactMarkdown>
                  </Box>
                </Card>
              </DialogContent>
              <DialogActions sx={{ p: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                <Button 
                  onClick={handleCloseDialog}
                  variant="contained"
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    borderRadius: 2,
                    textTransform: 'none',
                    px: 4,
                    py: 1,
                    fontWeight: 600,
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                    '&:hover': {
                      boxShadow: '0 6px 16px rgba(102, 126, 234, 0.4)',
                    },
                  }}
                >
                  Close
                </Button>
              </DialogActions>
            </>
          )
        })()}
      </Dialog>
    </Box>
  )
}

export default Insights

