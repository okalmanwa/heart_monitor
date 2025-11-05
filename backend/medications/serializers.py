from rest_framework import serializers
from .models import Medication, MedicationLog


class MedicationSerializer(serializers.ModelSerializer):
    """Serializer for Medication model"""
    user_email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = Medication
        fields = [
            'id',
            'user',
            'user_email',
            'name',
            'dosage',
            'frequency',
            'start_date',
            'end_date',
            'is_active',
            'notes',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['user', 'created_at', 'updated_at']


class MedicationLogSerializer(serializers.ModelSerializer):
    """Serializer for MedicationLog model"""
    medication_name = serializers.CharField(source='medication.name', read_only=True)

    class Meta:
        model = MedicationLog
        fields = [
            'id',
            'medication',
            'medication_name',
            'taken_at',
            'notes',
            'created_at',
        ]
        read_only_fields = ['created_at']


class MedicationWithLogsSerializer(MedicationSerializer):
    """Serializer that includes medication logs"""
    logs = MedicationLogSerializer(many=True, read_only=True)
    recent_logs_count = serializers.SerializerMethodField()

    class Meta(MedicationSerializer.Meta):
        fields = MedicationSerializer.Meta.fields + ['logs', 'recent_logs_count']

    def get_recent_logs_count(self, obj):
        """Get count of logs in the last 7 days"""
        from datetime import timedelta
        from django.utils import timezone
        week_ago = timezone.now() - timedelta(days=7)
        return obj.logs.filter(taken_at__gte=week_ago).count()

