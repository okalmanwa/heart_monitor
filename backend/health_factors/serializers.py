from rest_framework import serializers
from .models import HealthFactor


class HealthFactorSerializer(serializers.ModelSerializer):
    class Meta:
        model = HealthFactor
        fields = ['id', 'date', 'sleep_quality', 'stress_level', 
                  'exercise_duration', 'notes', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_sleep_quality(self, value):
        if value is not None and (value < 1 or value > 5):
            raise serializers.ValidationError("Sleep quality must be between 1 and 5")
        return value

    def validate_stress_level(self, value):
        if value is not None and (value < 1 or value > 5):
            raise serializers.ValidationError("Stress level must be between 1 and 5")
        return value

    def validate_exercise_duration(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError("Exercise duration cannot be negative")
        return value

