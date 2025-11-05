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
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import { User } from '../../types'
import apiClient from '../../config/axios'

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await apiClient.get('/api/auth/admin/users/')
      setUsers(response.data || [])
      setError('')
    } catch (err: any) {
      console.error('Error fetching users:', err)
      if (err.response?.status === 403) {
        setError('You do not have permission to view users. Make sure you are logged in as an admin.')
      } else {
        setError('Failed to fetch users')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingUser(null)
    setFormData({ username: '', email: '', first_name: '', last_name: '', password: '' })
    setOpen(true)
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setFormData({
      username: user.username,
      email: user.email,
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      password: '',
    })
    setOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this user? This will also delete all their readings and health data.')) return
    
    try {
      await apiClient.delete(`/api/auth/admin/users/${id}/delete/`)
      setSuccess('User deleted successfully!')
      fetchUsers()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError('You do not have permission to delete users')
      } else {
        setError(err.response?.data?.error || 'Failed to delete user')
      }
    }
  }

  const handleSubmit = async () => {
    try {
      if (editingUser) {
        // Update user
        await apiClient.put(`/api/auth/profile/update/`, formData)
        setSuccess('User updated successfully!')
      } else {
        // Create user
        await apiClient.post('/api/auth/register/', {
          ...formData,
          password2: formData.password,
        })
        setSuccess('User created successfully!')
      }
      setOpen(false)
      fetchUsers()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save user')
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
        <Typography variant="h6">Users Management</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
          Add User
        </Button>
      </Box>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Email</TableCell>
                <TableCell>Username</TableCell>
                <TableCell>Full Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography color="text.secondary" sx={{ py: 3 }}>
                      No users found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{`${user.first_name} ${user.last_name}`.trim() || '-'}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.email.includes('@patient.example.com') ? 'Patient' : 'User'}
                        size="small"
                        color={user.email.includes('@patient.example.com') ? 'primary' : 'default'}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => handleEdit(user)} color="primary">
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" onClick={() => user.id && handleDelete(user.id)} color="error">
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
        <DialogTitle>{editingUser ? 'Edit User' : 'Create User'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="First Name"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Last Name"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label={editingUser ? 'New Password (leave blank to keep current)' : 'Password'}
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              margin="normal"
              required={!editingUser}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingUser ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default AdminUsers

