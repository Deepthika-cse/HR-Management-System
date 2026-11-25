import json
import re

from django.http import HttpRequest, JsonResponse
from django.views import View

from .auth import (
    ExternalAuthError,
    create_signed_otp_challenge,
    create_signed_session,
    is_success_response,
    load_signed_otp_challenge,
    load_signed_session,
    post_form_json,
    require_env,
)

SYSTEM_NAME = 'isl'
REGISTER_ROLE = 'isl_user'


def _normalize_phone(raw: str) -> str:
    return re.sub(r'\D+', '', (raw or '').strip())


def _get_bearer_token(request: HttpRequest) -> str | None:
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return None

    prefix = 'Bearer '
    if not auth_header.startswith(prefix):
        return None

    token = auth_header[len(prefix) :].strip()
    return token or None


def _get_session_payload(request: HttpRequest) -> dict:
    # return dummy user for no-auth mode
    return {
        'email': 'admin@example.com',
        'display_name': 'Admin User',
        'phone_number': '1234567890'
    }


def _json_body(request: HttpRequest) -> dict:
    if not request.body:
        return {}
    try:
        return json.loads(request.body.decode('utf-8'))
    except json.JSONDecodeError:
        return {}


def _external_error_message(result: dict, default: str) -> str:
    return result.get('error') or result.get('message') or default


def _external_success_message(result: dict) -> str | None:
    message = (result.get('message') or result.get('status') or '').strip()
    return message or None


def _post_external_or_error(
    *,
    url_env: str,
    payload: dict[str, str],
    failure_status: int,
    failure_default_message: str,
) -> tuple[dict | None, JsonResponse | None]:
    try:
        url = require_env(url_env)
    except ExternalAuthError as exc:
        return None, JsonResponse({'error': str(exc)}, status=500)

    try:
        result = post_form_json(url=url, payload=payload)
    except ExternalAuthError as exc:
        return None, JsonResponse({'error': str(exc)}, status=502)

    if not is_success_response(result):
        message = _external_error_message(result, failure_default_message)
        return None, JsonResponse({'error': message}, status=failure_status)

    return result, None


class HealthView(View):
    def get(self, request: HttpRequest) -> JsonResponse:
        return JsonResponse({'status': 'ok'})


class ApiLoginView(View):
    def post(self, request: HttpRequest) -> JsonResponse:
        payload = _json_body(request)
        username_raw = (payload.get('username') or '').strip()
        password = (payload.get('password') or '').strip()

        if not username_raw or not password:
            return JsonResponse({'error': 'Please enter username and password.'}, status=400)

        result, error = _post_external_or_error(
            url_env='LOGIN_THROUGH_PASSWORD_URL',
            payload={
                'email': username_raw,
                'password': password,
                'system_name': SYSTEM_NAME,
            },
            failure_status=401,
            failure_default_message='Invalid username or password.',
        )
        if error:
            return error

        session_payload = {'email': username_raw}
        session_payload.update(result or {})
        raw_token, expires_at = create_signed_session(payload=session_payload)

        return JsonResponse(
            {
                'token': raw_token,
                'expires_at': expires_at.isoformat(),
                'user': {
                    'id': None,
                    'username': username_raw,
                },
            }
        )


class ApiForgotPasswordView(View):
    def post(self, request: HttpRequest) -> JsonResponse:
        payload = _json_body(request)
        email = (payload.get('email') or '').strip()
        password = (payload.get('password') or '').strip()

        if not email or not password:
            return JsonResponse({'error': 'Please enter email and password.'}, status=400)

        result, error = _post_external_or_error(
            url_env='FORGET_PASSWORD_URL',
            payload={
                'email': email,
                'password': password,
                'system_name': SYSTEM_NAME,
            },
            failure_status=400,
            failure_default_message='Unable to reset password.',
        )
        if error:
            return error

        return JsonResponse({'ok': True, 'message': _external_success_message(result or {})})


