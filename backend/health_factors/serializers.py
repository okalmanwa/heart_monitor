from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import HealthFactor

User = get_user_model()


class HealthFactorSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), required=False, allow_null=True)

    class Meta:
        model = HealthFactor
        fields = ['id', 'user', 'user_email', 'date', 'sleep_quality', 'stress_level', 
                  'exercise_duration', 'notes', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at', 'user_email']
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Make user field read-only for non-admin users
        request = self.context.get('request')
        if request and not (request.user.is_staff or request.user.is_superuser):
            self.fields['user'].read_only = True
    
    def validate_user(self, value):
        # Allow None - user will be set in perform_create or create method
        # This field is optional and will be set automatically for non-admin users
        return value

    def validate(self, attrs):
        # Remove user from attrs if it's None or empty - it will be set in perform_create
        if 'user' in attrs and (attrs['user'] is None or attrs['user'] == ''):
            attrs.pop('user')
        return attrs

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

    def create(self, validated_data):
        # User is set from view, but we need to handle it here for admin
        user = validated_data.pop('user', None) or self.context['request'].user
        return HealthFactor.objects.create(user=user, **validated_data)

