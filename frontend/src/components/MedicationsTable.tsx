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
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Dosage</TableCell>
              <TableCell align="center">Frequency</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="right">Actions</TableCell>
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
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {medication.name}
                    </Typography>
                    {medication.notes && (
                      <Typography variant="caption" color="text.secondary">
                        {medication.notes}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{medication.dosage}</TableCell>
                  <TableCell align="center">
                    {frequencyLabels[medication.frequency]}
                  </TableCell>
                  <TableCell>
                    {medication.start_date
                      ? format(new Date(medication.start_date), 'MMM dd, yyyy')
                      : 'N/A'}
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={medication.is_active ? 'Active' : 'Inactive'}
                      color={medication.is_active ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => openLogDialog(medication)}
                      color="primary"
                      title="Log dose"
                    >
                      <CheckCircleIcon />
                    </IconButton>
                    {onEdit && (
                      <IconButton
                        size="small"
                        onClick={() => onEdit(medication)}
                        color="primary"
                        title="Edit"
                      >
                        <EditIcon />
                      </IconButton>
                    )}
                    <IconButton
                      size="small"
                      onClick={() => medication.id && handleDelete(medication.id)}
                      color="error"
                      title="Delete"
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

