import { useMemo } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { Box, Typography } from '@mui/material'
import { BloodPressureReading } from '../types'
import { format } from 'date-fns'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface BPChartProps {
  readings: BloodPressureReading[]
}

const BPChart: React.FC<BPChartProps> = ({ readings }) => {
  const chartData = useMemo(() => {
    if (readings.length === 0) {
      return null
    }

    // Sort readings by date
    const sortedReadings = [...readings].sort(
      (a, b) =>
        new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
    )

    const labels = sortedReadings.map((reading) =>
      format(new Date(reading.recorded_at), 'MMM dd')
    )

    // Get colors based on BP category
    const getPointColor = (category?: string) => {
      switch (category) {
        case 'normal':
          return '#4caf50' // Green
        case 'elevated':
          return '#ff9800' // Orange
        case 'high_stage1':
          return '#f44336' // Red
        case 'high_stage2':
          return '#d32f2f' // Dark Red
        default:
          return '#757575' // Gray
      }
    }

    const pointColors = sortedReadings.map((r) => getPointColor(r.category))
    const pointBorderColors = pointColors

    return {
      labels,
      datasets: [
        {
          label: 'Systolic',
          data: sortedReadings.map((r) => r.systolic),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.1,
          pointRadius: 6,
          pointBackgroundColor: pointColors,
          pointBorderColor: pointBorderColors,
          pointBorderWidth: 2,
        },
        {
          label: 'Diastolic',
          data: sortedReadings.map((r) => r.diastolic),
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          tension: 0.1,
          pointRadius: 6,
          pointBackgroundColor: pointColors,
          pointBorderColor: pointBorderColors,
          pointBorderWidth: 2,
        },
      ],
    }
  }, [readings])

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          afterLabel: (context: any) => {
            const index = context.dataIndex
            const reading = [...readings].sort(
              (a, b) =>
                new Date(a.recorded_at).getTime() -
                new Date(b.recorded_at).getTime()
            )[index]
            return `Category: ${reading.category?.replace('_', ' ').toUpperCase() || 'N/A'}`
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        min: 40,
        max: 200,
        title: {
          display: true,
          text: 'Blood Pressure (mmHg)',
        },
      },
    },
  }

  if (!chartData) {
    return (
      <Box p={3} textAlign="center">
        <Typography variant="body1" color="text.secondary">
          No readings available. Add a reading to see the chart.
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ height: 400, position: 'relative' }}>
      <Line data={chartData} options={options} />
      <Box mt={2}>
        <Typography variant="caption" color="text.secondary">
          <strong>Color Legend:</strong> Green = Normal, Orange = Elevated, Red = High Stage 1/2
        </Typography>
      </Box>
    </Box>
  )
}

export default BPChart

