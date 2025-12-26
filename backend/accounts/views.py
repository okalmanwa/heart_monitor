from rest_framework import status, generics, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.core.mail import send_mail
from django.conf import settings
from django.utils.crypto import get_random_string
from django.utils import timezone
from datetime import timedelta
from .serializers import UserRegistrationSerializer, UserSerializer
from .models import User
from django.contrib.auth import get_user_model

User = get_user_model()

# Simple in-memory token storage (use Redis or database in production)
password_reset_tokens = {}


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


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_check(request):
    """Check if user is admin (staff or superuser)"""
    return Response({
        'is_admin': request.user.is_staff or request.user.is_superuser,
        'is_superuser': request.user.is_superuser,
        'is_staff': request.user.is_staff,
    })


class UserProfileUpdateView(generics.UpdateAPIView):
    """Update user profile"""
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class AdminUserViewSet(viewsets.ModelViewSet):
    """Admin ViewSet for managing all users"""
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    queryset = User.objects.all()

    def get_permissions(self):
        """Only staff/superusers can access"""
        if self.action in ['list', 'retrieve', 'create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return super().get_permissions()

    def list(self, request):
        """List all users"""
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def create(self, request):
        """Create a new user"""
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, pk=None):
        """Update a user"""
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({'detail': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        # Update password if provided
        if 'password' in request.data:
            password = request.data.pop('password')
            user.set_password(password)
            user.save()

        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def request_password_reset(request):
    """Request password reset - sends email with reset token"""
    email = request.data.get('email')
    
    if not email:
        return Response(
            {'error': 'Email is required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        # Don't reveal if email exists for security
        return Response(
            {'message': 'If an account exists with this email, a password reset link has been sent.'},
            status=status.HTTP_200_OK
        )
    
    # Generate reset token
    token = get_random_string(32)
    expires_at = timezone.now() + timedelta(hours=1)
    
    # Store token (in production, use database or Redis)
    password_reset_tokens[token] = {
        'user_id': user.id,
        'email': user.email,
        'expires_at': expires_at,
    }
    
    # Create reset link
    reset_link = f"{getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')}/reset-password?token={token}"
    
    # Send email
    subject = "Password Reset Request - Cardiac Monitor"
    message = f"""
Hello {user.first_name or user.username},

You requested a password reset for your Cardiac Monitor account.

Click the link below to reset your password:
{reset_link}

This link will expire in 1 hour.

If you didn't request this, please ignore this email.

Stay healthy!
The Cardiac Monitor Team
    """
    
    try:
        import logging
        logger = logging.getLogger(__name__)
        
        # Log email configuration
        logger.info(f"Email Configuration:")
        logger.info(f"  Backend: {settings.EMAIL_BACKEND}")
        logger.info(f"  Host: {settings.EMAIL_HOST}")
        logger.info(f"  Port: {settings.EMAIL_PORT}")
        logger.info(f"  Use TLS: {settings.EMAIL_USE_TLS}")
        logger.info(f"  From: {settings.DEFAULT_FROM_EMAIL}")
        logger.info(f"  Host User: {settings.EMAIL_HOST_USER if settings.EMAIL_HOST_USER else '(not set)'}")
        logger.info(f"  Host Password: {'(set)' if settings.EMAIL_HOST_PASSWORD else '(not set)'}")
        
        logger.info(f"Sending password reset email to {user.email}")
        logger.info(f"Reset link: {reset_link}")
        
        send_mail(
            subject,
            message.strip(),
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
        )
        
        logger.info(f"Password reset email sent successfully to {user.email}")
        
        # If using console backend, include reset link in response for development
        response_data = {
            'message': 'If an account exists with this email, a password reset link has been sent.'
        }
        
        if 'console' in settings.EMAIL_BACKEND.lower():
            # In development, include the reset link in the response
            response_data['dev_reset_link'] = reset_link
            response_data['dev_message'] = 'Email backend is set to console. Check your Django server terminal for the email. The reset link is also included in this response for development.'
            logger.warning("EMAIL_BACKEND is set to console - email was printed to terminal, not sent!")
            logger.warning(f"Reset link: {reset_link}")
        else:
            logger.info(f"Email sent via SMTP to {user.email}")
        
        return Response(response_data, status=status.HTTP_200_OK)
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        error_msg = str(e)
        logger.error(f"Failed to send password reset email: {error_msg}", exc_info=True)
        
        # Provide more helpful error messages
        if 'authentication failed' in error_msg.lower() or 'invalid credentials' in error_msg.lower():
            error_msg = 'Email authentication failed. Please check your EMAIL_HOST_USER and EMAIL_HOST_PASSWORD in .env file.'
        elif 'connection' in error_msg.lower() or 'timeout' in error_msg.lower():
            error_msg = 'Could not connect to email server. Please check your EMAIL_HOST and EMAIL_PORT settings.'
        
        return Response(
            {'error': f'Failed to send email: {error_msg}. Please check server logs and email configuration.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@csrf_exempt
@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def test_email_config(request):
    """Test endpoint to verify email configuration"""
    import logging
    logger = logging.getLogger(__name__)
    
    email_config = {
        'EMAIL_BACKEND': settings.EMAIL_BACKEND,
        'EMAIL_HOST': settings.EMAIL_HOST,
        'EMAIL_PORT': settings.EMAIL_PORT,
        'EMAIL_USE_TLS': settings.EMAIL_USE_TLS,
        'DEFAULT_FROM_EMAIL': settings.DEFAULT_FROM_EMAIL,
        'EMAIL_HOST_USER': settings.EMAIL_HOST_USER if settings.EMAIL_HOST_USER else '(not set)',
        'EMAIL_HOST_PASSWORD': '(set)' if settings.EMAIL_HOST_PASSWORD else '(not set)',
    }
    
    if request.method == 'POST':
        # Try to send a test email
        test_email = request.data.get('email', settings.EMAIL_HOST_USER)
        if not test_email:
            return Response(
                {'error': 'Please provide an email address to send test email to'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            send_mail(
                'Test Email - Cardiac Monitor',
                'This is a test email from Cardiac Monitor. If you receive this, your email configuration is working correctly!',
                settings.DEFAULT_FROM_EMAIL,
                [test_email],
                fail_silently=False,
            )
            return Response({
                'message': f'Test email sent successfully to {test_email}!',
                'config': email_config
            }, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Test email failed: {str(e)}", exc_info=True)
            return Response({
                'error': f'Failed to send test email: {str(e)}',
                'config': email_config
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    return Response({
        'message': 'Email configuration check',
        'config': email_config,
        'note': 'Send POST request with {"email": "your@email.com"} to test email sending'
    }, status=status.HTTP_200_OK)


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password(request):
    """Reset password using token"""
    token = request.data.get('token')
    new_password = request.data.get('password')
    
    if not token or not new_password:
        return Response(
            {'error': 'Token and password are required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Validate token
    if token not in password_reset_tokens:
        return Response(
            {'error': 'Invalid or expired reset token'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    token_data = password_reset_tokens[token]
    
    # Check if token expired
    if timezone.now() > token_data['expires_at']:
        del password_reset_tokens[token]
        return Response(
            {'error': 'Reset token has expired. Please request a new one.'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        user = User.objects.get(id=token_data['user_id'])
        
        # Validate password
        from django.contrib.auth.password_validation import validate_password
        try:
            validate_password(new_password, user)
        except Exception as e:
            return Response(
                {'error': 'Password does not meet requirements: ' + ', '.join(e.messages)},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Set new password
        user.set_password(new_password)
        user.save()
        
        # Delete used token
        del password_reset_tokens[token]
        
        return Response(
            {'message': 'Password has been reset successfully. You can now login with your new password.'},
            status=status.HTTP_200_OK
        )
    except User.DoesNotExist:
        return Response(
            {'error': 'User not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )

