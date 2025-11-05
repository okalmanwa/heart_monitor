from rest_framework import serializers
from .models import UserInsight


class UserInsightSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_id = serializers.IntegerField(source='user.id', read_only=True)

    class Meta:
        model = UserInsight
        fields = ['id', 'user', 'user_id', 'user_email', 'insight_text', 'insight_type', 'generated_at', 'is_read', 'severity']
        read_only_fields = ['id', 'generated_at', 'user_id', 'user_email']

