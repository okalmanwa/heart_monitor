import { useMemo } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Scatter, Bar } from 'react-chartjs-2'
import { Box, Typography, Paper, Tabs, Tab } from '@mui/material'
import { BloodPressureReading, HealthFactor } from '../types'
import { format, isSameDay } from 'date-fns'
import { useState } from 'react'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface CorrelationChartProps {
  readings: BloodPressureReading[]
  healthFactors: HealthFactor[]
}

const CorrelationChart: React.FC<CorrelationChartProps> = ({
  readings,
  healthFactors,
}) => {
  const [activeTab, setActiveTab] = useState(0)

  // Match readings with health factors by date
  const matchedData = useMemo(() => {
    if (readings.length === 0 || healthFactors.length === 0) return []

    return readings
      .map((reading) => {
        const readingDate = new Date(reading.recorded_at)
        const factor = healthFactors.find((f) =>
          isSameDay(new Date(f.date), readingDate)
        )

        if (factor) {
          return {
            reading,
            factor,
            date: readingDate,
          }
        }
        return null
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
  }, [readings, healthFactors])

  const sleepData = useMemo(() => {
    if (matchedData.length === 0) return null

    return {
      labels: matchedData.map((d) => format(d.date, 'MMM dd')),
      datasets: [
        {
          label: 'Average BP vs Sleep Quality',
          data: matchedData.map((d) => ({
            x: d.factor.sleep_quality || 0,
            y: (d.reading.systolic + d.reading.diastolic) / 2,
          })),
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
        },
      ],
    }
  }, [matchedData])

  const stressData = useMemo(() => {
    if (matchedData.length === 0) return null

    return {
      labels: matchedData.map((d) => format(d.date, 'MMM dd')),
      datasets: [
        {
          label: 'Average BP vs Stress Level',
          data: matchedData.map((d) => ({
            x: d.factor.stress_level || 0,
            y: (d.reading.systolic + d.reading.diastolic) / 2,
          })),
          backgroundColor: 'rgba(255, 99, 132, 0.6)',
          borderColor: 'rgba(255, 99, 132, 1)',
        },
      ],
    }
  }, [matchedData])

  const exerciseData = useMemo(() => {
    if (matchedData.length === 0) return null

    // Group by exercise duration ranges
    const ranges = [
      { min: 0, max: 15, label: '0-15 min' },
      { min: 16, max: 30, label: '16-30 min' },
      { min: 31, max: 60, label: '31-60 min' },
      { min: 61, max: 999, label: '60+ min' },
    ]

    const avgBPByRange = ranges.map((range) => {
      const matching = matchedData.filter(
        (d) =>
          (d.factor.exercise_duration || 0) >= range.min &&
          (d.factor.exercise_duration || 0) <= range.max
      )

      if (matching.length === 0) return 0

      const avgBP =
        matching.reduce(
          (sum, d) => sum + (d.reading.systolic + d.reading.diastolic) / 2,
          0
        ) / matching.length

      return avgBP
    })

    return {
      labels: ranges.map((r) => r.label),
      datasets: [
        {
          label: 'Average BP by Exercise Duration',
          data: avgBPByRange,
          backgroundColor: 'rgba(153, 102, 255, 0.6)',
          borderColor: 'rgba(153, 102, 255, 1)',
        },
      ],
    }
  }, [matchedData])

  const scatterOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Correlation Analysis',
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Health Factor Rating',
        },
        min: 0,
        max: 6,
      },
      y: {
        title: {
          display: true,
          text: 'Average Blood Pressure (mmHg)',
        },
        min: 60,
        max: 180,
      },
    },
  }

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Average BP by Exercise Duration',
      },
    },
    scales: {
      y: {
        title: {
          display: true,
          text: 'Average Blood Pressure (mmHg)',
        },
        min: 60,
        max: 180,
      },
    },
  }

  if (matchedData.length === 0) {
    return (
      <Paper sx={{ p: 3 }}>
        <Box p={3} textAlign="center">
          <Typography variant="body1" color="text.secondary">
            No matching data found. Add health factors and blood pressure readings on the same dates to see correlations.
          </Typography>
        </Box>
      </Paper>
    )
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        BP vs Health Factors Correlation
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
        Showing {matchedData.length} days with both BP readings and health factors
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab label="Sleep Quality" />
          <Tab label="Stress Level" />
          <Tab label="Exercise" />
        </Tabs>
      </Box>

      <Box sx={{ height: 400, position: 'relative' }}>
        {activeTab === 0 && sleepData && (
          <Scatter data={sleepData} options={scatterOptions} />
        )}
        {activeTab === 1 && stressData && (
          <Scatter data={stressData} options={scatterOptions} />
        )}
        {activeTab === 2 && exerciseData && (
          <Bar data={exerciseData} options={barOptions} />
        )}
      </Box>
    </Paper>
  )
}

export default CorrelationChart

