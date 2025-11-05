from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .serializers import UserRegistrationSerializer, UserSerializer
from .models import User


@csrf_exempt
@api_view(['POST', 'GET'])  # Allow GET for testing
@permission_classes([AllowAny])
def register(request):
    """User registration endpoint"""
    import logging
    logger = logging.getLogger(__name__)
    
    # Log request for debugging
    logger.error(f"Register endpoint called: method={request.method}, content_type={request.content_type}")
    logger.error(f"Request data type: {type(request.data)}, value: {request.data}")
    
    if request.method == 'GET':
        return Response({'message': 'Registration endpoint. Use POST with JSON data.'}, status=status.HTTP_200_OK)
    
    try:
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UserSerializer(user).data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_201_CREATED)
        logger.error(f"Serializer errors: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f"Exception in register: {str(e)}", exc_info=True)
        return Response({
            'error': str(e),
            'detail': 'An error occurred during registration'
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile(request):
    """Get current user profile"""
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


class UserProfileUpdateView(generics.UpdateAPIView):
    """Update user profile"""
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

