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
import { Box, Typography, ButtonGroup, Button, Paper, Card, CardContent, Chip, Grid } from '@mui/material'
import FavoriteIcon from '@mui/icons-material/Favorite'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import TrendingDownIcon from '@mui/icons-material/TrendingDown'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
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

interface PulseRateChartProps {
  readings: BloodPressureReading[]
}

type TimePeriod = '7d' | '30d' | '90d' | '1y' | 'all' | 'custom'

const PulseRateChart: React.FC<PulseRateChartProps> = ({ readings }) => {
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

    // Filter out readings without heart_rate
    filtered = filtered.filter((r) => r.heart_rate !== null && r.heart_rate !== undefined)

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

  // Calculate statistics
  const stats = useMemo(() => {
    if (filteredReadings.length === 0) return null
    
    const normalCount = filteredReadings.filter(r => {
      const hr = r.heart_rate || 0
      return hr >= 60 && hr <= 100
    }).length
    const normalPercentage = Math.round((normalCount / filteredReadings.length) * 100)
    
    const avgHeartRate = filteredReadings.reduce((sum, r) => sum + (r.heart_rate || 0), 0) / filteredReadings.length
    
    // Calculate trend
    const midPoint = Math.floor(filteredReadings.length / 2)
    const firstHalf = filteredReadings.slice(0, midPoint)
    const secondHalf = filteredReadings.slice(midPoint)
    
    const firstAvg = firstHalf.reduce((sum, r) => sum + (r.heart_rate || 0), 0) / firstHalf.length
    const secondAvg = secondHalf.reduce((sum, r) => sum + (r.heart_rate || 0), 0) / secondHalf.length
    
    const trend = secondAvg < firstAvg ? 'improving' : secondAvg > firstAvg ? 'increasing' : 'stable'
    
    return {
      normalPercentage,
      avgHeartRate: Math.round(avgHeartRate),
      trend,
      trendValue: Math.abs(secondAvg - firstAvg).toFixed(1),
    }
  }, [filteredReadings])

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

    // Get colors based on heart rate category
    const getPointColor = (heartRate?: number) => {
      if (!heartRate) return '#757575' // Gray
      
      // Normal resting heart rate: 60-100 BPM for adults
      if (heartRate < 60) {
        return '#2196f3' // Blue - Below normal (bradycardia)
      } else if (heartRate <= 100) {
        return '#4caf50' // Green - Normal
      } else if (heartRate <= 120) {
        return '#ff9800' // Orange - Elevated
      } else {
        return '#f44336' // Red - High (tachycardia)
      }
    }

    const pointColors = filteredReadings.map((r) => getPointColor(r.heart_rate))
    const pointBorderColors = pointColors

    return {
      labels,
      datasets: [
        {
          label: 'Pulse Rate (BPM)',
          data: filteredReadings.map((r) => r.heart_rate),
          borderColor: 'rgb(233, 30, 99)',
          backgroundColor: 'rgba(233, 30, 99, 0.2)',
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
        text: `💓 Your Heart Rate Journey (${filteredReadings.length} readings)`,
        font: {
          size: 16,
          weight: 'bold' as const,
        },
        color: '#333',
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        borderRadius: 8,
        callbacks: {
          title: (context: any) => {
            const index = context[0].dataIndex
            const reading = filteredReadings[index]
            return `📅 ${format(new Date(reading.recorded_at), 'MMM dd, yyyy h:mm a')}`
          },
          label: (context: any) => {
            const heartRate = context.parsed.y
            let category = ''
            let emoji = ''
            if (heartRate < 60) {
              category = 'Below Normal (Bradycardia)'
              emoji = '🔵'
            } else if (heartRate <= 100) {
              category = 'Normal'
              emoji = '✅'
            } else if (heartRate <= 120) {
              category = 'Elevated'
              emoji = '⚠️'
            } else {
              category = 'High (Tachycardia)'
              emoji = '🔴'
            }
            return `${emoji} ${context.dataset.label}: ${heartRate} BPM - ${category}`
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        min: 40,
        max: 150,
        title: {
          display: true,
          text: 'Pulse Rate (BPM)',
        },
        grid: {
          color: (context: any) => {
            const value = context.tick.value
            if (value === 60 || value === 100) {
              return 'rgba(0, 0, 0, 0.3)' // Darker grid lines for normal range boundaries
            }
            return 'rgba(0, 0, 0, 0.1)'
          },
        },
      },
    },
  }

  if (!chartData) {
    return (
      <Paper 
        sx={{ 
          p: 4,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        }}
      >
        <Box textAlign="center">
          <FavoriteIcon sx={{ fontSize: 64, color: '#e91e63', mb: 2, opacity: 0.5 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: '#333' }}>
            💓 No Heart Rate Data Yet
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            Add heart rate when recording your blood pressure to track your pulse!
          </Typography>
          <Chip 
            label="💡 Include heart rate in your next reading"
            sx={{ 
              backgroundColor: 'rgba(233, 30, 99, 0.1)',
              color: '#e91e63',
              fontWeight: 600,
            }}
          />
        </Box>
      </Paper>
    )
  }

  return (
    <Box>
      {/* Statistics Cards */}
      {stats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <Card 
              sx={{ 
                background: stats.normalPercentage >= 70 
                  ? 'linear-gradient(135deg, #4caf5015 0%, #4caf5005 100%)'
                  : 'linear-gradient(135deg, #ff980015 0%, #ff980005 100%)',
                border: `2px solid ${stats.normalPercentage >= 70 ? '#4caf5040' : '#ff980040'}`,
                borderRadius: 3,
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <CheckCircleIcon sx={{ color: stats.normalPercentage >= 70 ? '#4caf50' : '#ff9800' }} />
                  <Typography variant="h6" sx={{ fontWeight: 700, color: stats.normalPercentage >= 70 ? '#4caf50' : '#ff9800' }}>
                    {stats.normalPercentage}%
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {stats.normalPercentage >= 70 ? '✅ Normal Range' : '⚠️ Keep Tracking!'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card 
              sx={{ 
                background: 'linear-gradient(135deg, #e91e6315 0%, #ad145705 100%)',
                border: '2px solid #e91e6340',
                borderRadius: 3,
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <FavoriteIcon sx={{ color: '#e91e63' }} />
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#e91e63' }}>
                    {stats.avgHeartRate} BPM
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  💓 Average Heart Rate
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card 
              sx={{ 
                background: stats.trend === 'improving' 
                  ? 'linear-gradient(135deg, #4caf5015 0%, #4caf5005 100%)'
                  : stats.trend === 'increasing'
                  ? 'linear-gradient(135deg, #ff980015 0%, #ff980005 100%)'
                  : 'linear-gradient(135deg, #75757515 0%, #75757505 100%)',
                border: `2px solid ${stats.trend === 'improving' ? '#4caf5040' : stats.trend === 'increasing' ? '#ff980040' : '#75757540'}`,
                borderRadius: 3,
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  {stats.trend === 'improving' ? (
                    <TrendingDownIcon sx={{ color: '#4caf50' }} />
                  ) : stats.trend === 'increasing' ? (
                    <TrendingUpIcon sx={{ color: '#ff9800' }} />
                  ) : (
                    <TrendingUpIcon sx={{ color: '#757575', transform: 'rotate(90deg)' }} />
                  )}
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 700,
                      color: stats.trend === 'improving' ? '#4caf50' : stats.trend === 'increasing' ? '#ff9800' : '#757575'
                    }}
                  >
                    {stats.trend === 'improving' ? '📉 Improving' : stats.trend === 'increasing' ? '📈 Increasing' : '➡️ Stable'}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Trend: {stats.trendValue} BPM
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Paper 
        sx={{ 
          p: 3,
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        }}
      >
        <Box sx={{ mb: 2 }}>
        <Box 
          sx={{ 
            overflowX: 'auto',
            overflowY: 'hidden',
            width: '100%',
            mb: 2,
            '&::-webkit-scrollbar': {
              height: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#f1f1f1',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#888',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: '#555',
            },
          }}
        >
          <ButtonGroup 
            variant="outlined" 
            size="small" 
            sx={{ 
              display: 'inline-flex',
              flexWrap: 'nowrap',
              '& .MuiButton-root': {
                fontSize: { xs: '0.7rem', sm: '0.875rem' },
                px: { xs: 1, sm: 2 },
                minWidth: { xs: 'fit-content', sm: 'auto' },
                whiteSpace: 'nowrap',
                flexShrink: 0
              }
            }}
          >
          <Button
            variant={timePeriod === '7d' ? 'contained' : 'outlined'}
            onClick={() => setTimePeriod('7d')}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              ...(timePeriod === '7d' && {
                background: 'linear-gradient(135deg, #e91e63 0%, #ad1457 100%)',
              }),
            }}
          >
            📅 7 Days
          </Button>
          <Button
            variant={timePeriod === '30d' ? 'contained' : 'outlined'}
            onClick={() => setTimePeriod('30d')}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              ...(timePeriod === '30d' && {
                background: 'linear-gradient(135deg, #e91e63 0%, #ad1457 100%)',
              }),
            }}
          >
            📅 30 Days
          </Button>
          <Button
            variant={timePeriod === '90d' ? 'contained' : 'outlined'}
            onClick={() => setTimePeriod('90d')}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              ...(timePeriod === '90d' && {
                background: 'linear-gradient(135deg, #e91e63 0%, #ad1457 100%)',
              }),
            }}
          >
            📅 90 Days
          </Button>
          <Button
            variant={timePeriod === '1y' ? 'contained' : 'outlined'}
            onClick={() => setTimePeriod('1y')}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              ...(timePeriod === '1y' && {
                background: 'linear-gradient(135deg, #e91e63 0%, #ad1457 100%)',
              }),
            }}
          >
            📅 1 Year
          </Button>
          <Button
            variant={timePeriod === 'all' ? 'contained' : 'outlined'}
            onClick={() => setTimePeriod('all')}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              ...(timePeriod === 'all' && {
                background: 'linear-gradient(135deg, #e91e63 0%, #ad1457 100%)',
              }),
            }}
          >
            📊 All Time
          </Button>
          <Button
            variant={timePeriod === 'custom' ? 'contained' : 'outlined'}
            onClick={() => setTimePeriod('custom')}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              ...(timePeriod === 'custom' && {
                background: 'linear-gradient(135deg, #e91e63 0%, #ad1457 100%)',
              }),
            }}
          >
            🎯 Custom
          </Button>
          </ButtonGroup>
        </Box>

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

      <Box sx={{ height: { xs: 300, sm: 400 }, position: 'relative' }}>
        <Line data={chartData} options={options} />
      </Box>

      <Box mt={3}>
        <Card 
          sx={{ 
            p: 2,
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            borderRadius: 2,
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
            🎨 Color Guide:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 1.5 }}>
            <Chip 
              label="🔵 Blue = Below Normal (<60 BPM)"
              size="small"
              sx={{ backgroundColor: '#2196f320', color: '#1565c0', fontWeight: 600 }}
            />
            <Chip 
              label="✅ Green = Normal (60-100 BPM)"
              size="small"
              sx={{ backgroundColor: '#4caf5020', color: '#2e7d32', fontWeight: 600 }}
            />
            <Chip 
              label="⚠️ Orange = Elevated (100-120 BPM)"
              size="small"
              sx={{ backgroundColor: '#ff980020', color: '#f57c00', fontWeight: 600 }}
            />
            <Chip 
              label="🔴 Red = High (>120 BPM)"
              size="small"
              sx={{ backgroundColor: '#f4433620', color: '#c62828', fontWeight: 600 }}
            />
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            💡 Normal resting heart rate for adults is typically 60-100 BPM. Hover over points for details!
          </Typography>
        </Card>
      </Box>
    </Paper>
    </Box>
  )
}

export default PulseRateChart

