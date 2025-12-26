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
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
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
          Medication {initialData?.id ? 'updated' : 'added'} successfully!
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
            placeholder="e.g., Lisinopril, Aspirin"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            label="Dosage"
            value={dosage}
            onChange={(e) => setDosage(e.target.value)}
            placeholder="e.g., 10mg, 1 tablet"
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
          />
        </Grid>

        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                color="primary"
              />
            }
            label="Active Medication"
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Notes (optional)"
            multiline
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g., Take with food, avoid alcohol"
          />
        </Grid>

        <Grid item xs={12}>
          <Box display="flex" gap={2} justifyContent="flex-end">
            {onCancel && (
              <Button variant="outlined" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {loading 
                ? (initialData?.id ? 'Updating...' : 'Adding...') 
                : (initialData?.id ? 'Update' : 'Add') + ' Medication'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </form>
  )
}

export default MedicationForm

