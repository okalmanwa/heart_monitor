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
  MenuItem,
  Slider,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import apiClient from '../../config/axios'
import { HealthFactor, User } from '../../types'
import { format } from 'date-fns'

interface AdminHealthFactorsProps {
  onUpdate?: () => void
}

const AdminHealthFactors: React.FC<AdminHealthFactorsProps> = ({ onUpdate }) => {
  const [factors, setFactors] = useState<HealthFactor[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [editingFactor, setEditingFactor] = useState<HealthFactor | null>(null)
  const [formData, setFormData] = useState({
    user: '',
    date: '',
    sleep_quality: 3,
    stress_level: 3,
    exercise_duration: '',
    notes: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchFactors()
    fetchUsers()
  }, [])

  const fetchFactors = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get('/api/health-factors/')
      setFactors(response.data.results || response.data || [])
    } catch (error: any) {
      console.error('Failed to fetch health factors:', error)
      setError('Failed to load health factors')
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

  const handleOpenDialog = (factor?: HealthFactor) => {
    if (factor) {
      setEditingFactor(factor)
      setFormData({
        user: (factor as any).user?.toString() || '',
        date: factor.date ? new Date(factor.date).toISOString().split('T')[0] : '',
        sleep_quality: factor.sleep_quality || 3,
        stress_level: factor.stress_level || 3,
        exercise_duration: factor.exercise_duration?.toString() || '',
        notes: factor.notes || '',
      })
    } else {
      setEditingFactor(null)
      setFormData({
        user: '',
        date: new Date().toISOString().split('T')[0],
        sleep_quality: 3,
        stress_level: 3,
        exercise_duration: '',
        notes: '',
      })
    }
    setOpenDialog(true)
    setError('')
    setSuccess('')
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingFactor(null)
    setFormData({
      user: '',
      date: '',
      sleep_quality: 3,
      stress_level: 3,
      exercise_duration: '',
      notes: '',
    })
  }

  const handleSubmit = async () => {
    try {
      setError('')
      setSuccess('')

      const data = {
        user: parseInt(formData.user),
        date: formData.date,
        sleep_quality: formData.sleep_quality || null,
        stress_level: formData.stress_level || null,
        exercise_duration: formData.exercise_duration ? parseInt(formData.exercise_duration) : null,
        notes: formData.notes,
      }

      if (editingFactor?.id) {
        await apiClient.put(`/api/health-factors/${editingFactor.id}/`, data)
        setSuccess('Health factor updated successfully!')
      } else {
        await apiClient.post('/api/health-factors/', data)
        setSuccess('Health factor created successfully!')
      }

      setTimeout(() => {
        handleCloseDialog()
        fetchFactors()
        onUpdate?.()
      }, 1000)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save health factor')
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this health factor?')) {
      return
    }

    try {
      await apiClient.delete(`/api/health-factors/${id}/`)
      fetchFactors()
      onUpdate?.()
    } catch (error) {
      console.error('Failed to delete health factor:', error)
      alert('Failed to delete health factor')
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
        <Typography variant="h6">Health Factors Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Health Factor
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
              <TableCell>Date</TableCell>
              <TableCell align="center">Sleep Quality</TableCell>
              <TableCell align="center">Stress Level</TableCell>
              <TableCell align="right">Exercise (min)</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {factors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No health factors found
                </TableCell>
              </TableRow>
            ) : (
              factors.map((factor) => (
                <TableRow key={factor.id}>
                  <TableCell>
                    {(factor as any).user_email || 'N/A'}
                  </TableCell>
                  <TableCell>
                    {factor.date
                      ? format(new Date(factor.date), 'MMM dd, yyyy')
                      : '-'}
                  </TableCell>
                  <TableCell align="center">
                    {factor.sleep_quality ? `${factor.sleep_quality}/5` : '-'}
                  </TableCell>
                  <TableCell align="center">
                    {factor.stress_level ? `${factor.stress_level}/5` : '-'}
                  </TableCell>
                  <TableCell align="right">
                    {factor.exercise_duration ? `${factor.exercise_duration} min` : '-'}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(factor)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => factor.id && handleDelete(factor.id)}
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
          {editingFactor ? 'Edit Health Factor' : 'Create Health Factor'}
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
              label="Date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />
            <Box>
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
            <Box>
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
              label="Exercise Duration (minutes)"
              type="number"
              value={formData.exercise_duration}
              onChange={(e) => setFormData({ ...formData, exercise_duration: e.target.value })}
              fullWidth
              inputProps={{ min: 0 }}
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
            {editingFactor ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default AdminHealthFactors

