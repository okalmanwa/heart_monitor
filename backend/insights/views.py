from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import UserInsight
from .serializers import UserInsightSerializer


class UserInsightViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing AI-generated insights"""
    serializer_class = UserInsightSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return UserInsight.objects.filter(user=self.request.user)

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Mark an insight as read"""
        insight = self.get_object()
        insight.is_read = True
        insight.save()
        return Response({'status': 'marked as read'})

