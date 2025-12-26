import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material'
import FavoriteIcon from '@mui/icons-material/Favorite'
import apiClient from '../config/axios'

const ResetPassword = () => {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!token) {
      setError('Invalid reset link. Please request a new password reset.')
    }
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!token) {
      setError('Invalid reset link. Please request a new password reset.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }

    setLoading(true)
    try {
      await apiClient.post('/api/auth/password-reset/confirm/', {
        token,
        password,
      })
      setSuccess(true)
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to reset password. Please try again.')
    } finally {
      setLoading(false)
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
      <Container component="main" maxWidth="xs">
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
              Reset Password
            </Typography>

            {success ? (
              <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
                Password reset successfully! Redirecting to login...
              </Alert>
            ) : (
              <>
                {error && (
                  <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                    {error}
                  </Alert>
                )}

                <form onSubmit={handleSubmit}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label="New Password"
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    helperText="Must be at least 8 characters"
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
                    name="confirmPassword"
                    label="Confirm New Password"
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                  />
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={loading || !token}
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
                    {loading ? 'Resetting...' : 'Reset Password'}
                  </Button>
                  <Box textAlign="center" mt={2}>
                    <Link to="/login" style={{ textDecoration: 'none' }}>
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
                        Back to Login
                      </Typography>
                    </Link>
                  </Box>
                </form>
              </>
            )}
          </Paper>
        </Box>

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

export default ResetPassword

