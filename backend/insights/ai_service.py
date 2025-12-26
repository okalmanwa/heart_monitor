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
from .models import UserInsight, UserInsightSummary

User = get_user_model()

# OpenAI API key (lazy initialization of client)
OPENAI_API_KEY = config('OPENAI_API_KEY', default='')
_client = None


def get_openai_client():
    """Get or create OpenAI client (lazy initialization)"""
    global _client
    if _client is None and OPENAI_API_KEY:
        try:
            _client = OpenAI(api_key=OPENAI_API_KEY)
        except Exception as e:
            print(f"Warning: Failed to initialize OpenAI client: {e}")
            _client = False  # Mark as failed to avoid retrying
    return _client if _client else None


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
    client = get_openai_client()
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

Please provide EXACTLY 4 insights, one of each type. For each insight, provide:
1. insight_text: A clear, actionable insight (2-3 sentences max)
2. insight_type: One of: "trend", "anomaly", "correlation", "alert" (each type must appear exactly once)
3. severity: One of: "low", "medium", "high"

Required insight types (provide exactly one of each):
- "trend": Trends in blood pressure over time
- "anomaly": Anomalies or unusual patterns in the data
- "correlation": Correlations between health factors (sleep, stress, exercise) and BP
- "alert": Alerts for high readings or concerning trends

Return ONLY a JSON array with exactly 4 insights, one for each type. No duplicates. Format:
[
  {{
    "insight_text": "...",
    "insight_type": "trend",
    "severity": "medium"
  }},
  {{
    "insight_text": "...",
    "insight_type": "anomaly",
    "severity": "low"
  }},
  {{
    "insight_text": "...",
    "insight_type": "correlation",
    "severity": "medium"
  }},
  {{
    "insight_text": "...",
    "insight_type": "alert",
    "severity": "high"
  }}
]

IMPORTANT: 
- Provide exactly 4 insights, one of each type
- No duplicate insight types
- Be medically accurate but not alarmist
- Always recommend consulting healthcare providers for serious concerns."""

    try:
        # Call OpenAI API with timeout
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
            max_tokens=1000,
            timeout=30.0  # 30 second timeout
        )
        
        # Parse response
        response_text = response.choices[0].message.content.strip()
        
        # Try to extract JSON from response (in case there's extra text)
        if '[' in response_text:
            json_start = response_text.index('[')
            json_end = response_text.rindex(']') + 1
            response_text = response_text[json_start:json_end]
        
        insights_data = json.loads(response_text)
        
        # Ensure we have exactly one of each type, no duplicates
        valid_types = ['trend', 'anomaly', 'correlation', 'alert']
        type_seen = set()
        created_insights = []
        
        for insight_data in insights_data:
            # Validate and get insight type
            insight_type = insight_data.get('insight_type', 'trend')
            if insight_type not in valid_types:
                # Skip invalid types
                continue
            
            # Skip if we've already seen this type
            if insight_type in type_seen:
                continue
            
            # Mark this type as seen
            type_seen.add(insight_type)
            
            # Validate severity
            severity = insight_data.get('severity', 'low')
            if severity not in ['low', 'medium', 'high']:
                severity = 'low'
            
            # Create insight
            insight = UserInsight.objects.create(
                user=user,
                insight_text=insight_data.get('insight_text', ''),
                insight_type=insight_type,
                severity=severity,
                is_read=False
            )
            created_insights.append(insight)
        
        # If we're missing any types, create fallback insights for missing types
        missing_types = set(valid_types) - type_seen
        for missing_type in missing_types:
            # Create a generic insight for the missing type
            fallback_messages = {
                'trend': 'Continue monitoring your blood pressure trends over time.',
                'anomaly': 'Watch for any unusual patterns in your readings.',
                'correlation': 'Track how lifestyle factors affect your blood pressure.',
                'alert': 'Stay vigilant about your blood pressure readings.'
            }
            
            insight = UserInsight.objects.create(
                user=user,
                insight_text=fallback_messages.get(missing_type, 'Continue monitoring your health data.'),
                insight_type=missing_type,
                severity='low',
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


def generate_and_cache_insight_summary(user, force_regenerate=False) -> Optional[str]:
    """
    Generate a brief summary of all insights for a user and cache it
    Returns a summary string or None
    """
    # Check if we have a cached summary
    if not force_regenerate:
        try:
            cached_summary = UserInsightSummary.objects.get(user=user)
            # Get current insight count
            current_count = UserInsight.objects.filter(user=user).count()
            # If insight count hasn't changed, return cached summary
            if cached_summary.insight_count == current_count:
                return cached_summary.summary_text
        except UserInsightSummary.DoesNotExist:
            pass
    
    client = get_openai_client()
    if not client:
        return None
    
    # Get recent insights (all insights, not just 10)
    recent_insights = UserInsight.objects.filter(
        user=user
    ).order_by('-generated_at')
    
    if not recent_insights:
        # Delete cached summary if no insights
        UserInsightSummary.objects.filter(user=user).delete()
        return None
    
    # Group insights by type and severity for better summary
    insights_by_type = {}
    for insight in recent_insights:
        if insight.insight_type not in insights_by_type:
            insights_by_type[insight.insight_type] = []
        insights_by_type[insight.insight_type].append(insight)
    
    # Format insights for prompt
    insights_text = "\n".join([
        f"- {insight.insight_text} (Type: {insight.insight_type}, Severity: {insight.severity})"
        for insight in recent_insights[:20]  # Limit to most recent 20
    ])
    
    prompt = f"""Based on these health insights, provide a concise 2-4 sentence summary 
of the patient's overall health status and actionable recommendations. Focus on:
1. Overall health status based on the insights
2. Key actions the patient should take
3. Important patterns or concerns to monitor

Recent Health Insights:
{insights_text}

Provide a clear, actionable summary that helps the patient understand what to do next."""
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "You are a medical AI assistant providing clear, actionable health summaries. Be concise, helpful, and focus on what the patient should do."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.7,
            max_tokens=300
        )
        
        summary_text = response.choices[0].message.content.strip()
        
        # Cache the summary
        UserInsightSummary.objects.update_or_create(
            user=user,
            defaults={
                'summary_text': summary_text,
                'insight_count': recent_insights.count()
            }
        )
        
        return summary_text
    except Exception as e:
        print(f"Error generating summary: {e}")
        return None

