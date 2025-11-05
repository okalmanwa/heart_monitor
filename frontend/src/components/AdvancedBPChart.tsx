import { useMemo, useState } from 'react'
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
import { Box, Typography, ButtonGroup, Button, Paper } from '@mui/material'
import { BloodPressureReading } from '../types'
import { format, subDays, subMonths, subYears, startOfDay, endOfDay } from 'date-fns'

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

interface AdvancedBPChartProps {
  readings: BloodPressureReading[]
}

type TimePeriod = '7d' | '30d' | '90d' | '1y' | 'all' | 'custom'

const AdvancedBPChart: React.FC<AdvancedBPChartProps> = ({ readings }) => {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('30d')
  const [customStartDate, setCustomStartDate] = useState<string>('')
  const [customEndDate, setCustomEndDate] = useState<string>('')

  const filteredReadings = useMemo(() => {
    if (readings.length === 0) return []

    let startDate: Date | null = null
    const now = new Date()

    switch (timePeriod) {
      case '7d':
        startDate = subDays(now, 7)
        break
      case '30d':
        startDate = subDays(now, 30)
        break
      case '90d':
        startDate = subDays(now, 90)
        break
      case '1y':
        startDate = subYears(now, 1)
        break
      case 'custom':
        if (customStartDate) {
          startDate = new Date(customStartDate)
        }
        break
      case 'all':
      default:
        startDate = null
    }

    let filtered = [...readings]

    if (startDate) {
      filtered = filtered.filter(
        (r) => new Date(r.recorded_at) >= startOfDay(startDate!)
      )
    }

    if (timePeriod === 'custom' && customEndDate) {
      const endDate = endOfDay(new Date(customEndDate))
      filtered = filtered.filter((r) => new Date(r.recorded_at) <= endDate)
    } else if (timePeriod !== 'all' && timePeriod !== 'custom') {
      // Filter to end of today for non-custom periods
      filtered = filtered.filter((r) => new Date(r.recorded_at) <= endOfDay(now))
    }

    // Sort by date
    return filtered.sort(
      (a, b) =>
        new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
    )
  }, [readings, timePeriod, customStartDate, customEndDate])

  const chartData = useMemo(() => {
    if (filteredReadings.length === 0) {
      return null
    }

    // Determine label format based on time period
    const getLabelFormat = () => {
      switch (timePeriod) {
        case '7d':
          return 'MMM dd'
        case '30d':
          return 'MMM dd'
        case '90d':
          return 'MMM dd'
        case '1y':
          return 'MMM yyyy'
        default:
          return 'MMM dd, yyyy'
      }
    }

    const labels = filteredReadings.map((reading) =>
      format(new Date(reading.recorded_at), getLabelFormat())
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

    const pointColors = filteredReadings.map((r) => getPointColor(r.category))
    const pointBorderColors = pointColors

    return {
      labels,
      datasets: [
        {
          label: 'Systolic',
          data: filteredReadings.map((r) => r.systolic),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.1,
          pointRadius: 6,
          pointBackgroundColor: pointColors,
          pointBorderColor: pointBorderColors,
          pointBorderWidth: 2,
          fill: true,
        },
        {
          label: 'Diastolic',
          data: filteredReadings.map((r) => r.diastolic),
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          tension: 0.1,
          pointRadius: 6,
          pointBackgroundColor: pointColors,
          pointBorderColor: pointBorderColors,
          pointBorderWidth: 2,
          fill: true,
        },
      ],
    }
  }, [filteredReadings, timePeriod])

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `Blood Pressure Trends (${filteredReadings.length} readings)`,
      },
      tooltip: {
        callbacks: {
          afterLabel: (context: any) => {
            const index = context.dataIndex
            const reading = filteredReadings[index]
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
      <Paper sx={{ p: 3 }}>
        <Box p={3} textAlign="center">
          <Typography variant="body1" color="text.secondary">
            No readings available for the selected time period. Add a reading to see the chart.
          </Typography>
        </Box>
      </Paper>
    )
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ mb: 2 }}>
        <ButtonGroup variant="outlined" size="small" sx={{ mb: 2 }}>
          <Button
            variant={timePeriod === '7d' ? 'contained' : 'outlined'}
            onClick={() => setTimePeriod('7d')}
          >
            7 Days
          </Button>
          <Button
            variant={timePeriod === '30d' ? 'contained' : 'outlined'}
            onClick={() => setTimePeriod('30d')}
          >
            30 Days
          </Button>
          <Button
            variant={timePeriod === '90d' ? 'contained' : 'outlined'}
            onClick={() => setTimePeriod('90d')}
          >
            90 Days
          </Button>
          <Button
            variant={timePeriod === '1y' ? 'contained' : 'outlined'}
            onClick={() => setTimePeriod('1y')}
          >
            1 Year
          </Button>
          <Button
            variant={timePeriod === 'all' ? 'contained' : 'outlined'}
            onClick={() => setTimePeriod('all')}
          >
            All Time
          </Button>
          <Button
            variant={timePeriod === 'custom' ? 'contained' : 'outlined'}
            onClick={() => setTimePeriod('custom')}
          >
            Custom
          </Button>
        </ButtonGroup>

        {timePeriod === 'custom' && (
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              style={{
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '14px',
              }}
              placeholder="Start Date"
            />
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              style={{
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '14px',
              }}
              placeholder="End Date"
            />
          </Box>
        )}
      </Box>

      <Box sx={{ height: 400, position: 'relative' }}>
        <Line data={chartData} options={options} />
      </Box>

      <Box mt={2}>
        <Typography variant="caption" color="text.secondary">
          <strong>Color Legend:</strong> Green = Normal, Orange = Elevated, Red = High Stage 1/2
        </Typography>
      </Box>
    </Paper>
  )
}

export default AdvancedBPChart

