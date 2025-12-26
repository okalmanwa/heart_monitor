import { useState } from 'react'
import {
  TextField,
  Button,
  Alert,
  Typography,
  Box,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  CircularProgress,
} from '@mui/material'
import FavoriteIcon from '@mui/icons-material/Favorite'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import apiClient from '../config/axios'
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
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Calculate health status based on BP values
  const getBPStatus = (sys: number, dia: number) => {
    if (!sys || !dia) return null
    if (sys < 120 && dia < 80) return { label: 'Normal', color: '#4caf50', emoji: '✅' }
    if (sys < 130 && dia < 80) return { label: 'Elevated', color: '#ff9800', emoji: '⚠️' }
    if (sys < 140 || dia < 90) return { label: 'High Stage 1', color: '#ff5722', emoji: '🔴' }
    if (sys >= 140 || dia >= 90) return { label: 'High Stage 2', color: '#d32f2f', emoji: '🚨' }
    return { label: 'Crisis', color: '#b71c1c', emoji: '⚡' }
  }

  const bpStatus = systolic && diastolic 
    ? getBPStatus(parseInt(systolic), parseInt(diastolic))
    : null

  const formProgress = [
    systolic && diastolic,
    heartRate,
    notes,
  ].filter(Boolean).length / 3

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setIsSubmitting(true)

    const now = new Date().toISOString()

    try {
      const response = await apiClient.post('/api/readings/', {
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

      setTimeout(() => {
        setSuccess(false)
        setIsSubmitting(false)
      }, 3000)
    } catch (err: any) {
      const errorMsg = err.response?.data
      if (typeof errorMsg === 'object') {
        const firstError = Object.values(errorMsg)[0]
        setError(Array.isArray(firstError) ? firstError[0] : String(firstError))
      } else {
        setError('Failed to add reading. Please try again.')
      }
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
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
      {success && (
        <Alert 
          severity="success" 
          icon={<CheckCircleIcon />}
          sx={{ 
            mb: 2,
            borderRadius: 2,
            backgroundColor: '#e8f5e9',
            '& .MuiAlert-icon': {
              color: '#4caf50',
            },
          }}
        >
          <Box>
            <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
              🎉 Great job! Your reading has been saved.
            </Typography>
            <Typography variant="body2">
              Keep tracking to see your progress over time!
            </Typography>
          </Box>
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

      {/* BP Status Card */}
      {bpStatus && (
        <Card 
          sx={{ 
            mb: 3,
            background: `linear-gradient(135deg, ${bpStatus.color}15 0%, ${bpStatus.color}05 100%)`,
            border: `2px solid ${bpStatus.color}40`,
            borderRadius: 3,
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <FavoriteIcon sx={{ color: bpStatus.color, fontSize: '2rem' }} />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, color: bpStatus.color }}>
                  {bpStatus.emoji} {bpStatus.label}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {systolic}/{diastolic} mmHg
                </Typography>
              </Box>
            </Box>
            {bpStatus.label !== 'Normal' && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                💡 Consider discussing these readings with your healthcare provider.
              </Typography>
            )}
          </CardContent>
        </Card>
      )}

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          required
          fullWidth
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <TrendingUpIcon sx={{ fontSize: '1.2rem', color: 'primary.main' }} />
              <span>Systolic (Top)</span>
            </Box>
          }
          type="number"
          value={systolic}
          onChange={(e) => setSystolic(e.target.value)}
          inputProps={{ min: 50, max: 250 }}
          helperText="The top number when your heart beats"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            },
          }}
        />
        <TextField
          required
          fullWidth
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <TrendingUpIcon sx={{ fontSize: '1.2rem', color: 'primary.main' }} />
              <span>Diastolic (Bottom)</span>
            </Box>
          }
          type="number"
          value={diastolic}
          onChange={(e) => setDiastolic(e.target.value)}
          inputProps={{ min: 30, max: 200 }}
          helperText="The bottom number when your heart rests"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            },
          }}
        />
      </Box>

      <TextField
        margin="normal"
        fullWidth
        label="💓 Heart Rate (BPM)"
        type="number"
        value={heartRate}
        onChange={(e) => setHeartRate(e.target.value)}
        inputProps={{ min: 30, max: 200 }}
        helperText="Optional: Your pulse rate in beats per minute"
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
          },
        }}
      />

      <TextField
        margin="normal"
        fullWidth
        label="📝 Notes (optional)"
        multiline
        rows={3}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="💡 Add context: e.g., 'After morning walk', 'Before bed', 'Stressful meeting today'"
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
        disabled={isSubmitting || !systolic || !diastolic}
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
        startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
      >
        {isSubmitting ? 'Saving...' : '💾 Save Reading'}
      </Button>

      <Typography 
        variant="caption" 
        color="text.secondary" 
        sx={{ 
          mt: 1, 
          display: 'block',
          textAlign: 'center',
          fontSize: '0.75rem',
        }}
      >
        <strong>Medical Disclaimer:</strong> This app is for informational purposes only and is not a substitute for professional medical advice.
      </Typography>
    </form>
  )
}

export default ReadingForm

