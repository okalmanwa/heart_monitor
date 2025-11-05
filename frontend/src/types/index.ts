export interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  created_at: string
  is_patient?: boolean
  is_staff?: boolean
  is_superuser?: boolean
  is_admin?: boolean
}

export interface BloodPressureReading {
  id?: number
  user?: number
  user_email?: string
  systolic: number
  diastolic: number
  heart_rate?: number
  recorded_at: string
  notes?: string
  created_at?: string
  updated_at?: string
  category?: 'normal' | 'elevated' | 'high_stage1' | 'high_stage2'
}

export interface HealthFactor {
  id?: number
  user?: number
  user_email?: string
  date: string
  sleep_quality?: number
  stress_level?: number
  exercise_duration?: number
  notes?: string
  created_at?: string
  updated_at?: string
}

export interface UserInsight {
  id: number
  user?: number
  user_email?: string
  insight_text: string
  insight_type: 'trend' | 'anomaly' | 'correlation' | 'alert'
  generated_at: string
  is_read: boolean
  severity: 'low' | 'medium' | 'high'
}

