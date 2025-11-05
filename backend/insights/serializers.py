from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import UserInsight

User = get_user_model()


class UserInsightSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), required=False)

    class Meta:
        model = UserInsight
        fields = ['id', 'user', 'user_email', 'insight_text', 'insight_type', 'generated_at', 'is_read', 'severity']
        read_only_fields = ['id', 'generated_at', 'user_email']

