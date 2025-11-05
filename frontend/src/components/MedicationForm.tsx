import { useState } from 'react'
import {
  TextField,
  Button,
  Alert,
  Typography,
  Box,
  MenuItem,
  Grid,
} from '@mui/material'
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
        if (onMedicationUpdated) {
          onMedicationUpdated(response.data)
        }
      } else {
        // Create new medication
        response = await apiClient.post('/api/medications/medications/', payload)
        onMedicationAdded(response.data)
        
        // Reset form
        setName('')
        setDosage('')
        setFrequency('once_daily')
        setStartDate(new Date().toISOString().split('T')[0])
        setEndDate('')
        setIsActive(true)
        setNotes('')
      }

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      const errorMsg = err.response?.data
      if (typeof errorMsg === 'object') {
        const firstError = Object.values(errorMsg)[0]
        setError(Array.isArray(firstError) ? firstError[0] : String(firstError))
      } else {
        setError('Failed to save medication. Please try again.')
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
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Medication {initialData?.id ? 'updated' : 'added'} successfully!
        </Alert>
      )}

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
            >
              {initialData?.id ? 'Update' : 'Add'} Medication
            </Button>
          </Box>
        </Grid>
      </Grid>
    </form>
  )
}

export default MedicationForm

