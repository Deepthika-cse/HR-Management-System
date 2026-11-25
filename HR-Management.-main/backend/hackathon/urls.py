from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    ApiForgotPasswordView, ApiLoginView, ApiLogoutView, ApiMeView,
    ApiOtpRequestView, ApiOtpVerifyView, ApiRegisterView, HealthView,
    EmployeeViewSet
)

# Create router for ViewSets
router = DefaultRouter()
router.register(r'api/employees', EmployeeViewSet, basename='employee')

urlpatterns = [
    path('', HealthView.as_view(), name='health'),
    path('api/login', ApiLoginView.as_view(), name='api_login'),
    path('api/register', ApiRegisterView.as_view(), name='api_register'),
    path('api/forgot-password', ApiForgotPasswordView.as_view(), name='api_forgot_password'),
    path('api/otp/request', ApiOtpRequestView.as_view(), name='api_otp_request'),
    path('api/otp/verify', ApiOtpVerifyView.as_view(), name='api_otp_verify'),
    path('api/home', ApiMeView.as_view(), name='api_home'),
    path('api/logout', ApiLogoutView.as_view(), name='api_logout'),
    
    # Include router URLs for Employee CRUD
    path('', include(router.urls)),
]
