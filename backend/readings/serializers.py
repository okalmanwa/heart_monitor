from rest_framework import serializers
from .models import BloodPressureReading


class BloodPressureReadingSerializer(serializers.ModelSerializer):
    category = serializers.CharField(read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_id = serializers.IntegerField(source='user.id', read_only=True)

    class Meta:
        model = BloodPressureReading
        fields = ['id', 'user', 'user_id', 'user_email', 'systolic', 'diastolic', 'heart_rate', 'recorded_at', 
                  'notes', 'created_at', 'updated_at', 'category']
        read_only_fields = ['id', 'created_at', 'updated_at', 'category', 'user_id', 'user_email']

    def validate_systolic(self, value):
        if value < 50 or value > 250:
            raise serializers.ValidationError("Systolic pressure must be between 50 and 250")
        return value

    def validate_diastolic(self, value):
        if value < 30 or value > 200:
            raise serializers.ValidationError("Diastolic pressure must be between 30 and 200")
        return value

    def validate_heart_rate(self, value):
        if value is not None and (value < 30 or value > 200):
            raise serializers.ValidationError("Heart rate must be between 30 and 200")
        return value

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['category'] = instance.get_category()
        return representation

