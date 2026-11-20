from django.conf import settings
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from django.utils.encoding import force_bytes

from .models import User
from .email_utils import send_password_reset_email, send_welcome_email
from .serializers import (
    EmailTokenObtainPairSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
    UserProfileSerializer,
    UserRegistrationSerializer,
    UserSerializer,
)

password_reset_token_generator = PasswordResetTokenGenerator()


class UserRegistrationView(generics.CreateAPIView):
    """View for user registration."""

    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        send_welcome_email(user)

        return Response(
            {
                "user": UserSerializer(user, context={"request": request}).data,
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            },
            status=status.HTTP_201_CREATED,
        )


class EmailTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer


class UserLoginView(APIView):
    """Legacy login endpoint kept for compatibility."""

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = EmailTokenObtainPairSerializer(
            data=request.data,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data, status=status.HTTP_200_OK)


class UserProfileView(generics.RetrieveUpdateAPIView):
    """View for user profile."""

    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class PasswordResetRequestView(APIView):
    """Send a password reset email if the account exists."""

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"]
        user = User.objects.filter(email__iexact=email).first()

        if user:
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = password_reset_token_generator.make_token(user)
            reset_url = (
                f"{settings.FRONTEND_BASE_URL}/reset-password"
                f"?uid={uid}&token={token}"
            )
            send_password_reset_email(user, reset_url)

        return Response(
            {
                "message": (
                    "Si un compte existe avec cet email, un message de reinitialisation "
                    "a ete envoye."
                )
            },
            status=status.HTTP_200_OK,
        )


class PasswordResetConfirmView(APIView):
    """Reset a password from a secure uid/token pair."""

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        uid = serializer.validated_data["uid"]
        token = serializer.validated_data["token"]

        try:
            user_id = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_id)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response(
                {"detail": "Lien de reinitialisation invalide."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not password_reset_token_generator.check_token(user, token):
            return Response(
                {"detail": "Lien de reinitialisation invalide ou expire."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(serializer.validated_data["new_password"])
        user.save(update_fields=["password"])

        return Response(
            {"message": "Votre mot de passe a ete reinitialise avec succes."},
            status=status.HTTP_200_OK,
        )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """JWT logout is handled client-side by deleting stored tokens."""

    return Response({"message": "Deconnexion reussie."})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def current_user_view(request):
    """View to get current user information."""

    serializer = UserSerializer(request.user, context={"request": request})
    return Response(serializer.data)