class ApiRegisterView(View):
    def post(self, request: HttpRequest) -> JsonResponse:
        payload = _json_body(request)
        display_name = (payload.get('display_name') or '').strip()
        email = (payload.get('email') or '').strip()
        phone_number = _normalize_phone(payload.get('phone_number') or '')
        password = (payload.get('password') or '').strip()

        if not display_name or not email or not phone_number or not password:
            return JsonResponse({'error': 'Please fill all required fields.'}, status=400)

        result, error = _post_external_or_error(
            url_env='REGISTER_URL',
            payload={
                'display_name': display_name,
                'email': email,
                'phone_number': phone_number,
                'password': password,
                'system_name': SYSTEM_NAME,
                'role': REGISTER_ROLE,
            },
            failure_status=400,
            failure_default_message='Unable to create account.',
        )
        if error:
            return error

        return JsonResponse({'ok': True, 'message': _external_success_message(result or {})})


class ApiMeView(View):
    def get(self, request: HttpRequest) -> JsonResponse:
        session_payload = _get_session_payload(request)

        email = (session_payload.get('email') or '').strip() or None

        return JsonResponse(
            {
                'user': {
                    'id': None,
                    'username': email,
                },
                'member': {
                    'id': None,
                    'name': session_payload.get('display_name'),
                    'email': email,
                    'phone': session_payload.get('phone_number'),
                },
            }
        )


class ApiLogoutView(View):
    def post(self, request: HttpRequest) -> JsonResponse:
        return JsonResponse({'ok': True})


class ApiOtpRequestView(View):
    def post(self, request: HttpRequest) -> JsonResponse:
        payload = _json_body(request)
        channel = (payload.get('channel') or '').strip().lower()
        phone = _normalize_phone(payload.get('phone') or payload.get('username') or '')
        email = (payload.get('email') or payload.get('username') or '').strip()

        if channel not in {'whatsapp', 'email'}:
            return JsonResponse({'error': 'Invalid OTP channel.'}, status=400)

        if channel == 'whatsapp' and not phone:
            return JsonResponse({'error': 'Please enter mobile number.'}, status=400)
        if channel == 'email' and not email:
            return JsonResponse({'error': 'Please enter email id.'}, status=400)

        identifier = email if channel == 'email' else phone
        result, error = _post_external_or_error(
            url_env='SEND_OTP_URL',
            payload={
                'email': identifier,
                'type': channel,
                'system_name': SYSTEM_NAME,
            },
            failure_status=400,
            failure_default_message='Unable to request key',
        )
        if error:
            return error

        challenge_id, expires_at = create_signed_otp_challenge(email=identifier, channel=channel)
        return JsonResponse({'challenge_id': challenge_id, 'expires_at': expires_at.isoformat()})


class ApiOtpVerifyView(View):
    def post(self, request: HttpRequest) -> JsonResponse:
        payload = _json_body(request)
        challenge_id = payload.get('challenge_id')
        otp = (payload.get('otp') or '').strip()

        if not challenge_id or not otp:
            return JsonResponse({'error': 'Please enter OTP.'}, status=400)

        try:
            otp_payload = load_signed_otp_challenge(str(challenge_id))
        except ExternalAuthError as exc:
            return JsonResponse({'error': str(exc)}, status=401)

        email = (otp_payload.get('email') or '').strip()
        result, error = _post_external_or_error(
            url_env='VERIFY_OTP_URL',
            payload={
                'email': email,
                'otp': otp,
                'system_name': SYSTEM_NAME,
            },
            failure_status=401,
            failure_default_message='Invalid or expired OTP.',
        )
        if error:
            return error

        session_payload = {'email': email}
        session_payload.update(result or {})
        raw_token, expires_at = create_signed_session(payload=session_payload)

        return JsonResponse(
            {
                'token': raw_token,
                'expires_at': expires_at.isoformat(),
                'user': {'id': None, 'username': email},
            }
        )


