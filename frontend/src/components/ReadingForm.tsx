import { useState } from 'react'
import {
  TextField,
  Button,
  Alert,
  Typography,
} from '@mui/material'
import axios from 'axios'
import { BloodPressureReading } from '../types'

interface ReadingFormProps {
  onReadingAdded: (reading: BloodPressureReading) => void
}

const ReadingForm: React.FC<ReadingFormProps> = ({ onReadingAdded }) => {
  const [systolic, setSystolic] = useState('')
  const [diastolic, setDiastolic] = useState('')
  const [heartRate, setHeartRate] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    const now = new Date().toISOString()

    try {
      const response = await axios.post('/api/readings/', {
        systolic: parseInt(systolic),
        diastolic: parseInt(diastolic),
        heart_rate: heartRate ? parseInt(heartRate) : null,
        recorded_at: now,
        notes: notes || '',
      })

      setSuccess(true)
      onReadingAdded(response.data)
      
      // Reset form
      setSystolic('')
      setDiastolic('')
      setHeartRate('')
      setNotes('')

      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      const errorMsg = err.response?.data
      if (typeof errorMsg === 'object') {
        const firstError = Object.values(errorMsg)[0]
        setError(Array.isArray(firstError) ? firstError[0] : String(firstError))
      } else {
        setError('Failed to add reading. Please try again.')
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
          Reading added successfully!
        </Alert>
      )}
      <TextField
        margin="normal"
        required
        fullWidth
        label="Systolic (Top Number)"
        type="number"
        value={systolic}
        onChange={(e) => setSystolic(e.target.value)}
        inputProps={{ min: 50, max: 250 }}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        label="Diastolic (Bottom Number)"
        type="number"
        value={diastolic}
        onChange={(e) => setDiastolic(e.target.value)}
        inputProps={{ min: 30, max: 200 }}
      />
      <TextField
        margin="normal"
        fullWidth
        label="Heart Rate (BPM)"
        type="number"
        value={heartRate}
        onChange={(e) => setHeartRate(e.target.value)}
        inputProps={{ min: 30, max: 200 }}
      />
      <TextField
        margin="normal"
        fullWidth
        label="Notes (optional)"
        multiline
        rows={3}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="e.g., after exercise, stressful day"
      />
      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 2 }}
      >
        Add Reading
      </Button>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        <strong>Medical Disclaimer:</strong> This app is for informational purposes only and is not a substitute for professional medical advice.
      </Typography>
    </form>
  )
}

export default ReadingForm

