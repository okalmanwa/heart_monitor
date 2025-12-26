import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Box,
  Button,
  CircularProgress,
  useMediaQuery,
  useTheme,
  Typography,
  Card,
  CardContent,
  Grid,
  Tooltip,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import PrintIcon from '@mui/icons-material/Print'
import DownloadIcon from '@mui/icons-material/Download'
import FavoriteIcon from '@mui/icons-material/Favorite'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { BloodPressureReading } from '../types'
import apiClient from '../config/axios'
import { format } from 'date-fns'

interface ReadingsTableProps {
  readings: BloodPressureReading[]
  loading: boolean
  onReadingDeleted: (id: number) => void
  onExportPDF: () => void
}

const ReadingsTable: React.FC<ReadingsTableProps> = ({
  readings,
  loading,
  onReadingDeleted,
  onExportPDF,
}) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  
  const getCategoryInfo = (category?: string) => {
    switch (category) {
      case 'normal':
        return { 
          label: '✅ Normal', 
          color: '#4caf50', 
          bgColor: '#4caf5015',
          emoji: '✅',
          chipColor: 'success' as const
        }
      case 'elevated':
        return { 
          label: '⚠️ Elevated', 
          color: '#ff9800', 
          bgColor: '#ff980015',
          emoji: '⚠️',
          chipColor: 'warning' as const
        }
      case 'high_stage1':
        return { 
          label: '🔴 High Stage 1', 
          color: '#f44336', 
          bgColor: '#f4433615',
          emoji: '🔴',
          chipColor: 'error' as const
        }
      case 'high_stage2':
        return { 
          label: '🚨 High Stage 2', 
          color: '#d32f2f', 
          bgColor: '#d32f2f15',
          emoji: '🚨',
          chipColor: 'error' as const
        }
      default:
        return { 
          label: '❓ Unknown', 
          color: '#757575', 
          bgColor: '#75757515',
          emoji: '❓',
          chipColor: 'default' as const
        }
    }
  }

  // Calculate statistics
  const stats = readings.length > 0 ? {
    total: readings.length,
    normal: readings.filter(r => r.category === 'normal').length,
    normalPercentage: Math.round((readings.filter(r => r.category === 'normal').length / readings.length) * 100),
    avgSystolic: Math.round(readings.reduce((sum, r) => sum + r.systolic, 0) / readings.length),
    avgDiastolic: Math.round(readings.reduce((sum, r) => sum + r.diastolic, 0) / readings.length),
    withHeartRate: readings.filter(r => r.heart_rate).length,
  } : null

  const handleDelete = async (id: number) => {
    if (window.confirm('🗑️ Are you sure you want to delete this reading? This action cannot be undone.')) {
      try {
        await apiClient.delete(`/api/readings/${id}/`)
        onReadingDeleted(id)
      } catch (error) {
        console.error('Failed to delete reading:', error)
        alert('❌ Failed to delete reading. Please try again.')
      }
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" p={4}>
        <CircularProgress size={48} sx={{ mb: 2, color: '#667eea' }} />
        <Typography variant="body2" color="text.secondary">
          Loading your readings...
        </Typography>
      </Box>
    )
  }

  return (
    <Box>
      {/* Statistics Cards */}
      {stats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={3}>
            <Card 
              sx={{ 
                background: 'linear-gradient(135deg, #667eea15 0%, #764ba205 100%)',
                border: '2px solid #667eea40',
                borderRadius: 3,
                textAlign: 'center',
              }}
            >
              <CardContent sx={{ py: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#667eea', mb: 0.5 }}>
                  {stats.total}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  📊 Total Readings
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card 
              sx={{ 
                background: stats.normalPercentage >= 70 
                  ? 'linear-gradient(135deg, #4caf5015 0%, #4caf5005 100%)'
                  : 'linear-gradient(135deg, #ff980015 0%, #ff980005 100%)',
                border: `2px solid ${stats.normalPercentage >= 70 ? '#4caf5040' : '#ff980040'}`,
                borderRadius: 3,
                textAlign: 'center',
              }}
            >
              <CardContent sx={{ py: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: stats.normalPercentage >= 70 ? '#4caf50' : '#ff9800', mb: 0.5 }}>
                  {stats.normalPercentage}%
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  ✅ Normal
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card 
              sx={{ 
                background: 'linear-gradient(135deg, #e91e6315 0%, #ad145705 100%)',
                border: '2px solid #e91e6340',
                borderRadius: 3,
                textAlign: 'center',
              }}
            >
              <CardContent sx={{ py: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#e91e63', mb: 0.5 }}>
                  {stats.avgSystolic}/{stats.avgDiastolic}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  💓 Average BP
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card 
              sx={{ 
                background: 'linear-gradient(135deg, #2196f315 0%, #1565c005 100%)',
                border: '2px solid #2196f340',
                borderRadius: 3,
                textAlign: 'center',
              }}
            >
              <CardContent sx={{ py: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#2196f3', mb: 0.5 }}>
                  {stats.withHeartRate}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  💓 With Pulse
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Box 
        mb={2} 
        display="flex" 
        gap={2}
        flexDirection={{ xs: 'column', sm: 'row' }}
      >
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={onExportPDF}
          fullWidth={isMobile}
          size={isMobile ? 'small' : 'medium'}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
            '&:hover': {
              boxShadow: '0 6px 16px rgba(102, 126, 234, 0.5)',
              transform: 'translateY(-1px)',
            },
            transition: 'all 0.2s ease',
          }}
        >
          📥 Download PDF Report
        </Button>
        <Button
          variant="outlined"
          startIcon={<PrintIcon />}
          onClick={handlePrint}
          fullWidth={isMobile}
          size={isMobile ? 'small' : 'medium'}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            borderColor: '#667eea',
            color: '#667eea',
            '&:hover': {
              borderColor: '#764ba2',
              backgroundColor: 'rgba(102, 126, 234, 0.04)',
            },
          }}
        >
          🖨️ Print
        </Button>
      </Box>
      <TableContainer 
        sx={{ 
          overflowX: 'auto',
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'rgba(102, 126, 234, 0.05)' }}>
              <TableCell sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' }, fontWeight: 700 }}>
                📅 Date & Time
              </TableCell>
              <TableCell align="right" sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' }, fontWeight: 700 }}>
                📈 Systolic
              </TableCell>
              <TableCell align="right" sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' }, fontWeight: 700 }}>
                📉 Diastolic
              </TableCell>
              <TableCell align="right" sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' }, fontWeight: 700, display: { xs: 'none', md: 'table-cell' } }}>
                💓 Heart Rate
              </TableCell>
              <TableCell sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' }, fontWeight: 700 }}>
                🏷️ Status
              </TableCell>
              <TableCell sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' }, fontWeight: 700, display: { xs: 'none', lg: 'table-cell' } }}>
                📝 Notes
              </TableCell>
              <TableCell align="right" sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' }, fontWeight: 700 }}>
                ⚙️ Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {readings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <Box>
                    <FavoriteIcon sx={{ fontSize: 64, color: '#667eea', mb: 2, opacity: 0.5 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: '#333' }}>
                      📊 No Readings Yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Start tracking your blood pressure to see your health journey!
                    </Typography>
                    <Chip 
                      label="💡 Add your first reading above"
                      sx={{ 
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        color: '#667eea',
                        fontWeight: 600,
                      }}
                    />
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              readings.map((reading) => {
                const categoryInfo = getCategoryInfo(reading.category)
                return (
                  <TableRow 
                    key={reading.id}
                    sx={{
                      '&:hover': {
                        backgroundColor: categoryInfo.bgColor,
                      },
                      transition: 'background-color 0.2s ease',
                    }}
                  >
                    <TableCell sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' }, fontWeight: 500 }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {reading.recorded_at
                            ? format(new Date(reading.recorded_at), 'MMM dd, yyyy')
                            : 'N/A'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {reading.recorded_at
                            ? format(new Date(reading.recorded_at), 'h:mm a')
                            : ''}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' }, fontWeight: 700 }}>
                      {reading.systolic}
                    </TableCell>
                    <TableCell align="right" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' }, fontWeight: 700 }}>
                      {reading.diastolic}
                    </TableCell>
                    <TableCell align="right" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' }, display: { xs: 'none', md: 'table-cell' } }}>
                      {reading.heart_rate ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                          <FavoriteIcon sx={{ fontSize: '0.875rem', color: '#e91e63' }} />
                          <Typography sx={{ fontWeight: 600, color: '#e91e63' }}>
                            {reading.heart_rate}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="caption" color="text.secondary">—</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={categoryInfo.label}
                        size="small"
                        sx={{ 
                          fontSize: { xs: '0.7rem', sm: '0.8rem' },
                          fontWeight: 600,
                          backgroundColor: categoryInfo.bgColor,
                          color: categoryInfo.color,
                          border: `1px solid ${categoryInfo.color}40`,
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, display: { xs: 'none', lg: 'table-cell' }, maxWidth: 200 }}>
                      <Tooltip title={reading.notes || 'No notes'} arrow>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            color: reading.notes ? 'text.primary' : 'text.secondary',
                            fontStyle: reading.notes ? 'normal' : 'italic',
                          }}
                        >
                          {reading.notes || '—'}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Delete reading" arrow>
                        <IconButton
                          size="small"
                          onClick={() => reading.id && handleDelete(reading.id)}
                          sx={{
                            color: '#f44336',
                            '&:hover': {
                              backgroundColor: '#f4433615',
                            },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

export default ReadingsTable

