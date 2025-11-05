import { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Typography,
  Slider,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import { HealthFactor } from '../../types'
import apiClient from '../../config/axios'
import { format } from 'date-fns'

const AdminHealthFactors = () => {
  const [factors, setFactors] = useState<HealthFactor[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editingFactor, setEditingFactor] = useState<HealthFactor | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState({
    user_id: '',
    date: new Date().toISOString().split('T')[0],
    sleep_quality: 3,
    stress_level: 3,
    exercise_duration: '',
    notes: '',
  })

  useEffect(() => {
    fetchFactors()
  }, [])

  const fetchFactors = async () => {
    try {
      const response = await apiClient.get('/api/admin/health-factors/')
      setFactors(response.data.results || response.data || [])
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError('You do not have permission to view health factors. Make sure you are logged in as an admin.')
      } else {
        setError('Failed to fetch health factors')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingFactor(null)
    setFormData({
      user_id: '',
      date: new Date().toISOString().split('T')[0],
      sleep_quality: 3,
      stress_level: 3,
      exercise_duration: '',
      notes: '',
    })
    setOpen(true)
  }

  const handleEdit = (factor: HealthFactor) => {
    setEditingFactor(factor)
    setFormData({
      user_id: (factor as any).user_id?.toString() || '',
      date: factor.date ? new Date(factor.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      sleep_quality: factor.sleep_quality || 3,
      stress_level: factor.stress_level || 3,
      exercise_duration: factor.exercise_duration?.toString() || '',
      notes: factor.notes || '',
    })
    setOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this health factor?')) return
    
    try {
      await apiClient.delete(`/api/admin/health-factors/${id}/`)
      setSuccess('Health factor deleted successfully!')
      fetchFactors()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError('You do not have permission to delete health factors')
      } else {
        setError('Failed to delete health factor')
      }
    }
  }

  const handleSubmit = async () => {
    try {
      const data: any = {
        date: formData.date,
        sleep_quality: formData.sleep_quality || null,
        stress_level: formData.stress_level || null,
        exercise_duration: formData.exercise_duration ? parseInt(formData.exercise_duration) : null,
        notes: formData.notes,
      }
      
      // Add user_id if provided (admin feature)
      if (formData.user_id) {
        data.user_id = parseInt(formData.user_id)
      }

      if (editingFactor && editingFactor.id) {
        await apiClient.put(`/api/admin/health-factors/${editingFactor.id}/`, data)
        setSuccess('Health factor updated successfully!')
      } else {
        await apiClient.post('/api/admin/health-factors/', data)
        setSuccess('Health factor created successfully!')
      }
      setOpen(false)
      fetchFactors()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save health factor')
    }
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">Health Factors</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
          Add Health Factor
        </Button>
      </Box>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Sleep Quality</TableCell>
                <TableCell>Stress Level</TableCell>
                <TableCell>Exercise (min)</TableCell>
                <TableCell>Notes</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {factors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography color="text.secondary" sx={{ py: 3 }}>
                      No health factors found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                factors.map((factor) => (
                  <TableRow key={factor.id}>
                    <TableCell>{(factor as any).user_email || 'N/A'}</TableCell>
                    <TableCell>
                      {factor.date ? format(new Date(factor.date), 'MMM dd, yyyy') : 'N/A'}
                    </TableCell>
                    <TableCell>{factor.sleep_quality ? `${factor.sleep_quality}/5` : '-'}</TableCell>
                    <TableCell>{factor.stress_level ? `${factor.stress_level}/5` : '-'}</TableCell>
                    <TableCell>{factor.exercise_duration ? `${factor.exercise_duration} min` : '-'}</TableCell>
                    <TableCell>{factor.notes || '-'}</TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => handleEdit(factor)} color="primary">
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" onClick={() => factor.id && handleDelete(factor.id)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingFactor ? 'Edit Health Factor' : 'Create Health Factor'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="User ID (optional - leave blank for current user)"
              type="number"
              value={formData.user_id}
              onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
              margin="normal"
              helperText="Admin only: Enter user ID to create health factor for another user"
            />
            <TextField
              fullWidth
              label="Date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              margin="normal"
              required
              InputLabelProps={{ shrink: true }}
            />
            <Box sx={{ mt: 3, mb: 2 }}>
              <Typography gutterBottom>
                Sleep Quality: {formData.sleep_quality}/5
              </Typography>
              <Slider
                value={formData.sleep_quality}
                min={1}
                max={5}
                step={1}
                marks
                onChange={(_, value) => setFormData({ ...formData, sleep_quality: value as number })}
              />
            </Box>
            <Box sx={{ mt: 3, mb: 2 }}>
              <Typography gutterBottom>
                Stress Level: {formData.stress_level}/5
              </Typography>
              <Slider
                value={formData.stress_level}
                min={1}
                max={5}
                step={1}
                marks
                onChange={(_, value) => setFormData({ ...formData, stress_level: value as number })}
              />
            </Box>
            <TextField
              fullWidth
              label="Exercise Duration (minutes)"
              type="number"
              value={formData.exercise_duration}
              onChange={(e) => setFormData({ ...formData, exercise_duration: e.target.value })}
              margin="normal"
              inputProps={{ min: 0 }}
            />
            <TextField
              fullWidth
              label="Notes"
              multiline
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              margin="normal"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingFactor ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default AdminHealthFactors

