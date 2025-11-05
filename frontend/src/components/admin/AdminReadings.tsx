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
  Chip,
  CircularProgress,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import { BloodPressureReading, User } from '../../types'
import apiClient from '../../config/axios'
import { format } from 'date-fns'

const AdminReadings = () => {
  const [readings, setReadings] = useState<BloodPressureReading[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editingReading, setEditingReading] = useState<BloodPressureReading | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState({
    user_id: '',
    systolic: '',
    diastolic: '',
    heart_rate: '',
    recorded_at: new Date().toISOString().slice(0, 16),
    notes: '',
  })

  useEffect(() => {
    fetchReadings()
    fetchUsers()
  }, [])

  const fetchReadings = async () => {
    try {
      const response = await apiClient.get('/api/admin/readings/')
      setReadings(response.data.results || response.data || [])
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError('You do not have permission to view readings. Make sure you are logged in as an admin.')
      } else {
        setError('Failed to fetch readings')
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      // You'll need to create an admin endpoint to get all users
      // For now, we'll leave it empty
      setUsers([])
    } catch (err) {
      console.error('Failed to fetch users')
    }
  }

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'normal': return 'success'
      case 'elevated': return 'warning'
      case 'high_stage1': return 'error'
      case 'high_stage2': return 'error'
      default: return 'default'
    }
  }

  const getCategoryLabel = (category?: string) => {
    switch (category) {
      case 'normal': return 'Normal'
      case 'elevated': return 'Elevated'
      case 'high_stage1': return 'High Stage 1'
      case 'high_stage2': return 'High Stage 2'
      default: return 'Unknown'
    }
  }

  const handleCreate = () => {
    setEditingReading(null)
    setFormData({
      user_id: '',
      systolic: '',
      diastolic: '',
      heart_rate: '',
      recorded_at: new Date().toISOString().slice(0, 16),
      notes: '',
    })
    setOpen(true)
  }

  const handleEdit = (reading: BloodPressureReading) => {
    setEditingReading(reading)
    setFormData({
      user_id: reading.user?.toString() || '',
      systolic: reading.systolic.toString(),
      diastolic: reading.diastolic.toString(),
      heart_rate: reading.heart_rate?.toString() || '',
      recorded_at: reading.recorded_at ? new Date(reading.recorded_at).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
      notes: reading.notes || '',
    })
    setOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this reading?')) return
    
    try {
      await apiClient.delete(`/api/admin/readings/${id}/`)
      setSuccess('Reading deleted successfully!')
      fetchReadings()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError('You do not have permission to delete readings')
      } else {
        setError('Failed to delete reading')
      }
    }
  }

  const handleSubmit = async () => {
    try {
      const data = {
        user_id: formData.user_id ? parseInt(formData.user_id) : undefined,
        systolic: parseInt(formData.systolic),
        diastolic: parseInt(formData.diastolic),
        heart_rate: formData.heart_rate ? parseInt(formData.heart_rate) : null,
        recorded_at: new Date(formData.recorded_at).toISOString(),
        notes: formData.notes,
      }

      if (editingReading && editingReading.id) {
        await apiClient.put(`/api/admin/readings/${editingReading.id}/`, data)
        setSuccess('Reading updated successfully!')
      } else {
        await apiClient.post('/api/admin/readings/', data)
        setSuccess('Reading created successfully!')
      }
      setOpen(false)
      fetchReadings()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save reading')
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
        <Typography variant="h6">Blood Pressure Readings</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
          Add Reading
        </Button>
      </Box>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>BP</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Heart Rate</TableCell>
                <TableCell>Recorded At</TableCell>
                <TableCell>Notes</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {readings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography color="text.secondary" sx={{ py: 3 }}>
                      No readings found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                readings.map((reading) => (
                  <TableRow key={reading.id}>
                    <TableCell>{(reading as any).user_email || reading.user || 'N/A'}</TableCell>
                    <TableCell>{reading.systolic}/{reading.diastolic}</TableCell>
                    <TableCell>
                      <Chip
                        label={getCategoryLabel(reading.category)}
                        size="small"
                        color={getCategoryColor(reading.category) as any}
                      />
                    </TableCell>
                    <TableCell>{reading.heart_rate || '-'}</TableCell>
                    <TableCell>
                      {reading.recorded_at
                        ? format(new Date(reading.recorded_at), 'MMM dd, yyyy HH:mm')
                        : 'N/A'}
                    </TableCell>
                    <TableCell>{reading.notes || '-'}</TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => handleEdit(reading)} color="primary">
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" onClick={() => reading.id && handleDelete(reading.id)} color="error">
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
        <DialogTitle>{editingReading ? 'Edit Reading' : 'Create Reading'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="User ID (optional - leave blank for current user)"
              type="number"
              value={formData.user_id}
              onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
              margin="normal"
              helperText="Admin only: Enter user ID to create reading for another user"
            />
            <TextField
              fullWidth
              label="Systolic"
              type="number"
              value={formData.systolic}
              onChange={(e) => setFormData({ ...formData, systolic: e.target.value })}
              margin="normal"
              required
              inputProps={{ min: 50, max: 250 }}
            />
            <TextField
              fullWidth
              label="Diastolic"
              type="number"
              value={formData.diastolic}
              onChange={(e) => setFormData({ ...formData, diastolic: e.target.value })}
              margin="normal"
              required
              inputProps={{ min: 30, max: 200 }}
            />
            <TextField
              fullWidth
              label="Heart Rate (BPM)"
              type="number"
              value={formData.heart_rate}
              onChange={(e) => setFormData({ ...formData, heart_rate: e.target.value })}
              margin="normal"
              inputProps={{ min: 30, max: 200 }}
            />
            <TextField
              fullWidth
              label="Recorded At"
              type="datetime-local"
              value={formData.recorded_at}
              onChange={(e) => setFormData({ ...formData, recorded_at: e.target.value })}
              margin="normal"
              required
              InputLabelProps={{ shrink: true }}
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
            {editingReading ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default AdminReadings

