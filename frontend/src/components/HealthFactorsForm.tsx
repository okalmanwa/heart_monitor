import { useState } from 'react'
import {
  TextField,
  Button,
  Alert,
  Typography,
  Box,
  Slider,
  Grid,
  CircularProgress,
  Snackbar,
  Card,
  CardContent,
  LinearProgress,
  Chip,
} from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import apiClient from '../config/axios'
import { HealthFactor } from '../types'

interface HealthFactorsFormProps {
  onFactorAdded: (factor: HealthFactor) => void
}

const HealthFactorsForm: React.FC<HealthFactorsFormProps> = ({ onFactorAdded }) => {
  const [date, setDate] = useState(() => {
    // Default to today's date
    const today = new Date()
    return today.toISOString().split('T')[0]
  })
  const [sleepQuality, setSleepQuality] = useState<number | null>(null)
  const [stressLevel, setStressLevel] = useState<number | null>(null)
  const [exerciseDuration, setExerciseDuration] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [dateError, setDateError] = useState('')
  const [loading, setLoading] = useState(false)

  // Calculate form completion
  const formProgress = [
    date,
    sleepQuality !== null,
    stressLevel !== null,
    exerciseDuration || notes,
  ].filter(Boolean).length / 4

  // Get sleep quality label and color
  const getSleepQuality = (value: number | null) => {
    if (!value) return null
    if (value >= 4) return { label: 'Excellent', color: '#4caf50' }
    if (value >= 3) return { label: 'Good', color: '#8bc34a' }
    if (value >= 2) return { label: 'Fair', color: '#ff9800' }
    return { label: 'Poor', color: '#f44336' }
  }

  // Get stress level label and color
  const getStressLevel = (value: number | null) => {
    if (!value) return null
    if (value <= 2) return { label: 'Low', color: '#4caf50' }
    if (value <= 3) return { label: 'Moderate', color: '#8bc34a' }
    if (value <= 4) return { label: 'High', color: '#ff9800' }
    return { label: 'Very High', color: '#f44336' }
  }

  const sleepInfo = getSleepQuality(sleepQuality)
  const stressInfo = getStressLevel(stressLevel)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setDateError('')
    setSuccess(false)
    setLoading(true)

    // Validate date is present
    const dateValue = date.trim()
    if (!dateValue) {
      setDateError('Please select a date.')
      setError('Please select a date.')
      setLoading(false)
      return
    }

    try {
      console.log('Submitting health factor with data:', {
        date: dateValue,
        sleep_quality: sleepQuality,
        stress_level: stressLevel,
        exercise_duration: exerciseDuration ? parseInt(exerciseDuration) : null,
        notes: notes || '',
      })

      const response = await apiClient.post('/api/health-factors/', {
        date: dateValue,
        sleep_quality: sleepQuality || null,
        stress_level: stressLevel || null,
        exercise_duration: exerciseDuration ? parseInt(exerciseDuration) : null,
        notes: notes || '',
      })

      setSuccess(true)
      onFactorAdded(response.data)
      
      // Reset form but keep the date as today
      const today = new Date()
      setDate(today.toISOString().split('T')[0])
      setSleepQuality(null)
      setStressLevel(null)
      setExerciseDuration('')
      setNotes('')
      setDateError('')

      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      console.error('Health factor creation error:', err)
      
      // Check if it's an IntegrityError (duplicate entry)
      const errorResponse = err.response?.data
      const errorText = typeof errorResponse === 'string' ? errorResponse : ''
      
      if (errorText.includes('duplicate key') || errorText.includes('already exists') || 
          errorText.includes('unique constraint') || err.response?.status === 500) {
        const duplicateError = 'You already have a health factor entry for this date. Please select a different date or update the existing entry.'
        setError(duplicateError)
        setDateError(duplicateError)
        return
      }
      
      // Handle JSON error responses
      if (typeof errorResponse === 'object' && errorResponse !== null) {
        // Handle field-specific errors
        if (errorResponse.date) {
          const dateErr = Array.isArray(errorResponse.date) ? errorResponse.date[0] : String(errorResponse.date)
          setDateError(dateErr)
          setError(dateErr)
        } else if (errorResponse.non_field_errors) {
          // Handle unique constraint errors
          const uniqueErr = Array.isArray(errorResponse.non_field_errors) 
            ? errorResponse.non_field_errors[0] 
            : String(errorResponse.non_field_errors)
          setError(uniqueErr)
          if (uniqueErr.includes('date') || uniqueErr.includes('already exists') || uniqueErr.includes('duplicate')) {
            setDateError('You already have a health factor entry for this date. Please select a different date.')
          }
        } else {
          // Get first error from any field
          const errorKeys = Object.keys(errorResponse)
          if (errorKeys.length > 0) {
            const firstKey = errorKeys[0]
            const firstError = errorResponse[firstKey]
            const errorText = Array.isArray(firstError) ? firstError[0] : String(firstError)
            setError(`${firstKey}: ${errorText}`)
            if (firstKey === 'date') {
              setDateError(errorText)
            }
          } else {
            setError('Failed to add health factor. Please check your input.')
          }
        }
      } else if (typeof errorResponse === 'string' && errorResponse) {
        setError(errorResponse)
        if (errorResponse.toLowerCase().includes('date') || errorResponse.toLowerCase().includes('duplicate')) {
          setDateError('You already have a health factor entry for this date. Please select a different date.')
        }
      } else {
        setError(err.message || 'Failed to add health factor. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 2,
            borderRadius: 2,
          }}
        >
          {error}
        </Alert>
      )}

      {/* Progress Indicator */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
            Form Progress
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
            {Math.round(formProgress * 100)}%
          </Typography>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={formProgress * 100} 
          sx={{ 
            height: 8, 
            borderRadius: 4,
            backgroundColor: '#e0e0e0',
            '& .MuiLinearProgress-bar': {
              borderRadius: 4,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            },
          }}
        />
      </Box>

      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bottom: 'auto',
          '& .MuiSnackbarContent-root': {
            backgroundColor: '#4caf50',
            color: '#fff',
            fontSize: { xs: '1rem', sm: '1.1rem' },
            fontWeight: 600,
            padding: { xs: '16px 24px', sm: '20px 32px' },
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(76, 175, 80, 0.4)',
            minWidth: { xs: '280px', sm: '320px' },
            maxWidth: { xs: '90vw', sm: '400px' },
          }
        }}
      >
        <Alert 
          severity="success" 
          onClose={() => setSuccess(false)}
          icon={<CheckCircleIcon sx={{ color: '#fff', fontSize: '1.5rem' }} />}
          sx={{ 
            width: '100%',
            backgroundColor: 'transparent',
            color: '#fff',
            '& .MuiAlert-icon': {
              color: '#fff',
            },
            '& .MuiAlert-message': {
              fontWeight: 600,
            }
          }}
        >
          <Box>
            <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
              Health factors saved!
            </Typography>
            <Typography variant="body2">
              Keep tracking daily to see patterns in your health.
            </Typography>
          </Box>
        </Alert>
      </Snackbar>

      <TextField
        margin="normal"
        required
        fullWidth
        label="Date"
        type="date"
        value={date || ''}
        onChange={(e) => {
          const newDate = e.target.value
          console.log('Date changed to:', newDate)
          setDate(newDate)
          setDateError('')
          setError('')
        }}
        InputLabelProps={{
          shrink: true,
        }}
        error={!!dateError}
        helperText={dateError || 'Select the date for this entry'}
        inputProps={{
          min: '2000-01-01',
          max: new Date().toISOString().split('T')[0],
        }}
        sx={{
          '& input[type="date"]': {
            color: date ? 'inherit' : 'transparent',
          },
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
          },
        }}
      />

      <Card 
        sx={{ 
          mt: 3,
          mb: 2,
          background: sleepInfo 
            ? `linear-gradient(135deg, ${sleepInfo.color}15 0%, ${sleepInfo.color}05 100%)`
            : 'background.paper',
          border: sleepInfo ? `2px solid ${sleepInfo.color}40` : '1px solid',
          borderColor: 'divider',
          borderRadius: 3,
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                Sleep Quality
              </Typography>
              {sleepInfo && (
                <Chip 
                  label={sleepInfo.label}
                  size="small"
                  sx={{ 
                    backgroundColor: `${sleepInfo.color}20`,
                    color: sleepInfo.color,
                    fontWeight: 600,
                  }}
                />
              )}
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: sleepInfo?.color || 'text.secondary' }}>
              {sleepQuality ? `${sleepQuality}/5` : '—'}
            </Typography>
          </Box>
          <Slider
            value={sleepQuality || 3}
            min={1}
            max={5}
            step={1}
            marks={[
              { value: 1, label: '1' },
              { value: 2, label: '2' },
              { value: 3, label: '3' },
              { value: 4, label: '4' },
              { value: 5, label: '5' },
            ]}
            onChange={(_, value) => setSleepQuality(value as number)}
            valueLabelDisplay="auto"
            sx={{
              '& .MuiSlider-thumb': {
                width: 24,
                height: 24,
              },
              '& .MuiSlider-valueLabel': {
                backgroundColor: '#667eea',
              },
            }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            Rate your sleep from 1 (poor) to 5 (excellent)
          </Typography>
        </CardContent>
      </Card>

      <Card 
        sx={{ 
          mt: 3,
          mb: 2,
          background: stressInfo 
            ? `linear-gradient(135deg, ${stressInfo.color}15 0%, ${stressInfo.color}05 100%)`
            : 'background.paper',
          border: stressInfo ? `2px solid ${stressInfo.color}40` : '1px solid',
          borderColor: 'divider',
          borderRadius: 3,
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                Stress Level
              </Typography>
              {stressInfo && (
                <Chip 
                  label={stressInfo.label}
                  size="small"
                  sx={{ 
                    backgroundColor: `${stressInfo.color}20`,
                    color: stressInfo.color,
                    fontWeight: 600,
                  }}
                />
              )}
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: stressInfo?.color || 'text.secondary' }}>
              {stressLevel ? `${stressLevel}/5` : '—'}
            </Typography>
          </Box>
          <Slider
            value={stressLevel || 3}
            min={1}
            max={5}
            step={1}
            marks={[
              { value: 1, label: '1' },
              { value: 2, label: '2' },
              { value: 3, label: '3' },
              { value: 4, label: '4' },
              { value: 5, label: '5' },
            ]}
            onChange={(_, value) => setStressLevel(value as number)}
            valueLabelDisplay="auto"
            sx={{
              '& .MuiSlider-thumb': {
                width: 24,
                height: 24,
              },
              '& .MuiSlider-valueLabel': {
                backgroundColor: '#667eea',
              },
            }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            Rate your stress from 1 (low) to 5 (very high)
          </Typography>
        </CardContent>
      </Card>

      <TextField
        margin="normal"
        fullWidth
        label="Exercise Duration (minutes)"
        type="number"
        value={exerciseDuration}
        onChange={(e) => setExerciseDuration(e.target.value)}
        inputProps={{ min: 0, max: 600 }}
        helperText="Optional: How many minutes did you exercise today?"
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
          },
        }}
      />

      <TextField
        margin="normal"
        fullWidth
        label="Notes (optional)"
        multiline
        rows={3}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Add context: e.g., 'Morning walk in the park', 'Stressful meeting at work', 'Late night, couldn't sleep'"
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
          },
        }}
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        disabled={loading || !date}
        sx={{ 
          mt: 3,
          mb: 2,
          py: 1.5,
          borderRadius: 2,
          fontSize: '1rem',
          fontWeight: 600,
          textTransform: 'none',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
          '&:hover': {
            boxShadow: '0 6px 16px rgba(102, 126, 234, 0.5)',
            transform: 'translateY(-1px)',
          },
          '&:disabled': {
            background: 'rgba(102, 126, 234, 0.5)',
          },
          transition: 'all 0.2s ease',
        }}
        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
      >
        {loading ? 'Saving...' : 'Save Health Factors'}
      </Button>
    </form>
  )
}

export default HealthFactorsForm

