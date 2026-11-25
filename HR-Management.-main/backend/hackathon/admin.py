from django.contrib import admin
from .models import Employee, EmployeeBankDetails, EmployeeCompliance, EmployeeCTC

@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ('emp_id', 'first_name', 'last_name', 'start_date', 'end_date', 'status')
    search_fields = ('emp_id', 'first_name', 'last_name')

@admin.register(EmployeeBankDetails)
class EmployeeBankDetailsAdmin(admin.ModelAdmin):
    list_display = ('employee', 'bank_name', 'account_number', 'ifsc_code')
    search_fields = ('employee__emp_id', 'bank_name')

@admin.register(EmployeeCompliance)
class EmployeeComplianceAdmin(admin.ModelAdmin):
    list_display = ('employee', 'pan_number', 'aadhaar_number')
    search_fields = ('employee__emp_id', 'pan_number', 'aadhaar_number')
#hgjtjtj
@admin.register(EmployeeCTC)
class EmployeeCTCAdmin(admin.ModelAdmin):
    list_display = ('employee', 'amount', 'effective_date')
    search_fields = ('employee__emp_id',)
    list_filter = ('effective_date',)
