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
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import PrintIcon from '@mui/icons-material/Print'
import DownloadIcon from '@mui/icons-material/Download'
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
  
  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'normal':
        return 'success'
      case 'elevated':
        return 'warning'
      case 'high_stage1':
        return 'error'
      case 'high_stage2':
        return 'error'
      default:
        return 'default'
    }
  }

  const getCategoryLabel = (category?: string) => {
    switch (category) {
      case 'normal':
        return 'Normal'
      case 'elevated':
        return 'Elevated'
      case 'high_stage1':
        return 'High Stage 1'
      case 'high_stage2':
        return 'High Stage 2'
      default:
        return 'Unknown'
    }
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this reading?')) {
      try {
        await apiClient.delete(`/api/readings/${id}/`)
        onReadingDeleted(id)
      } catch (error) {
        console.error('Failed to delete reading:', error)
        alert('Failed to delete reading. Please try again.')
      }
    }
  }

  const handlePrint = () => {
    window.print()
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
      <Box 
        mb={2} 
        display="flex" 
        gap={2}
        flexDirection={{ xs: 'column', sm: 'row' }}
      >
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={onExportPDF}
          fullWidth={isMobile}
          size={isMobile ? 'small' : 'medium'}
        >
          Download PDF
        </Button>
        <Button
          variant="outlined"
          startIcon={<PrintIcon />}
          onClick={handlePrint}
          fullWidth={isMobile}
          size={isMobile ? 'small' : 'medium'}
        >
          Print
        </Button>
      </Box>
      <TableContainer sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Date & Time</TableCell>
              <TableCell align="right" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Systolic</TableCell>
              <TableCell align="right" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Diastolic</TableCell>
              <TableCell align="right" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, display: { xs: 'none', md: 'table-cell' } }}>Heart Rate</TableCell>
              <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Category</TableCell>
              <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, display: { xs: 'none', lg: 'table-cell' } }}>Notes</TableCell>
              <TableCell align="right" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {readings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No readings yet. Add your first reading above!
                </TableCell>
              </TableRow>
            ) : (
              readings.map((reading) => (
                <TableRow key={reading.id}>
                  <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    {reading.recorded_at
                      ? format(new Date(reading.recorded_at), 'MMM dd, yyyy HH:mm')
                      : 'N/A'}
                  </TableCell>
                  <TableCell align="right" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{reading.systolic}</TableCell>
                  <TableCell align="right" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{reading.diastolic}</TableCell>
                  <TableCell align="right" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, display: { xs: 'none', md: 'table-cell' } }}>
                    {reading.heart_rate || 'N/A'}
                  </TableCell>
                  <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    <Chip
                      label={getCategoryLabel(reading.category)}
                      color={getCategoryColor(reading.category) as any}
                      size="small"
                      sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, display: { xs: 'none', lg: 'table-cell' } }}>
                    {reading.notes || '-'}
                  </TableCell>
                  <TableCell align="right" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    <IconButton
                      size="small"
                      onClick={() => reading.id && handleDelete(reading.id)}
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

export default ReadingsTable

