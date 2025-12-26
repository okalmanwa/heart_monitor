import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import FavoriteIcon from '@mui/icons-material/Favorite'
import { useAuth } from '../contexts/AuthContext'
import apiClient from '../config/axios'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const [resetMessage, setResetMessage] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setResetMessage('')
    setResetLoading(true)
    try {
      const response = await apiClient.post('/api/auth/password-reset/request/', {
        email: resetEmail,
      })
      
      let message = response.data.message || 'If an account exists with this email, a password reset link has been sent.'
      
      // In development, show the reset link if provided
      if (response.data.dev_reset_link) {
        message = `${response.data.dev_message}\n\nReset Link: ${response.data.dev_reset_link}`
      }
      
      setResetMessage(message)
      
      // If dev link provided, keep dialog open longer so user can copy link
      const timeout = response.data.dev_reset_link ? 10000 : 3000
      setTimeout(() => {
        setForgotPasswordOpen(false)
        setResetEmail('')
        setResetMessage('')
      }, timeout)
    } catch (err: any) {
      setResetMessage(err.response?.data?.error || 'Failed to send reset email. Please try again.')
    } finally {
      setResetLoading(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: { xs: 4, sm: 6 },
        px: { xs: 2, sm: 3 },
      }}
    >
      <Container 
        component="main" 
        maxWidth="xs"
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Box
            sx={{
              mb: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
            }}
          >
            <Box
              sx={{
                width: { xs: 56, sm: 64 },
                height: { xs: 56, sm: 64 },
                borderRadius: 2,
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              }}
            >
              <FavoriteIcon sx={{ color: 'white', fontSize: { xs: '2rem', sm: '2.5rem' } }} />
            </Box>
            <Typography 
              component="h1" 
              variant="h4" 
              sx={{ 
                color: 'white',
                fontWeight: 700,
                fontSize: { xs: '1.75rem', sm: '2.125rem' },
                textShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
              }}
            >
              Cardiac Monitor
            </Typography>
          </Box>
          
          <Paper 
            elevation={24}
            sx={{ 
              padding: { xs: 3, sm: 4 }, 
              width: '100%',
              borderRadius: 3,
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            }}
          >
            <Typography 
              component="h2" 
              variant="h5" 
              gutterBottom
              sx={{ 
                fontSize: { xs: '1.5rem', sm: '1.75rem' },
                fontWeight: 700,
                mb: 3,
                textAlign: 'center',
                color: 'text.primary',
              }}
            >
              Welcome Back
            </Typography>
            
            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 2,
                  borderRadius: 2,
                }}
              >
                {error}
              </Alert>
            )}
            
            <form onSubmit={handleSubmit}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
              <Box textAlign="right" mt={1}>
                <Typography
                  variant="body2"
                  onClick={() => setForgotPasswordOpen(true)}
                  sx={{
                    color: 'primary.main',
                    fontWeight: 500,
                    cursor: 'pointer',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Forgot Password?
                </Typography>
              </Box>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{ 
                  mt: 3, 
                  mb: 2,
                  py: 1.5,
                  borderRadius: 2,
                  fontSize: '1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                  '&:hover': {
                    boxShadow: '0 6px 16px rgba(102, 126, 234, 0.5)',
                    transform: 'translateY(-1px)',
                  },
                  '&:disabled': {
                    background: 'rgba(102, 126, 234, 0.5)',
                  },
                  transition: 'all 0.2s ease',
                }}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
              <Box textAlign="center" mt={2}>
                <Link to="/register" style={{ textDecoration: 'none' }}>
                  <Typography 
                    variant="body2" 
                    sx={{
                      color: 'primary.main',
                      fontWeight: 500,
                      '&:hover': {
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    Don't have an account? Sign Up
                  </Typography>
                </Link>
              </Box>
            </form>
          </Paper>
        </Box>

        {/* Forgot Password Dialog */}
        <Dialog
          open={forgotPasswordOpen}
          onClose={() => {
            setForgotPasswordOpen(false)
            setResetEmail('')
            setResetMessage('')
          }}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ fontWeight: 600 }}>Forgot Password</DialogTitle>
          <form onSubmit={handleForgotPassword}>
            <DialogContent>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Enter your email address and we'll send you a link to reset your password.
              </Typography>
              {resetMessage && (
                <Alert
                  severity={resetMessage.includes('sent') ? 'success' : 'error'}
                  sx={{ mb: 2, borderRadius: 2 }}
                >
                  {resetMessage}
                </Alert>
              )}
              <TextField
                autoFocus
                margin="dense"
                label="Email Address"
                type="email"
                fullWidth
                variant="outlined"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button
                onClick={() => {
                  setForgotPasswordOpen(false)
                  setResetEmail('')
                  setResetMessage('')
                }}
                disabled={resetLoading}
                sx={{ textTransform: 'none' }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={resetLoading}
                sx={{
                  textTransform: 'none',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  },
                }}
                startIcon={resetLoading ? <CircularProgress size={20} color="inherit" /> : null}
              >
                {resetLoading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
        
        {/* Footer */}
        <Box
          component="footer"
          sx={{
            mt: 5,
            py: 3,
            textAlign: 'center',
          }}
        >
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'rgba(255, 255, 255, 0.75)',
              fontSize: '0.875rem',
              fontWeight: 400,
              letterSpacing: '0.01em',
            }}
          >
            © {new Date().getFullYear()} Tyronne. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  )
}

export default Login