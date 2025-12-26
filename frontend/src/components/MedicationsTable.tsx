import { useState } from 'react'
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
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { Medication, MedicationLog } from '../types'
import apiClient from '../config/axios'
import { format } from 'date-fns'

interface MedicationsTableProps {
  medications: Medication[]
  loading: boolean
  onMedicationDeleted: (id: number) => void
  onMedicationUpdated?: (medication: Medication) => void
  onEdit?: (medication: Medication) => void
}

const MedicationsTable: React.FC<MedicationsTableProps> = ({
  medications,
  loading,
  onMedicationDeleted,
  onMedicationUpdated,
  onEdit,
}) => {
  const [logDialogOpen, setLogDialogOpen] = useState(false)
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null)
  const [logNotes, setLogNotes] = useState('')

  const frequencyLabels: Record<Medication['frequency'], string> = {
    once_daily: 'Once Daily',
    twice_daily: 'Twice Daily',
    three_times_daily: 'Three Times Daily',
    four_times_daily: 'Four Times Daily',
    as_needed: 'As Needed',
    weekly: 'Weekly',
    other: 'Other',
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this medication?')) {
      try {
        await apiClient.delete(`/api/medications/medications/${id}/`)
        onMedicationDeleted(id)
      } catch (error) {
        console.error('Failed to delete medication:', error)
        alert('Failed to delete medication. Please try again.')
      }
    }
  }

  const handleLogDose = async () => {
    if (!selectedMedication?.id) return

    try {
      await apiClient.post(`/api/medications/medications/${selectedMedication.id}/log_dose/`, {
        taken_at: new Date().toISOString(),
        notes: logNotes,
      })
      setLogDialogOpen(false)
      setLogNotes('')
      setSelectedMedication(null)
      // Refresh the medication list if onMedicationUpdated is provided
      if (onMedicationUpdated && selectedMedication) {
        // Fetch updated medication
        const response = await apiClient.get(`/api/medications/medications/${selectedMedication.id}/`)
        onMedicationUpdated(response.data)
      }
      alert('Dose logged successfully!')
    } catch (error) {
      console.error('Failed to log dose:', error)
      alert('Failed to log dose. Please try again.')
    }
  }

  const openLogDialog = (medication: Medication) => {
    setSelectedMedication(medication)
    setLogDialogOpen(true)
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
      <TableContainer sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Name</TableCell>
              <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Dosage</TableCell>
              <TableCell align="center" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Frequency</TableCell>
              <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, display: { xs: 'none', md: 'table-cell' } }}>Start Date</TableCell>
              <TableCell align="center" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Status</TableCell>
              <TableCell align="right" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {medications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No medications tracked yet. Add your first medication above!
                </TableCell>
              </TableRow>
            ) : (
              medications.map((medication) => (
                <TableRow key={medication.id}>
                  <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    <Typography variant="body2" fontWeight="medium" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      {medication.name}
                    </Typography>
                    {medication.notes && (
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                        {medication.notes}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{medication.dosage}</TableCell>
                  <TableCell align="center" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    {frequencyLabels[medication.frequency]}
                  </TableCell>
                  <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, display: { xs: 'none', md: 'table-cell' } }}>
                    {medication.start_date
                      ? format(new Date(medication.start_date), 'MMM dd, yyyy')
                      : 'N/A'}
                  </TableCell>
                  <TableCell align="center" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    <Chip
                      label={medication.is_active ? 'Active' : 'Inactive'}
                      color={medication.is_active ? 'success' : 'default'}
                      size="small"
                      sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                    />
                  </TableCell>
                  <TableCell align="right" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    <IconButton
                      size="small"
                      onClick={() => openLogDialog(medication)}
                      color="primary"
                      title="Log dose"
                    >
                      <CheckCircleIcon fontSize="small" />
                    </IconButton>
                    {onEdit && (
                      <IconButton
                        size="small"
                        onClick={() => onEdit(medication)}
                        color="primary"
                        title="Edit"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    )}
                    <IconButton
                      size="small"
                      onClick={() => medication.id && handleDelete(medication.id)}
                      color="error"
                      title="Delete"
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

      <Dialog open={logDialogOpen} onClose={() => setLogDialogOpen(false)}>
        <DialogTitle>Log Medication Dose</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Logging dose for: <strong>{selectedMedication?.name}</strong>
          </Typography>
          <TextField
            fullWidth
            label="Notes (optional)"
            multiline
            rows={3}
            value={logNotes}
            onChange={(e) => setLogNotes(e.target.value)}
            placeholder="e.g., Taken with food"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleLogDose} variant="contained">
            Log Dose
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default MedicationsTable

