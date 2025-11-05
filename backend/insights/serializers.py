from rest_framework import serializers
from .models import UserInsight


class UserInsightSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserInsight
        fields = ['id', 'insight_text', 'insight_type', 'generated_at', 'is_read', 'severity']
        read_only_fields = ['id', 'generated_at']

