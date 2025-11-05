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
  Checkbox,
  FormControlLabel,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import apiClient from '../../config/axios'
import { UserInsight, User } from '../../types'
import { format } from 'date-fns'

interface AdminInsightsProps {
  onUpdate?: () => void
}

const AdminInsights: React.FC<AdminInsightsProps> = ({ onUpdate }) => {
  const [insights, setInsights] = useState<UserInsight[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [editingInsight, setEditingInsight] = useState<UserInsight | null>(null)
  const [formData, setFormData] = useState({
    user: '',
    insight_text: '',
    insight_type: 'trend' as 'trend' | 'anomaly' | 'correlation' | 'alert',
    severity: 'low' as 'low' | 'medium' | 'high',
    is_read: false,
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchInsights()
    fetchUsers()
  }, [])

  const fetchInsights = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get('/api/insights/')
      setInsights(response.data.results || response.data || [])
    } catch (error: any) {
      console.error('Failed to fetch insights:', error)
      setError('Failed to load insights')
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'trend': return 'primary'
      case 'anomaly': return 'warning'
      case 'correlation': return 'secondary'
      case 'alert': return 'error'
      default: return 'default'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'success'
      case 'medium': return 'warning'
      case 'high': return 'error'
      default: return 'default'
    }
  }

  const handleOpenDialog = (insight?: UserInsight) => {
    if (insight) {
      setEditingInsight(insight)
      setFormData({
        user: (insight as any).user?.toString() || '',
        insight_text: insight.insight_text,
        insight_type: insight.insight_type,
        severity: insight.severity,
        is_read: insight.is_read,
      })
    } else {
      setEditingInsight(null)
      setFormData({
        user: '',
        insight_text: '',
        insight_type: 'trend',
        severity: 'low',
        is_read: false,
      })
    }
    setOpenDialog(true)
    setError('')
    setSuccess('')
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingInsight(null)
    setFormData({
      user: '',
      insight_text: '',
      insight_type: 'trend',
      severity: 'low',
      is_read: false,
    })
  }

  const handleSubmit = async () => {
    try {
      setError('')
      setSuccess('')

      const data = {
        user: parseInt(formData.user),
        insight_text: formData.insight_text,
        insight_type: formData.insight_type,
        severity: formData.severity,
        is_read: formData.is_read,
      }

      if (editingInsight?.id) {
        await apiClient.put(`/api/insights/${editingInsight.id}/`, data)
        setSuccess('Insight updated successfully!')
      } else {
        await apiClient.post('/api/insights/', data)
        setSuccess('Insight created successfully!')
      }

      setTimeout(() => {
        handleCloseDialog()
        fetchInsights()
        onUpdate?.()
      }, 1000)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save insight')
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this insight?')) {
      return
    }

    try {
      await apiClient.delete(`/api/insights/${id}/`)
      fetchInsights()
      onUpdate?.()
    } catch (error) {
      console.error('Failed to delete insight:', error)
      alert('Failed to delete insight')
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
        <Typography variant="h6">Insights Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Insight
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
              <TableCell>Type</TableCell>
              <TableCell>Severity</TableCell>
              <TableCell>Insight</TableCell>
              <TableCell>Read</TableCell>
              <TableCell>Generated</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {insights.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No insights found
                </TableCell>
              </TableRow>
            ) : (
              insights.map((insight) => (
                <TableRow key={insight.id}>
                  <TableCell>
                    {(insight as any).user_email || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={insight.insight_type}
                      color={getTypeColor(insight.insight_type)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={insight.severity}
                      color={getSeverityColor(insight.severity)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {insight.insight_text.length > 50
                      ? `${insight.insight_text.substring(0, 50)}...`
                      : insight.insight_text}
                  </TableCell>
                  <TableCell>
                    {insight.is_read ? 'Yes' : 'No'}
                  </TableCell>
                  <TableCell>
                    {format(new Date(insight.generated_at), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(insight)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(insight.id)}
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
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingInsight ? 'Edit Insight' : 'Create Insight'}
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
              select
              label="Insight Type"
              value={formData.insight_type}
              onChange={(e) => setFormData({ ...formData, insight_type: e.target.value as any })}
              fullWidth
              required
            >
              <MenuItem value="trend">Trend</MenuItem>
              <MenuItem value="anomaly">Anomaly</MenuItem>
              <MenuItem value="correlation">Correlation</MenuItem>
              <MenuItem value="alert">Alert</MenuItem>
            </TextField>
            <TextField
              select
              label="Severity"
              value={formData.severity}
              onChange={(e) => setFormData({ ...formData, severity: e.target.value as any })}
              fullWidth
              required
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
            </TextField>
            <TextField
              label="Insight Text"
              multiline
              rows={4}
              value={formData.insight_text}
              onChange={(e) => setFormData({ ...formData, insight_text: e.target.value })}
              fullWidth
              required
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.is_read}
                  onChange={(e) => setFormData({ ...formData, is_read: e.target.checked })}
                />
              }
              label="Mark as Read"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingInsight ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default AdminInsights

