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
        display: false,
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
        display: false,
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
      <Paper 
        sx={{ 
          p: 4,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        }}
      >
        <Box textAlign="center">
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: '#333' }}>
            No Correlation Data Yet
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track both blood pressure and health factors on the same dates to discover patterns.
          </Typography>
        </Box>
      </Paper>
    )
  }

  return (
    <Box>
      <Paper 
        sx={{ 
          p: { xs: 2, sm: 3 },
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          mb: 2,
        }}
      >
        <Box sx={{ mb: 2 }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontSize: { xs: '1.2rem', sm: '1.4rem' },
              fontWeight: 700,
              mb: 0.5,
            }}
          >
            Health Pattern Discovery
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary"
          >
            See how sleep, stress, and exercise affect your blood pressure
          </Typography>
        </Box>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Analyzing {matchedData.length} day{matchedData.length !== 1 ? 's' : ''} with both BP readings and health factors
          </Typography>
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2, overflowX: 'auto', width: '100%' }}>
          <Tabs 
            value={activeTab} 
            onChange={(_, newValue) => setActiveTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: '3px 3px 0 0',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              },
              '& .MuiTab-root': {
                fontSize: { xs: '0.8rem', sm: '0.95rem' },
                minWidth: { xs: 100, sm: 140 },
                px: { xs: 1.5, sm: 2.5 },
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: 'rgba(102, 126, 234, 0.04)',
                },
              },
            }}
          >
            <Tab label="Sleep Quality" />
            <Tab label="Stress Level" />
            <Tab label="Exercise" />
          </Tabs>
        </Box>

        <Box sx={{ height: { xs: 300, sm: 400 }, position: 'relative' }}>
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

        <Box mt={2}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            {activeTab === 0 && 'Better sleep quality (higher number) often correlates with lower blood pressure. Look for patterns.'}
            {activeTab === 1 && 'Higher stress levels may correlate with elevated blood pressure. Track both to see connections.'}
            {activeTab === 2 && 'More exercise often helps maintain healthier blood pressure. See how your activity affects your BP.'}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            Hover over data points to see specific values and discover your personal health patterns.
          </Typography>
        </Box>
      </Paper>
    </Box>
  )
}

export default CorrelationChart

