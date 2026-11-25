import os
import django
import sys

# Setup Django environment
sys.path.append(os.path.join(os.getcwd(), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from hackathon.models import Employee, EmployeeBankDetails, EmployeeCompliance, EmployeeCTC
from django.utils import timezone
from decimal import Decimal

def seed_data():
    # Get or create an employee
    emp, created = Employee.objects.get_or_create(
        emp_id=1001,
        defaults={
            'first_name': 'John',
            'last_name': 'Doe',
            'start_date': '2023-01-01'
        }
    )
    
    if created:
        print(f"Created employee {emp.emp_id}")
    else:
        print(f"Found employee {emp.emp_id}")

    # Add Bank Details
    bank, b_created = EmployeeBankDetails.objects.get_or_create(
        employee=emp,
        defaults={
            'account_number': '1234567890',
            'bank_name': 'Test Bank',
            'ifsc_code': 'TEST0001234',
            'branch_name': 'Main Branch'
        }
    )
    if b_created:
        print("Created bank details")

    # Add Compliance
    compliance, c_created = EmployeeCompliance.objects.get_or_create(
        employee=emp,
        defaults={
            'pan_number': 'ABCDE1234F',
            'aadhaar_number': '123456789012',
            'uan_number': '100012345678',
            'pf_number': 'KN/BNG/1234567/123/1234567'
        }
    )
    if c_created:
        print("Created compliance details")

    # Add CTC History
    EmployeeCTC.objects.get_or_create(
        employee=emp,
        amount=Decimal('500000.00'),
        effective_date='2023-01-01',
        defaults={'description': 'Initial CTC'}
    )
    EmployeeCTC.objects.get_or_create(
        employee=emp,
        amount=Decimal('550000.00'),
        effective_date='2024-01-01',
        defaults={'description': 'Annual Appraisal'}
    )
    EmployeeCTC.objects.get_or_create(
        employee=emp,
        amount=Decimal('600000.00'),
        effective_date='2025-01-01',
        defaults={'description': 'Promotion'}
    )
    print("Seeded CTC history")

if __name__ == '__main__':
    seed_data()
