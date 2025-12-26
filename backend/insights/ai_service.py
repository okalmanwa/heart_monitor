"""
AI Service for generating health insights using OpenAI
"""
import json
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from decouple import config
from django.contrib.auth import get_user_model
from openai import OpenAI
from readings.models import BloodPressureReading
from health_factors.models import HealthFactor
from medications.models import Medication
from .models import UserInsight

User = get_user_model()

# Initialize OpenAI client
OPENAI_API_KEY = config('OPENAI_API_KEY', default='')
client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None


def get_user_health_summary(user) -> Dict:
    """Collect and format user health data for AI analysis"""
    # Get recent readings (last 90 days)
    cutoff_date = datetime.now() - timedelta(days=90)
    readings = BloodPressureReading.objects.filter(
        user=user,
        recorded_at__gte=cutoff_date
    ).order_by('recorded_at')
    
    # Get recent health factors
    health_factors = HealthFactor.objects.filter(
        user=user,
        date__gte=cutoff_date.date()
    ).order_by('date')
    
    # Get active medications
    medications = Medication.objects.filter(
        user=user,
        is_active=True
    )
    
    # Format readings data
    readings_data = []
    for reading in readings[:50]:  # Limit to last 50 readings
        readings_data.append({
            'date': reading.recorded_at.strftime('%Y-%m-%d %H:%M'),
            'systolic': reading.systolic,
            'diastolic': reading.diastolic,
            'heart_rate': reading.heart_rate,
            'category': reading.get_category(),
            'notes': reading.notes[:100] if reading.notes else ''
        })
    
    # Format health factors data
    factors_data = []
    for factor in health_factors[:30]:  # Limit to last 30 entries
        factors_data.append({
            'date': factor.date.strftime('%Y-%m-%d'),
            'sleep_quality': factor.sleep_quality,
            'stress_level': factor.stress_level,
            'exercise_duration': factor.exercise_duration,
            'notes': factor.notes[:100] if factor.notes else ''
        })
    
    # Format medications data
    medications_data = []
    for med in medications:
        medications_data.append({
            'name': med.name,
            'dosage': med.dosage,
            'frequency': med.frequency,
            'start_date': med.start_date.strftime('%Y-%m-%d'),
            'is_active': med.is_active
        })
    
    # Calculate basic statistics
    if readings_data:
        avg_systolic = sum(r['systolic'] for r in readings_data) / len(readings_data)
        avg_diastolic = sum(r['diastolic'] for r in readings_data) / len(readings_data)
        high_readings = [r for r in readings_data if r['category'] in ['high_stage1', 'high_stage2']]
    else:
        avg_systolic = None
        avg_diastolic = None
        high_readings = []
    
    return {
        'readings': readings_data,
        'health_factors': factors_data,
        'medications': medications_data,
        'statistics': {
            'total_readings': len(readings_data),
            'avg_systolic': round(avg_systolic, 1) if avg_systolic else None,
            'avg_diastolic': round(avg_diastolic, 1) if avg_diastolic else None,
            'high_readings_count': len(high_readings),
            'total_health_factors': len(factors_data),
            'active_medications': len(medications_data)
        }
    }


