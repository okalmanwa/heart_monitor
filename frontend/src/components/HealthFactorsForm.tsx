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
} from '@mui/material'
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
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
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
          Health factor added successfully!
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
        helperText={dateError || ''}
        inputProps={{
          min: '2000-01-01',
          max: new Date().toISOString().split('T')[0],
        }}
        sx={{
          '& input[type="date"]': {
            color: date ? 'inherit' : 'transparent',
          }
        }}
      />

      <Box sx={{ mt: 3, mb: 2 }}>
        <Typography gutterBottom>
          Sleep Quality: {sleepQuality ? `${sleepQuality}/5` : 'Not set'}
        </Typography>
        <Slider
          value={sleepQuality || 3}
          min={1}
          max={5}
          step={1}
          marks={[
            { value: 1, label: '1' },
            { value: 3, label: '3' },
            { value: 5, label: '5' },
          ]}
          onChange={(_, value) => setSleepQuality(value as number)}
          valueLabelDisplay="auto"
        />
        <Typography variant="caption" color="text.secondary">
          1 = Poor, 5 = Excellent
        </Typography>
      </Box>

      <Box sx={{ mt: 3, mb: 2 }}>
        <Typography gutterBottom>
          Stress Level: {stressLevel ? `${stressLevel}/5` : 'Not set'}
        </Typography>
        <Slider
          value={stressLevel || 3}
          min={1}
          max={5}
          step={1}
          marks={[
            { value: 1, label: '1' },
            { value: 3, label: '3' },
            { value: 5, label: '5' },
          ]}
          onChange={(_, value) => setStressLevel(value as number)}
          valueLabelDisplay="auto"
        />
        <Typography variant="caption" color="text.secondary">
          1 = Low, 5 = Very High
        </Typography>
      </Box>

      <TextField
        margin="normal"
        fullWidth
        label="Exercise Duration (minutes)"
        type="number"
        value={exerciseDuration}
        onChange={(e) => setExerciseDuration(e.target.value)}
        inputProps={{ min: 0, max: 600 }}
        helperText="Enter exercise duration in minutes"
      />

      <TextField
        margin="normal"
        fullWidth
        label="Notes (optional)"
        multiline
        rows={3}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="e.g., morning walk, stressful meeting, late night"
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        disabled={loading}
        sx={{ mt: 2 }}
        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
      >
        {loading ? 'Adding...' : 'Add Health Factors'}
      </Button>
    </form>
  )
}

export default HealthFactorsForm

