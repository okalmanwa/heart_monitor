from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .serializers import UserRegistrationSerializer, UserSerializer
from .models import User
from django.contrib.auth import get_user_model

User = get_user_model()


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


@csrf_exempt
@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def create_test_users(request):
    """One-time endpoint to create test users - call this from browser"""
    test_users_data = [
        {
            'username': 'john_doe',
            'email': 'john.doe@example.com',
            'password': 'TestPassword123!',
            'first_name': 'John',
            'last_name': 'Doe',
        },
        {
            'username': 'jane_smith',
            'email': 'jane.smith@example.com',
            'password': 'TestPassword123!',
            'first_name': 'Jane',
            'last_name': 'Smith',
        },
        {
            'username': 'test_user',
            'email': 'test@example.com',
            'password': 'test123',
            'first_name': 'Test',
            'last_name': 'User',
        },
    ]
    
    created = []
    existing = []
    
    for user_data in test_users_data:
        email = user_data['email']
        if User.objects.filter(email=email).exists():
            existing.append(email)
            continue
        
        try:
            user = User.objects.create_user(**user_data)
            created.append(email)
        except Exception as e:
            return Response({
                'error': f'Error creating {email}: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    return Response({
        'message': 'Test users created successfully!',
        'created': created,
        'existing': existing,
        'login_info': {
            'john.doe@example.com': 'TestPassword123!',
            'jane.smith@example.com': 'TestPassword123!',
            'test@example.com': 'test123',
        }
    }, status=status.HTTP_200_OK)


@csrf_exempt
@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def populate_patients(request):
    """Endpoint to populate database with 20+ realistic patients"""
    from django.core.management import call_command
    from io import StringIO
    import sys
    
    count = int(request.GET.get('count', 20))
    
    # Capture command output
    old_stdout = sys.stdout
    sys.stdout = StringIO()
    
    try:
        call_command('populate_patients', count=count, verbosity=1)
        output = sys.stdout.getvalue()
        sys.stdout = old_stdout
        
        # Count created patients
        lines = output.split('\n')
        created_count = len([l for l in lines if '✅ Created patient:' in l])
        
        return Response({
            'message': f'Successfully populated {created_count} patients!',
            'count': created_count,
            'output': output,
            'note': 'Check the output field for details. All patients use password: Patient123!'
        }, status=status.HTTP_200_OK)
    except Exception as e:
        sys.stdout = old_stdout
        return Response({
            'error': str(e),
            'output': sys.stdout.getvalue() if hasattr(sys.stdout, 'getvalue') else ''
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