def generate_insights_with_ai(user) -> List[UserInsight]:
    """
    Generate AI-powered insights for a user based on their health data
    Returns a list of created UserInsight objects
    """
    if not client:
        raise ValueError("OpenAI API key not configured. Please set OPENAI_API_KEY in your .env file.")
    
    if not user:
        raise ValueError("User is required")
    
    # Get user health data
    health_data = get_user_health_summary(user)
    
    # Don't generate insights if user has no readings
    if not health_data['readings']:
        return []
    
    # Prepare prompt for OpenAI
    prompt = f"""You are a medical AI assistant analyzing blood pressure and health data. 
Analyze the following patient data and provide 2-4 actionable health insights.

Patient Data:
- Total Readings: {health_data['statistics']['total_readings']}
- Average BP: {health_data['statistics']['avg_systolic']}/{health_data['statistics']['avg_diastolic']} mmHg
- High Readings: {health_data['statistics']['high_readings_count']}
- Health Factors Tracked: {health_data['statistics']['total_health_factors']}
- Active Medications: {health_data['statistics']['active_medications']}

Recent Blood Pressure Readings (last 10):
{json.dumps(health_data['readings'][:10], indent=2)}

Recent Health Factors (last 10):
{json.dumps(health_data['health_factors'][:10], indent=2)}

Active Medications:
{json.dumps(health_data['medications'], indent=2)}

Please provide insights in the following JSON format. For each insight, provide:
1. insight_text: A clear, actionable insight (2-3 sentences max)
2. insight_type: One of: "trend", "anomaly", "correlation", "alert"
3. severity: One of: "low", "medium", "high"

Focus on:
- Trends in blood pressure over time
- Correlations between health factors (sleep, stress, exercise) and BP
- Anomalies or concerning patterns
- Alerts for high readings or concerning trends
- Medication effects if applicable

Return ONLY a JSON array of insights, no other text. Format:
[
  {{
    "insight_text": "...",
    "insight_type": "trend",
    "severity": "medium"
  }},
  ...
]

IMPORTANT: Be medically accurate but not alarmist. Always recommend consulting healthcare providers for serious concerns."""

    try:
        # Call OpenAI API
        response = client.chat.completions.create(
            model="gpt-4o-mini",  # Using gpt-4o-mini for cost efficiency
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful medical AI assistant that provides health insights based on blood pressure and health data. Always be accurate, helpful, and recommend professional medical advice for serious concerns."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.7,
            max_tokens=1000
        )
        
        # Parse response
        response_text = response.choices[0].message.content.strip()
        
        # Try to extract JSON from response (in case there's extra text)
        if '[' in response_text:
            json_start = response_text.index('[')
            json_end = response_text.rindex(']') + 1
            response_text = response_text[json_start:json_end]
        
        insights_data = json.loads(response_text)
        
        # Create UserInsight objects
        created_insights = []
        for insight_data in insights_data:
            # Validate and create insight
            insight_type = insight_data.get('insight_type', 'trend')
            if insight_type not in ['trend', 'anomaly', 'correlation', 'alert']:
                insight_type = 'trend'
            
            severity = insight_data.get('severity', 'low')
            if severity not in ['low', 'medium', 'high']:
                severity = 'low'
            
            insight = UserInsight.objects.create(
                user=user,
                insight_text=insight_data.get('insight_text', ''),
                insight_type=insight_type,
                severity=severity,
                is_read=False
            )
            created_insights.append(insight)
        
        return created_insights
        
    except json.JSONDecodeError as e:
        print(f"Error parsing AI response: {e}")
        print(f"Response was: {response_text}")
        # Fallback: create a generic insight
        fallback_insight = UserInsight.objects.create(
            user=user,
            insight_text="AI analysis is temporarily unavailable. Please check back later.",
            insight_type='alert',
            severity='low',
            is_read=False
        )
        return [fallback_insight]
    
    except Exception as e:
        print(f"Error generating AI insights: {e}")
        raise


def generate_insight_summary(user) -> Optional[str]:
    """
    Generate a brief summary of all insights for a user
    Returns a summary string or None
    """
    if not client:
        return None
    
    # Get recent insights
    recent_insights = UserInsight.objects.filter(
        user=user
    ).order_by('-generated_at')[:10]
    
    if not recent_insights:
        return None
    
    insights_text = "\n".join([
        f"- {insight.insight_text} ({insight.insight_type}, {insight.severity})"
        for insight in recent_insights
    ])
    
    prompt = f"""Based on these health insights, provide a brief 2-3 sentence summary 
of the patient's overall health status and key recommendations:

{insights_text}

Provide a concise, actionable summary."""
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "You are a medical AI assistant providing health summaries."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.7,
            max_tokens=200
        )
        
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Error generating summary: {e}")
        return None