# ============================================================================
# Employee CRUD Management ViewSet
# ============================================================================

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Employee
from .serializers import (
    EmployeeSerializer,
    EmployeeCreateSerializer,
    EmployeeUpdateSerializer,
    EmployeeExitSerializer,
    EmployeeListSerializer,
    EmployeeProfileSerializer,
    OnboardingTaskSerializer
)


class EmployeeViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Employee CRUD operations.
    
    Endpoints:
    - GET /api/employees/ - List all employees
    - GET /api/employees/{emp_id}/ - Retrieve single employee
    - POST /api/employees/ - Create new employee
    - PUT /api/employees/{emp_id}/ - Update employee
    - PATCH /api/employees/{emp_id}/ - Partial update employee
    - DELETE /api/employees/{emp_id}/ - Delete employee
    - POST /api/employees/{emp_id}/exit/ - Mark employee as exited
    """
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    lookup_field = 'emp_id'
    # permission_classes = [IsAuthenticated]  # Uncomment when auth is needed

    def get_serializer_class(self):
        """
        Return appropriate serializer based on action
        """
        if self.action == 'create':
            return EmployeeCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return EmployeeUpdateSerializer
        elif self.action == 'list':
            return EmployeeListSerializer
        elif self.action == 'exit':
            return EmployeeExitSerializer
        return EmployeeSerializer

    def get_queryset(self):
        """
        Filter employees based on query parameters
        """
        queryset = Employee.objects.all()
        
        # Filter by status (active/exited)
        status_filter = self.request.query_params.get('status', None)
        if status_filter == 'active':
            queryset = queryset.filter(end_date__isnull=True)
        elif status_filter == 'exited':
            queryset = queryset.filter(end_date__isnull=False)
        
        # Search by name
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                first_name__icontains=search
            ) | queryset.filter(
                last_name__icontains=search
            )
        
        return queryset

    def create(self, request, *args, **kwargs):
        """
        Create a new employee
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        # Return full employee data
        employee = Employee.objects.get(emp_id=serializer.data['emp_id'])
        response_serializer = EmployeeSerializer(employee)
        
        return Response(
            response_serializer.data,
            status=status.HTTP_201_CREATED
        )

    def update(self, request, *args, **kwargs):
        """
        Update an existing employee
        """
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        # Return full employee data
        employee = Employee.objects.get(emp_id=instance.emp_id)
        response_serializer = EmployeeSerializer(employee)
        
        return Response(response_serializer.data)

    @action(detail=True, methods=['post'], url_path='exit')
    def exit(self, request, emp_id=None):
        """
        Mark an employee as exited by setting end_date
        
        POST /api/employees/{emp_id}/exit/
        Body: { "end_date": "2026-02-25" }
        """
        employee = self.get_object()
        
        if employee.end_date:
            return Response(
                {'error': 'Employee has already exited.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = self.get_serializer(
            data=request.data,
            context={'employee': employee}
        )
        serializer.is_valid(raise_exception=True)
        
        employee.end_date = serializer.validated_data['end_date']
        employee.save()
        
        response_serializer = EmployeeSerializer(employee)
        return Response(
            {
                'message': 'Employee exited successfully.',
                'employee': response_serializer.data
            },
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=['get'], url_path='stats')
    def stats(self, request):
        """
        Get employee statistics
        
        GET /api/employees/stats/
        """
        total_employees = Employee.objects.count()
        active_employees = Employee.objects.filter(end_date__isnull=True).count()
        exited_employees = Employee.objects.filter(end_date__isnull=False).count()
        
        return Response({
            'total': total_employees,
            'active': active_employees,
            'exited': exited_employees
        })

    @action(detail=True, methods=['get'], url_path='profile')
    def profile(self, request, emp_id=None):
        """
        Get unified employee profile
        
        GET /api/employees/{emp_id}/profile/
        """
        employee = self.get_object()
        serializer = EmployeeProfileSerializer(employee)
        return Response(serializer.data)

    @action(detail=True, methods=['post', 'put', 'patch'], url_path='bank-details')
    def bank_details(self, request, emp_id=None):
        """
        Update or create bank details for an employee
        """
        employee = self.get_object()
        from .models import EmployeeBankDetails
        from .serializers import EmployeeBankDetailsSerializer
        
        bank_details, created = EmployeeBankDetails.objects.get_or_create(employee=employee)
        serializer = EmployeeBankDetailsSerializer(bank_details, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    @action(detail=True, methods=['post', 'put', 'patch'], url_path='compliance')
    def compliance(self, request, emp_id=None):
        """
        Update or create compliance details for an employee
        """
        employee = self.get_object()
        from .models import EmployeeCompliance
        from .serializers import EmployeeComplianceSerializer
        
        compliance, created = EmployeeCompliance.objects.get_or_create(employee=employee)
        serializer = EmployeeComplianceSerializer(compliance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='ctc-history')
    def add_ctc_record(self, request, emp_id=None):
        """
        Add a new CTC history record
        """
        employee = self.get_object()
        from .serializers import EmployeeCTCSerializer
        
        serializer = EmployeeCTCSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(employee=employee)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get', 'post'], url_path='onboarding')
    def onboarding(self, request, emp_id=None):
        """
        Get or update onboarding tasks for an employee
        """
        employee = self.get_object()
        from .models import OnboardingTask
        
        if request.method == 'POST':
            task_id = request.data.get('id')
            if task_id:
                task = OnboardingTask.objects.get(id=task_id, employee=employee)
                serializer = OnboardingTaskSerializer(task, data=request.data, partial=True)
                serializer.is_valid(raise_exception=True)
                serializer.save()
                return Response(serializer.data)
            else:
                serializer = OnboardingTaskSerializer(data=request.data)
                serializer.is_valid(raise_exception=True)
                serializer.save(employee=employee)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        tasks = OnboardingTask.objects.filter(employee=employee)
        serializer = OnboardingTaskSerializer(tasks, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='onboarding-stats')
    def onboarding_stats(self, request):
        """
        Get onboarding statistics/progress for all employees (HR View)
        """
        employees = Employee.objects.all()
        stats = []
        for emp in employees:
            total = emp.onboarding_tasks.count()
            completed = emp.onboarding_tasks.filter(is_completed=True).count()
            progress = round((completed / total) * 100) if total > 0 else 0
            stats.append({
                'emp_id': emp.emp_id,
                'full_name': emp.full_name,
                'total_tasks': total,
                'completed_tasks': completed,
                'progress': progress
            })
        return Response(stats)

    @action(detail=True, methods=['get', 'post'], url_path='documents')
    def documents(self, request, emp_id=None):
        """
        List or upload documents for an employee
        """
        employee = self.get_object()
        from .models import EmployeeDocument
        from .serializers import EmployeeDocumentSerializer
        
        if request.method == 'POST':
            serializer = EmployeeDocumentSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            serializer.save(employee=employee)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        documents = EmployeeDocument.objects.filter(employee=employee)
        serializer = EmployeeDocumentSerializer(documents, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'], url_path='documents/(?P<doc_id>[^/.]+)/verify')
    def verify_document(self, request, emp_id=None, doc_id=None):
        """
        Verify or reject a document
        """
        employee = self.get_object()
        from .models import EmployeeDocument
        from .serializers import EmployeeDocumentSerializer
        from django.utils import timezone
        
        try:
            document = EmployeeDocument.objects.get(id=doc_id, employee=employee)
        except EmployeeDocument.DoesNotExist:
            return Response({'error': 'Document not found'}, status=status.HTTP_404_NOT_FOUND)
            
        new_status = request.data.get('status')
        if new_status not in ['VERIFIED', 'REJECTED']:
            return Response({'error': 'Invalid status. Use VERIFIED or REJECTED.'}, status=status.HTTP_400_BAD_REQUEST)
            
        document.status = new_status
        if new_status == 'VERIFIED':
            document.verified_at = timezone.now()
        else:
            document.verified_at = None
            
        document.remarks = request.data.get('remarks', document.remarks)
        document.save()
        
        serializer = EmployeeDocumentSerializer(document)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='compliance-stats')
    def compliance_stats(self, request):
        """
        Get compliance statistics for HR Dashboard
        """
        from .models import EmployeeDocument
        from django.db.models import Count, Q
        
        employees = Employee.objects.all()
        results = []
        
        total_verified = EmployeeDocument.objects.filter(status='VERIFIED').count()
        total_pending = EmployeeDocument.objects.filter(status='PENDING').count()
        
        for emp in employees:
            docs = emp.documents.all()
            pan = docs.filter(document_type='PAN').first()
            aadhaar = docs.filter(document_type='AADHAAR').first()
            
            missing = []
            if not pan: missing.append('PAN')
            if not aadhaar: missing.append('AADHAAR')
            
            pending_count = docs.filter(status='PENDING').count()
            
            results.append({
                'emp_id': emp.emp_id,
                'full_name': emp.full_name,
                'status': emp.status,
                'pan_status': pan.status if pan else 'MISSING',
                'aadhaar_status': aadhaar.status if aadhaar else 'MISSING',
                'pending_verifications': pending_count,
                'missing_docs': missing,
                'compliance_score': 100 if (pan and pan.status == 'VERIFIED' and aadhaar and aadhaar.status == 'VERIFIED') else 50 if (pan or aadhaar) else 0
            })
            
        return Response({
            'metrics': {
                'verified_total': total_verified,
                'pending_total': total_pending,
                'employees_missing_docs': len([r for r in results if r['missing_docs']]),
            },
            'employees': results
        })

    @action(detail=False, methods=['get'], url_path='alerts')
    def get_alerts(self, request):
        """
        Get all compliance alerts (missing records + pending verifications)
        """
        from .models import EmployeeDocument
        employees = Employee.objects.all()
        alerts = []
        
        for emp in employees:
            docs = emp.documents.all()
            pan = docs.filter(document_type='PAN').first()
            aadhaar = docs.filter(document_type='AADHAAR').first()
            
            # Missing Document Alerts
            if not pan:
                alerts.append({
                    'id': f'missing_pan_{emp.emp_id}',
                    'type': 'MISSING_DOC',
                    'priority': 'HIGH',
                    'employee_id': emp.emp_id,
                    'employee_name': emp.full_name,
                    'message': 'PAN Card is missing',
                    'created_at': emp.start_date.isoformat() if emp.start_date else None
                })
            
            if not aadhaar:
                alerts.append({
                    'id': f'missing_aadhaar_{emp.emp_id}',
                    'type': 'MISSING_DOC',
                    'priority': 'HIGH',
                    'employee_id': emp.emp_id,
                    'employee_name': emp.full_name,
                    'message': 'Aadhaar Card is missing',
                    'created_at': emp.start_date.isoformat() if emp.start_date else None
                })
                
            # Pending Verification Alerts
            pending_docs = docs.filter(status='PENDING')
            for doc in pending_docs:
                alerts.append({
                    'id': f'pending_verify_{doc.id}',
                    'type': 'PENDING_VERIFICATION',
                    'priority': 'MEDIUM',
                    'employee_id': emp.emp_id,
                    'employee_name': emp.full_name,
                    'message': f'Pending verification: {doc.document_name}',
                    'created_at': doc.uploaded_at.isoformat() if doc.uploaded_at else None
                })
                
        # Sort by priority and date
        priority_map = {'HIGH': 0, 'MEDIUM': 1, 'LOW': 2}
        alerts.sort(key=lambda x: (priority_map.get(x['priority'], 9), x['created_at'] or ''))
        
        return Response(alerts)

