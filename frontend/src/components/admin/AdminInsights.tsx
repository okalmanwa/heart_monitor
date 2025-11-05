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
  Checkbox,
  FormControlLabel,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import { UserInsight } from '../../types'
import apiClient from '../../config/axios'
import { format } from 'date-fns'

const AdminInsights = () => {
  const [insights, setInsights] = useState<UserInsight[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editingInsight, setEditingInsight] = useState<UserInsight | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState({
    user_id: '',
    insight_text: '',
    insight_type: 'trend',
    severity: 'low',
    is_read: false,
  })

  useEffect(() => {
    fetchInsights()
  }, [])

  const fetchInsights = async () => {
    try {
      const response = await apiClient.get('/api/admin/insights/')
      setInsights(response.data.results || response.data || [])
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError('You do not have permission to view insights. Make sure you are logged in as an admin.')
      } else {
        setError('Failed to fetch insights')
      }
    } finally {
      setLoading(false)
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

  const handleCreate = () => {
    setEditingInsight(null)
    setFormData({
      user_id: '',
      insight_text: '',
      insight_type: 'trend',
      severity: 'low',
      is_read: false,
    })
    setOpen(true)
  }

  const handleEdit = (insight: UserInsight) => {
    setEditingInsight(insight)
    setFormData({
      insight_text: insight.insight_text,
      insight_type: insight.insight_type,
      severity: insight.severity,
      is_read: insight.is_read,
    })
    setOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this insight?')) return
    
    try {
      await apiClient.delete(`/api/admin/insights/${id}/`)
      setSuccess('Insight deleted successfully!')
      fetchInsights()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError('You do not have permission to delete insights')
      } else {
        setError('Failed to delete insight')
      }
    }
  }

  const handleSubmit = async () => {
    try {
      const data: any = { ...formData }
      if (formData.user_id) {
        data.user_id = parseInt(formData.user_id)
      }
      
      if (editingInsight && editingInsight.id) {
        await apiClient.put(`/api/admin/insights/${editingInsight.id}/`, data)
        setSuccess('Insight updated successfully!')
      } else {
        if (!formData.user_id) {
          setError('User ID is required to create an insight')
          return
        }
        await apiClient.post('/api/admin/insights/', data)
        setSuccess('Insight created successfully!')
      }
      setOpen(false)
      fetchInsights()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save insight')
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
        <Typography variant="h6">Insights</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
          Add Insight
        </Button>
      </Box>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Severity</TableCell>
                <TableCell>Insight</TableCell>
                <TableCell>Read</TableCell>
                <TableCell>Generated At</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {insights.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography color="text.secondary" sx={{ py: 3 }}>
                      No insights found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                insights.map((insight) => (
                  <TableRow key={insight.id}>
                    <TableCell>{(insight as any).user_email || insight.user || 'N/A'}</TableCell>
                    <TableCell>
                      <Chip
                        label={insight.insight_type}
                        size="small"
                        color={getTypeColor(insight.insight_type) as any}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={insight.severity}
                        size="small"
                        color={getSeverityColor(insight.severity) as any}
                      />
                    </TableCell>
                    <TableCell>
                      {insight.insight_text.length > 50
                        ? `${insight.insight_text.substring(0, 50)}...`
                        : insight.insight_text}
                    </TableCell>
                    <TableCell>{insight.is_read ? 'Yes' : 'No'}</TableCell>
                    <TableCell>
                      {insight.generated_at
                        ? format(new Date(insight.generated_at), 'MMM dd, yyyy')
                        : 'N/A'}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => handleEdit(insight)} color="primary">
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" onClick={() => insight.id && handleDelete(insight.id)} color="error">
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

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingInsight ? 'Edit Insight' : 'Create Insight'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="User ID"
              type="number"
              value={formData.user_id}
              onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
              margin="normal"
              required={!editingInsight}
              helperText="Enter user ID for this insight"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Type</InputLabel>
              <Select
                value={formData.insight_type}
                onChange={(e) => setFormData({ ...formData, insight_type: e.target.value })}
                label="Type"
              >
                <MenuItem value="trend">Trend</MenuItem>
                <MenuItem value="anomaly">Anomaly</MenuItem>
                <MenuItem value="correlation">Correlation</MenuItem>
                <MenuItem value="alert">Alert</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>Severity</InputLabel>
              <Select
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                label="Severity"
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Insight Text"
              multiline
              rows={4}
              value={formData.insight_text}
              onChange={(e) => setFormData({ ...formData, insight_text: e.target.value })}
              margin="normal"
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
              sx={{ mt: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingInsight ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default AdminInsights

