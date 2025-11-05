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
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import PrintIcon from '@mui/icons-material/Print'
import DownloadIcon from '@mui/icons-material/Download'
import { BloodPressureReading } from '../types'
import axios from 'axios'
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
        await axios.delete(`/api/readings/${id}/`)
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
      <Box mb={2} display="flex" gap={2}>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={onExportPDF}
        >
          Download PDF
        </Button>
        <Button
          variant="outlined"
          startIcon={<PrintIcon />}
          onClick={handlePrint}
        >
          Print
        </Button>
      </Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date & Time</TableCell>
              <TableCell align="right">Systolic</TableCell>
              <TableCell align="right">Diastolic</TableCell>
              <TableCell align="right">Heart Rate</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Notes</TableCell>
              <TableCell align="right">Actions</TableCell>
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
                  <TableCell>
                    {reading.recorded_at
                      ? format(new Date(reading.recorded_at), 'MMM dd, yyyy HH:mm')
                      : 'N/A'}
                  </TableCell>
                  <TableCell align="right">{reading.systolic}</TableCell>
                  <TableCell align="right">{reading.diastolic}</TableCell>
                  <TableCell align="right">
                    {reading.heart_rate || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getCategoryLabel(reading.category)}
                      color={getCategoryColor(reading.category) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{reading.notes || '-'}</TableCell>
                  <TableCell align="right">
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
    </Box>
  )
}

export default ReadingsTable

