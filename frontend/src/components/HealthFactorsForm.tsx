import { useState } from 'react'
import {
  TextField,
  Button,
  Alert,
  Typography,
  Box,
  Slider,
  Grid,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    try {
      const response = await apiClient.post('/api/health-factors/', {
        date,
        sleep_quality: sleepQuality || null,
        stress_level: stressLevel || null,
        exercise_duration: exerciseDuration ? parseInt(exerciseDuration) : null,
        notes: notes || '',
      })

      setSuccess(true)
      onFactorAdded(response.data)
      
      // Reset form
      setSleepQuality(null)
      setStressLevel(null)
      setExerciseDuration('')
      setNotes('')

      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      const errorMsg = err.response?.data
      if (typeof errorMsg === 'object') {
        const firstError = Object.values(errorMsg)[0]
        setError(Array.isArray(firstError) ? firstError[0] : String(firstError))
      } else {
        setError('Failed to add health factor. Please try again.')
      }
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Health factor added successfully!
        </Alert>
      )}

      <TextField
        margin="normal"
        required
        fullWidth
        label="Date"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        InputLabelProps={{
          shrink: true,
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
        sx={{ mt: 2 }}
      >
        Add Health Factors
      </Button>
    </form>
  )
}

export default HealthFactorsForm

