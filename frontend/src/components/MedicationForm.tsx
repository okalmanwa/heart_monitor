import { useState, useEffect } from 'react'
import {
  TextField,
  Button,
  Alert,
  Typography,
  Box,
  MenuItem,
  Grid,
  FormControlLabel,
  Switch,
  CircularProgress,
  Snackbar,
  LinearProgress,
  Card,
  CardContent,
  Chip,
} from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import apiClient from '../config/axios'
import { Medication } from '../types'

interface MedicationFormProps {
  onMedicationAdded: (medication: Medication) => void
  onMedicationUpdated?: (medication: Medication) => void
  initialData?: Medication
  onCancel?: () => void
}

const MedicationForm: React.FC<MedicationFormProps> = ({
  onMedicationAdded,
  onMedicationUpdated,
  initialData,
  onCancel,
}) => {
  const [name, setName] = useState(initialData?.name || '')
  const [dosage, setDosage] = useState(initialData?.dosage || '')
  const [frequency, setFrequency] = useState<Medication['frequency']>(
    initialData?.frequency || 'once_daily'
  )
  const [startDate, setStartDate] = useState(
    initialData?.start_date || new Date().toISOString().split('T')[0]
  )
  const [endDate, setEndDate] = useState(
    initialData?.end_date || ''
  )
  const [isActive, setIsActive] = useState(initialData?.is_active ?? true)
  const [notes, setNotes] = useState(initialData?.notes || '')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  // Calculate form completion
  const formProgress = [
    name,
    dosage,
    frequency,
    startDate,
  ].filter(Boolean).length / 4

  // Update form fields when initialData changes (for editing)
  useEffect(() => {
    if (initialData?.id) {
      // Editing mode - populate form with medication data
      setName(initialData.name || '')
      setDosage(initialData.dosage || '')
      setFrequency(initialData.frequency || 'once_daily')
      setStartDate(initialData.start_date ? initialData.start_date.split('T')[0] : new Date().toISOString().split('T')[0])
      setEndDate(initialData.end_date ? initialData.end_date.split('T')[0] : '')
      setIsActive(initialData.is_active ?? true)
      setNotes(initialData.notes || '')
      setError('')
      setSuccess(false)
    } else {
      // Add mode - reset form
      setName('')
      setDosage('')
      setFrequency('once_daily')
      setStartDate(new Date().toISOString().split('T')[0])
      setEndDate('')
      setIsActive(true)
      setNotes('')
      setError('')
      setSuccess(false)
    }
  }, [initialData?.id]) // Only depend on the ID to avoid unnecessary resets

  const frequencyOptions = [
    { value: 'once_daily', label: 'Once Daily' },
    { value: 'twice_daily', label: 'Twice Daily' },
    { value: 'three_times_daily', label: 'Three Times Daily' },
    { value: 'four_times_daily', label: 'Four Times Daily' },
    { value: 'as_needed', label: 'As Needed' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'other', label: 'Other' },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setLoading(true)

    try {
      const payload = {
        name,
        dosage,
        frequency,
        start_date: startDate,
        end_date: endDate || null,
        is_active: isActive,
        notes: notes || '',
      }

      let response
      if (initialData?.id) {
        // Update existing medication
        response = await apiClient.put(`/api/medications/medications/${initialData.id}/`, payload)
        
        // Show success notification first
        setSuccess(true)
        
        if (onMedicationUpdated && response.data) {
          // Ensure the response has the ID for proper state update
          const updatedMedication = { ...response.data, id: response.data.id || initialData.id }
          onMedicationUpdated(updatedMedication)
        }
        // Clear editing state after showing success message
        if (onCancel) {
          setTimeout(() => {
            setSuccess(false)
            onCancel()
          }, 2000) // Show success message for 2 seconds before clearing form
        } else {
          setTimeout(() => setSuccess(false), 3000)
        }
      } else {
        // Create new medication
        response = await apiClient.post('/api/medications/medications/', payload)
        onMedicationAdded(response.data)
        
        // Show success notification
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
        
        // Reset form
        setName('')
        setDosage('')
        setFrequency('once_daily')
        setStartDate(new Date().toISOString().split('T')[0])
        setEndDate('')
        setIsActive(true)
        setNotes('')
      }
    } catch (err: any) {
      console.error('Medication save error:', err)
      const errorMsg = err.response?.data
      if (typeof errorMsg === 'object' && errorMsg !== null) {
        // Handle validation errors
        const errorKeys = Object.keys(errorMsg)
        if (errorKeys.length > 0) {
          const firstError = errorMsg[errorKeys[0]]
        setError(Array.isArray(firstError) ? firstError[0] : String(firstError))
      } else {
        setError('Failed to save medication. Please try again.')
        }
      } else if (err.response?.status === 404) {
        setError('Medication not found. It may have been deleted.')
      } else if (err.response?.status >= 500) {
        setError('Server error. Please try again later.')
      } else {
        setError(err.message || 'Failed to save medication. Please try again.')
      }
    } finally {
      setLoading(false)
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
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{
          zIndex: 9999,
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
              fontSize: { xs: '1rem', sm: '1.1rem' },
            }
          }}
        >
          <Box>
            <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
              Medication {initialData?.id ? 'updated' : 'added'} successfully!
            </Typography>
            <Typography variant="body2">
              {initialData?.id 
                ? 'Your medication information has been updated.'
                : 'Great job tracking your medications! Keep it up!'}
            </Typography>
          </Box>
        </Alert>
      </Snackbar>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            label="Medication Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Lisinopril, Aspirin, Metformin"
            helperText="Enter the name of your medication"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            label="Dosage"
            value={dosage}
            onChange={(e) => setDosage(e.target.value)}
            placeholder="e.g., 10mg, 1 tablet, 2 capsules"
            helperText="How much do you take?"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            select
            label="Frequency"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as Medication['frequency'])}
            helperText="How often do you take it?"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          >
            {frequencyOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
            helperText="When did you start taking this?"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="End Date (if stopped)"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
            helperText="Leave blank if still taking"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />
        </Grid>

        <Grid item xs={12}>
          <Card 
            sx={{ 
              p: 2,
              background: isActive 
                ? 'linear-gradient(135deg, #4caf5015 0%, #4caf5005 100%)'
                : 'background.paper',
              border: `2px solid ${isActive ? '#4caf5040' : '#e0e0e0'}`,
              borderRadius: 2,
            }}
          >
            <FormControlLabel
              control={
                <Switch
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  color="primary"
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#4caf50',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: '#4caf50',
                    },
                  }}
                />
              }
              label={
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {isActive ? 'Active Medication' : 'Inactive Medication'}
                </Typography>
              }
            />
          </Card>
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Notes (optional)"
            multiline
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add helpful reminders: e.g., 'Take with food', 'Avoid alcohol', 'Take in the morning'"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />
        </Grid>

        <Grid item xs={12}>
          <Box display="flex" gap={2} justifyContent="flex-end" sx={{ mt: 2 }}>
            {onCancel && (
              <Button 
                variant="outlined" 
                onClick={onCancel}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              variant="contained"
              disabled={loading || !name || !dosage || !frequency || !startDate}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1.5,
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
              {loading 
                ? (initialData?.id ? 'Updating...' : 'Saving...') 
                : `${initialData?.id ? 'Update' : 'Save'} Medication`}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </form>
  )
}

export default MedicationForm

