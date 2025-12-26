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

  // Calculate statistics for gamification
  const stats = useMemo(() => {
    if (filteredReadings.length === 0) return null
    
    const normalCount = filteredReadings.filter(r => r.category === 'normal').length
    const normalPercentage = Math.round((normalCount / filteredReadings.length) * 100)
    
    const avgSystolic = filteredReadings.reduce((sum, r) => sum + r.systolic, 0) / filteredReadings.length
    const avgDiastolic = filteredReadings.reduce((sum, r) => sum + r.diastolic, 0) / filteredReadings.length
    
    // Calculate trend (comparing first half vs second half)
    const midPoint = Math.floor(filteredReadings.length / 2)
    const firstHalf = filteredReadings.slice(0, midPoint)
    const secondHalf = filteredReadings.slice(midPoint)
    
    const firstAvg = firstHalf.reduce((sum, r) => sum + (r.systolic + r.diastolic) / 2, 0) / firstHalf.length
    const secondAvg = secondHalf.reduce((sum, r) => sum + (r.systolic + r.diastolic) / 2, 0) / secondHalf.length
    
    const trend = secondAvg < firstAvg ? 'improving' : secondAvg > firstAvg ? 'increasing' : 'stable'
    
    return {
      normalPercentage,
      avgSystolic: Math.round(avgSystolic),
      avgDiastolic: Math.round(avgDiastolic),
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
        text: `📊 Your Blood Pressure Journey (${filteredReadings.length} readings)`,
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
            const index = context.dataIndex
            const reading = filteredReadings[index]
            const emoji = reading.category === 'normal' ? '✅' : reading.category === 'elevated' ? '⚠️' : '🔴'
            return `${context.dataset.label}: ${context.parsed.y} mmHg ${emoji}`
          },
          afterLabel: (context: any) => {
            const index = context.dataIndex
            const reading = filteredReadings[index]
            const category = reading.category?.replace('_', ' ').toUpperCase() || 'N/A'
            const heartRate = reading.heart_rate ? ` | 💓 ${reading.heart_rate} BPM` : ''
            return `Status: ${category}${heartRate}`
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
      <Paper 
        sx={{ 
          p: 4,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        }}
      >
        <Box textAlign="center">
          <FavoriteIcon sx={{ fontSize: 64, color: '#667eea', mb: 2, opacity: 0.5 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: '#333' }}>
            📊 No Data Yet
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            Start tracking your blood pressure to see your health journey!
          </Typography>
          <Chip 
            label="💡 Add your first reading to get started"
            sx={{ 
              backgroundColor: 'rgba(102, 126, 234, 0.1)',
              color: '#667eea',
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
                  {stats.normalPercentage >= 70 ? '✅ Normal Readings' : '⚠️ Keep Tracking!'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card 
              sx={{ 
                background: 'linear-gradient(135deg, #667eea15 0%, #764ba205 100%)',
                border: '2px solid #667eea40',
                borderRadius: 3,
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <FavoriteIcon sx={{ color: '#667eea' }} />
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#667eea' }}>
                    {stats.avgSystolic}/{stats.avgDiastolic}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  📊 Average BP
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
                  Trend: {stats.trendValue} mmHg
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
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
            <Chip 
              label="✅ Green = Normal"
              size="small"
              sx={{ backgroundColor: '#4caf5020', color: '#2e7d32', fontWeight: 600 }}
            />
            <Chip 
              label="⚠️ Orange = Elevated"
              size="small"
              sx={{ backgroundColor: '#ff980020', color: '#f57c00', fontWeight: 600 }}
            />
            <Chip 
              label="🔴 Red = High"
              size="small"
              sx={{ backgroundColor: '#f4433620', color: '#c62828', fontWeight: 600 }}
            />
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
            💡 Hover over data points to see detailed information about each reading!
          </Typography>
        </Card>
      </Box>
    </Paper>
    </Box>
  )
}

export default AdvancedBPChart

