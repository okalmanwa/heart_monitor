import { useState, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  MenuItem,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import apiClient from '../../config/axios'
import { BloodPressureReading, User } from '../../types'
import { format } from 'date-fns'

interface AdminReadingsProps {
  onUpdate?: () => void
}

const AdminReadings: React.FC<AdminReadingsProps> = ({ onUpdate }) => {
  const [readings, setReadings] = useState<BloodPressureReading[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [editingReading, setEditingReading] = useState<BloodPressureReading | null>(null)
  const [formData, setFormData] = useState({
    user: '',
    systolic: '',
    diastolic: '',
    heart_rate: '',
    recorded_at: '',
    notes: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchReadings()
    fetchUsers()
  }, [])

  const fetchReadings = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get('/api/readings/')
      setReadings(response.data.results || response.data || [])
    } catch (error: any) {
      console.error('Failed to fetch readings:', error)
      setError('Failed to load readings')
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await apiClient.get('/api/auth/users/')
      setUsers(response.data.results || response.data || [])
    } catch (error) {
      console.error('Failed to fetch users:', error)
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

  const getCategoryLabel = (reading: BloodPressureReading) => {
    const systolic = reading.systolic
    const diastolic = reading.diastolic
    if (systolic < 120 && diastolic < 80) return 'Normal'
    if (systolic < 130 && diastolic < 80) return 'Elevated'
    if (systolic < 140 || diastolic < 90) return 'High Stage 1'
    return 'High Stage 2'
  }

  const handleOpenDialog = (reading?: BloodPressureReading) => {
    if (reading) {
      setEditingReading(reading)
      setFormData({
        user: reading.user?.toString() || '',
        systolic: reading.systolic.toString(),
        diastolic: reading.diastolic.toString(),
        heart_rate: reading.heart_rate?.toString() || '',
        recorded_at: reading.recorded_at ? new Date(reading.recorded_at).toISOString().slice(0, 16) : '',
        notes: reading.notes || '',
      })
    } else {
      setEditingReading(null)
      setFormData({
        user: '',
        systolic: '',
        diastolic: '',
        heart_rate: '',
        recorded_at: new Date().toISOString().slice(0, 16),
        notes: '',
      })
    }
    setOpenDialog(true)
    setError('')
    setSuccess('')
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingReading(null)
    setFormData({
      user: '',
      systolic: '',
      diastolic: '',
      heart_rate: '',
      recorded_at: '',
      notes: '',
    })
  }

  const handleSubmit = async () => {
    try {
      setError('')
      setSuccess('')

      const data = {
        user: parseInt(formData.user),
        systolic: parseInt(formData.systolic),
        diastolic: parseInt(formData.diastolic),
        heart_rate: formData.heart_rate ? parseInt(formData.heart_rate) : null,
        recorded_at: new Date(formData.recorded_at).toISOString(),
        notes: formData.notes,
      }

      if (editingReading?.id) {
        await apiClient.put(`/api/readings/${editingReading.id}/`, data)
        setSuccess('Reading updated successfully!')
      } else {
        await apiClient.post('/api/readings/', data)
        setSuccess('Reading created successfully!')
      }

      setTimeout(() => {
        handleCloseDialog()
        fetchReadings()
        onUpdate?.()
      }, 1000)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save reading')
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this reading?')) {
      return
    }

    try {
      await apiClient.delete(`/api/readings/${id}/`)
      fetchReadings()
      onUpdate?.()
    } catch (error) {
      console.error('Failed to delete reading:', error)
      alert('Failed to delete reading')
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Blood Pressure Readings Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Reading
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Patient</TableCell>
              <TableCell align="right">Systolic</TableCell>
              <TableCell align="right">Diastolic</TableCell>
              <TableCell align="right">Heart Rate</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Date</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {readings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No readings found
                </TableCell>
              </TableRow>
            ) : (
              readings.map((reading) => (
                <TableRow key={reading.id}>
                  <TableCell>
                    {(reading as any).user_email || 'N/A'}
                  </TableCell>
                  <TableCell align="right">{reading.systolic}</TableCell>
                  <TableCell align="right">{reading.diastolic}</TableCell>
                  <TableCell align="right">
                    {reading.heart_rate || '-'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getCategoryLabel(reading)}
                      color={getCategoryColor((reading as any).category) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {reading.recorded_at
                      ? format(new Date(reading.recorded_at), 'MMM dd, yyyy HH:mm')
                      : '-'}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(reading)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => reading.id && handleDelete(reading.id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingReading ? 'Edit Reading' : 'Create Reading'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              select
              label="Patient"
              value={formData.user}
              onChange={(e) => setFormData({ ...formData, user: e.target.value })}
              fullWidth
              required
            >
              {users.map((user) => (
                <MenuItem key={user.id} value={user.id.toString()}>
                  {user.email}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Systolic"
              type="number"
              value={formData.systolic}
              onChange={(e) => setFormData({ ...formData, systolic: e.target.value })}
              fullWidth
              required
              inputProps={{ min: 50, max: 250 }}
            />
            <TextField
              label="Diastolic"
              type="number"
              value={formData.diastolic}
              onChange={(e) => setFormData({ ...formData, diastolic: e.target.value })}
              fullWidth
              required
              inputProps={{ min: 30, max: 200 }}
            />
            <TextField
              label="Heart Rate (BPM)"
              type="number"
              value={formData.heart_rate}
              onChange={(e) => setFormData({ ...formData, heart_rate: e.target.value })}
              fullWidth
              inputProps={{ min: 30, max: 200 }}
            />
            <TextField
              label="Recorded At"
              type="datetime-local"
              value={formData.recorded_at}
              onChange={(e) => setFormData({ ...formData, recorded_at: e.target.value })}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Notes"
              multiline
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingReading ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default AdminReadings

