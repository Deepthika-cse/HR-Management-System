from rest_framework import serializers
from .models import Employee
from django.utils import timezone


class EmployeeSerializer(serializers.ModelSerializer):
    """
    Serializer for Employee model with full CRUD support
    """
    full_name = serializers.ReadOnlyField()
    is_active = serializers.ReadOnlyField()
    status = serializers.ReadOnlyField()

    class Meta:
        model = Employee
        fields = [
            'emp_id',
            'first_name',
            'middle_name',
            'last_name',
            'full_name',
            'start_date',
            'end_date',
            'is_active',
            'status'
        ]
        read_only_fields = ['full_name', 'is_active', 'status']

    def validate_emp_id(self, value):
        """
        Validate that emp_id is positive and unique on create
        """
        if value <= 0:
            raise serializers.ValidationError("Employee ID must be a positive number.")
        
        # Check uniqueness only on create (not on update)
        if not self.instance and Employee.objects.filter(emp_id=value).exists():
            raise serializers.ValidationError("An employee with this ID already exists.")
        
        return value

    def validate(self, data):
        """
        Validate that end_date is not before start_date
        """
        start_date = data.get('start_date', self.instance.start_date if self.instance else None)
        end_date = data.get('end_date')

        if end_date and start_date:
            if end_date < start_date:
                raise serializers.ValidationError({
                    'end_date': 'End date cannot be before start date.'
                })

        return data


class EmployeeCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating new employees
    """
    class Meta:
        model = Employee
        fields = [
            'emp_id',
            'first_name',
            'middle_name',
            'last_name',
            'start_date'
        ]

    def validate_emp_id(self, value):
        """
        Validate that emp_id is positive and unique
        """
        if value <= 0:
            raise serializers.ValidationError("Employee ID must be a positive number.")
        
        if Employee.objects.filter(emp_id=value).exists():
            raise serializers.ValidationError("An employee with this ID already exists.")
        
        return value


class EmployeeUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating existing employees
    """
    class Meta:
        model = Employee
        fields = [
            'first_name',
            'middle_name',
            'last_name',
            'start_date'
        ]


class EmployeeExitSerializer(serializers.Serializer):
    """
    Serializer for marking an employee as exited
    """
    end_date = serializers.DateField(required=True)

    def validate_end_date(self, value):
        """
        Validate that end_date is not in the future and not before start_date
        """
        if value > timezone.now().date():
            raise serializers.ValidationError("End date cannot be in the future.")
        
        return value

    def validate(self, data):
        """
        Validate against the employee's start_date
        """
        employee = self.context.get('employee')
        if employee and data['end_date'] < employee.start_date:
            raise serializers.ValidationError({
                'end_date': 'End date cannot be before the employee\'s start date.'
            })
        
        return data


class EmployeeListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for listing employees
    """
    full_name = serializers.ReadOnlyField()
    status = serializers.ReadOnlyField()

    class Meta:
        model = Employee
        fields = [
            'emp_id',
            'full_name',
            'start_date',
            'end_date',
            'status'
        ]


from .models import EmployeeBankDetails, EmployeeCompliance, EmployeeCTC, OnboardingTask, EmployeeDocument

class OnboardingTaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = OnboardingTask
        fields = ['id', 'title', 'description', 'is_completed', 'document_required', 'document_submitted', 'updated_at']

class EmployeeDocumentSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    document_type_display = serializers.CharField(source='get_document_type_display', read_only=True)
    
    class Meta:
        model = EmployeeDocument
        fields = [
            'id', 'document_type', 'document_type_display', 'document_name', 
            'file', 'status', 'status_display', 'uploaded_at', 
            'verified_at', 'remarks'
        ]
        read_only_fields = ['uploaded_at', 'verified_at', 'status']

class EmployeeBankDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmployeeBankDetails
        fields = ['account_number', 'bank_name', 'ifsc_code', 'branch_name']

class EmployeeComplianceSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmployeeCompliance
        fields = ['pan_number', 'aadhaar_number', 'uan_number', 'pf_number']

class EmployeeCTCSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmployeeCTC
        fields = ['id', 'job_role', 'job_level', 'amount', 'effective_date', 'end_date', 'description']

class EmployeeProfileSerializer(serializers.ModelSerializer):
    bank_details = EmployeeBankDetailsSerializer(read_only=True)
    compliance = EmployeeComplianceSerializer(read_only=True)
    ctc_history = EmployeeCTCSerializer(many=True, read_only=True)
    onboarding_tasks = OnboardingTaskSerializer(many=True, read_only=True)
    documents = EmployeeDocumentSerializer(many=True, read_only=True)
    onboarding_progress = serializers.SerializerMethodField()
    full_name = serializers.ReadOnlyField()
    status = serializers.ReadOnlyField()

    class Meta:
        model = Employee
        fields = [
            'emp_id',
            'first_name',
            'middle_name',
            'last_name',
            'full_name',
            'start_date',
            'end_date',
            'status',
            'bank_details',
            'compliance',
            'ctc_history',
            'onboarding_tasks',
            'documents',
            'onboarding_progress'
        ]

    def get_onboarding_progress(self, obj):
        tasks = obj.onboarding_tasks.all()
        if not tasks.exists():
            return 0
        completed = tasks.filter(is_completed=True).count()
        return round((completed / tasks.count()) * 100)
