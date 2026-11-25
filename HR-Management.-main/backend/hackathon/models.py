from django.db import models
from django.core.exceptions import ValidationError
from django.utils import timezone


class Employee(models.Model):
    emp_id = models.PositiveIntegerField(primary_key=True, verbose_name="Employee ID")
    first_name = models.CharField(max_length=50, verbose_name="First Name")
    middle_name = models.CharField(max_length=50, blank=True, null=True, verbose_name="Middle Name")
    last_name = models.CharField(max_length=50, verbose_name="Last Name")
    start_date = models.DateField(verbose_name="Start Date")
    end_date = models.DateField(blank=True, null=True, verbose_name="End Date")

    class Meta:
        db_table = 'emp_master'
        verbose_name = "Employee"
        verbose_name_plural = "Employees"
        ordering = ['-start_date', 'emp_id']

    def clean(self):
        super().clean()
        if self.end_date and self.start_date:
            if self.end_date < self.start_date:
                raise ValidationError({'end_date': 'End date cannot be before start date.'})

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    @property
    def full_name(self):
        if self.middle_name:
            return f"{self.first_name} {self.middle_name} {self.last_name}"
        return f"{self.first_name} {self.last_name}"

    @property
    def is_active(self):
        if self.end_date is None:
            return True
        return self.end_date >= timezone.now().date()

    @property
    def status(self):
        return "Active" if self.is_active else "Exited"

    def __str__(self):
        return f"{self.emp_id} - {self.full_name} ({self.status})"


class EmployeeBankDetails(models.Model):
    employee = models.OneToOneField(Employee, on_delete=models.CASCADE, related_name='bank_details', verbose_name="Employee")
    account_number = models.CharField(max_length=20, verbose_name="Account Number")
    bank_name = models.CharField(max_length=100, verbose_name="Bank Name")
    ifsc_code = models.CharField(max_length=20, verbose_name="IFSC Code")
    branch_name = models.CharField(max_length=100, verbose_name="Branch Name")

    class Meta:
        db_table = 'emp_bank_details'
        verbose_name = "Bank Detail"
        verbose_name_plural = "Bank Details"

    def __str__(self):
        return f"{self.employee.emp_id} - {self.bank_name}"


class EmployeeCompliance(models.Model):
    employee = models.OneToOneField(Employee, on_delete=models.CASCADE, related_name='compliance', verbose_name="Employee")
    pan_number = models.CharField(max_length=10, verbose_name="PAN Number")
    aadhaar_number = models.CharField(max_length=12, verbose_name="Aadhaar Number")
    uan_number = models.CharField(max_length=12, blank=True, null=True, verbose_name="UAN Number")
    pf_number = models.CharField(max_length=30, blank=True, null=True, verbose_name="PF Number")

    class Meta:
        db_table = 'emp_compliance'
        verbose_name = "Compliance"
        verbose_name_plural = "Compliance Details"

    def __str__(self):
        return f"{self.employee.emp_id} - Compliance"


class EmployeeCTC(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='ctc_history', verbose_name="Employee")
    job_role = models.CharField(max_length=100, verbose_name="Job Role", default="Associate")
    job_level = models.CharField(max_length=50, verbose_name="Job Level", default="L1")
    amount = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="CTC Amount")
    effective_date = models.DateField(verbose_name="Effective Date")
    end_date = models.DateField(blank=True, null=True, verbose_name="End Date")
    description = models.CharField(max_length=200, blank=True, null=True, verbose_name="Description")

    class Meta:
        db_table = 'emp_ctc_history'
        verbose_name = "CTC & Role Record"
        verbose_name_plural = "CTC & Role History"
        ordering = ['-effective_date']

    def clean(self):
        super().clean()
        if self.end_date and self.effective_date and self.end_date < self.effective_date:
            raise ValidationError({'end_date': 'End date cannot be before effective date.'})
        
        # Overlap Validation
        qs = EmployeeCTC.objects.filter(employee=self.employee).exclude(pk=self.pk)
        
        for record in qs:
            record_end = record.end_date or timezone.now().date() + timezone.timedelta(days=36500)
            self_end = self.end_date or timezone.now().date() + timezone.timedelta(days=36500)
            
            if self.effective_date <= record_end and self_end >= record.effective_date:
                raise ValidationError(f"This record overlaps with an existing record ({record.effective_date} to {record.end_date or 'Present'})")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.employee.emp_id} - {self.job_role} ({self.effective_date})"

class OnboardingTask(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='onboarding_tasks', verbose_name="Employee")
    title = models.CharField(max_length=200, verbose_name="Task Title", default="New Task")
    description = models.TextField(blank=True, null=True, verbose_name="Description", default="")
    is_completed = models.BooleanField(default=False, verbose_name="Is Completed")
    document_required = models.BooleanField(default=False, verbose_name="Document Required")
    document_submitted = models.BooleanField(default=False, verbose_name="Document Submitted")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Last Updated")

    class Meta:
        db_table = 'emp_onboarding_tasks'
        verbose_name = "Onboarding Task"
        verbose_name_plural = "Onboarding Tasks"
        ordering = ['id']

    def __str__(self):
        return f"{self.employee.emp_id} - {self.title} ({'✓' if self.is_completed else '✗'})"

class EmployeeDocument(models.Model):
    DOCUMENT_TYPES = [
        ('AADHAAR', 'Aadhaar Card'),
        ('PAN', 'PAN Card'),
        ('PASSPORT', 'Passport'),
        ('VOTER_ID', 'Voter ID'),
        ('OTHER', 'Other Compliance Document')
    ]
    
    STATUS_CHOICES = [
        ('PENDING', 'Pending Verification'),
        ('VERIFIED', 'Verified'),
        ('REJECTED', 'Rejected')
    ]

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='documents', verbose_name="Employee")
    document_type = models.CharField(max_length=20, choices=DOCUMENT_TYPES, verbose_name="Document Type")
    document_name = models.CharField(max_length=100, verbose_name="Document Name")
    file = models.FileField(upload_to='compliance_docs/', verbose_name="Document File", null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING', verbose_name="Status")
    uploaded_at = models.DateTimeField(auto_now_add=True, verbose_name="Uploaded At")
    verified_at = models.DateTimeField(blank=True, null=True, verbose_name="Verified At")
    remarks = models.TextField(blank=True, null=True, verbose_name="Remarks")

    class Meta:
        db_table = 'emp_documents'
        verbose_name = "Employee Document"
        verbose_name_plural = "Employee Documents"
        ordering = ['-uploaded_at']

    def __str__(self):
        return f"{self.employee.emp_id} - {self.document_type} ({self.status})"
