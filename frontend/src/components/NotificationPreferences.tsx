import { useState, useEffect } from 'react'
import {
  Paper,
  Typography,
  Box,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Alert,
  MenuItem,
  Grid,
} from '@mui/material'
import apiClient from '../config/axios'

interface NotificationPreferences {
  id?: number
  bp_reminder_enabled: boolean
  bp_reminder_frequency: 'daily' | 'twice_weekly' | 'weekly' | 'biweekly'
  bp_reminder_time: string
  medication_reminder_enabled: boolean
  insight_notifications_enabled: boolean
}

const NotificationPreferences: React.FC = () => {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    bp_reminder_enabled: true,
    bp_reminder_frequency: 'daily',
    bp_reminder_time: '09:00',
    medication_reminder_enabled: true,
    insight_notifications_enabled: true,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetchPreferences()
  }, [])

  const fetchPreferences = async () => {
    try {
      const response = await apiClient.get('/api/notifications/preferences/my_preferences/')
      setPreferences(response.data)
    } catch (error: any) {
      // If 404, preferences don't exist yet, use defaults
      if (error.response?.status !== 404) {
        console.error('Failed to fetch preferences:', error)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSuccess(false)

    try {
      await apiClient.put('/api/notifications/preferences/my_preferences/', preferences)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      const errorMsg = err.response?.data
      if (typeof errorMsg === 'object') {
        const firstError = Object.values(errorMsg)[0]
        setError(Array.isArray(firstError) ? firstError[0] : String(firstError))
      } else {
        setError('Failed to save preferences. Please try again.')
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography>Loading...</Typography>
      </Paper>
    )
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Notification Preferences
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Manage your email notification settings
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Preferences saved successfully!
        </Alert>
      )}

      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Blood Pressure Reminders
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={preferences.bp_reminder_enabled}
              onChange={(e) =>
                setPreferences({ ...preferences, bp_reminder_enabled: e.target.checked })
              }
            />
          }
          label="Enable BP reading reminders"
        />
        {preferences.bp_reminder_enabled && (
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Reminder Frequency"
                value={preferences.bp_reminder_frequency}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    bp_reminder_frequency: e.target.value as NotificationPreferences['bp_reminder_frequency'],
                  })
                }
              >
                <MenuItem value="daily">Daily</MenuItem>
                <MenuItem value="twice_weekly">Twice Weekly</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="biweekly">Bi-Weekly</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Preferred Time"
                type="time"
                value={preferences.bp_reminder_time}
                onChange={(e) =>
                  setPreferences({ ...preferences, bp_reminder_time: e.target.value })
                }
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
          </Grid>
        )}
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Medication Reminders
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={preferences.medication_reminder_enabled}
              onChange={(e) =>
                setPreferences({ ...preferences, medication_reminder_enabled: e.target.checked })
              }
            />
          }
          label="Enable medication reminders"
        />
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Health Insights
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={preferences.insight_notifications_enabled}
              onChange={(e) =>
                setPreferences({ ...preferences, insight_notifications_enabled: e.target.checked })
              }
            />
          }
          label="Enable insight notifications"
        />
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Preferences'}
        </Button>
      </Box>
    </Paper>
  )
}

export default NotificationPreferences

