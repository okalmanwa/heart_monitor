import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Box,
  CircularProgress,
  Typography,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import { HealthFactor } from '../types'
import apiClient from '../config/axios'
import { format } from 'date-fns'

interface HealthFactorsTableProps {
  factors: HealthFactor[]
  loading: boolean
  onFactorDeleted: (id: number) => void
}

const HealthFactorsTable: React.FC<HealthFactorsTableProps> = ({
  factors,
  loading,
  onFactorDeleted,
}) => {
  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this health factor entry?')) {
      try {
        await apiClient.delete(`/api/health-factors/${id}/`)
        onFactorDeleted(id)
      } catch (error) {
        console.error('Failed to delete health factor:', error)
        alert('Failed to delete health factor. Please try again.')
      }
    }
  }

  const renderValue = (value: number | null | undefined, suffix: string = '') => {
    return value !== null && value !== undefined ? `${value}${suffix}` : '-'
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
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell align="center">Sleep Quality</TableCell>
              <TableCell align="center">Stress Level</TableCell>
              <TableCell align="right">Exercise (min)</TableCell>
              <TableCell>Notes</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {factors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No health factors tracked yet. Add your first entry above!
                </TableCell>
              </TableRow>
            ) : (
              factors.map((factor) => (
                <TableRow key={factor.id}>
                  <TableCell>
                    {factor.date
                      ? format(new Date(factor.date), 'MMM dd, yyyy')
                      : 'N/A'}
                  </TableCell>
                  <TableCell align="center">
                    {renderValue(factor.sleep_quality, '/5')}
                  </TableCell>
                  <TableCell align="center">
                    {renderValue(factor.stress_level, '/5')}
                  </TableCell>
                  <TableCell align="right">
                    {renderValue(factor.exercise_duration, ' min')}
                  </TableCell>
                  <TableCell>{factor.notes || '-'}</TableCell>
                  <TableCell align="right">
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
    </Box>
  )
}

export default HealthFactorsTable

