import os
import django
import sys
import random
from decimal import Decimal

# Setup Django environment
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from hackathon.models import Employee, EmployeeBankDetails, EmployeeCompliance, EmployeeCTC

def generate_mock_bank(name):
    banks = ['HDFC Bank', 'ICICI Bank', 'SBI', 'Axis Bank', 'Kotak Mahindra']
    branches = ['Sector 62, Noida', 'Cyber Hub, Gurgaon', 'Connaught Place, Delhi', 'Whitefield, Bangalore']
    return {
        'bank_name': random.choice(banks),
        'branch_name': random.choice(branches),
        'ifsc_code': f"ABCD000{random.randint(1000, 9999)}",
        'account_number': "".join([str(random.randint(0, 9)) for _ in range(12)])
    }

def generate_mock_compliance(emp_id):
    return {
        'pan_number': f"ABCDE{random.randint(1000, 9999)}F",
        'aadhaar_number': "".join([str(random.randint(0, 9)) for _ in range(12)]),
        'uan_number': f"10{random.randint(10000000, 99999999)}",
        'pf_number': f"UP/MRT/00{random.randint(10000, 99999)}/000/000{random.randint(1000, 9999)}"
    }

def seed_unified_data():
    employees = Employee.objects.all()
    print(f"Starting seed for {employees.count()} employees...")

    for emp in employees:
        print(f"Processing {emp.full_name} ({emp.emp_id})...")

        # 1. Bank Details
        bank, created = EmployeeBankDetails.objects.get_or_create(
            employee=emp,
            defaults=generate_mock_bank(emp.full_name)
        )
        if not created:
            # Optionally update existing
            mock_data = generate_mock_bank(emp.full_name)
            for key, value in mock_data.items():
                setattr(bank, key, value)
            bank.save()

        # 2. Compliance Details
        compliance, created = EmployeeCompliance.objects.get_or_create(
            employee=emp,
            defaults=generate_mock_compliance(emp.emp_id)
        )
        if not created:
            mock_data = generate_mock_compliance(emp.emp_id)
            for key, value in mock_data.items():
                setattr(compliance, key, value)
            compliance.save()

        # 3. CTC History
        if not EmployeeCTC.objects.filter(employee=emp).exists():
            base_ctc = Decimal(random.randint(6, 15)) * Decimal('100000.00')
            
            # Joining CTC
            EmployeeCTC.objects.create(
                employee=emp,
                amount=base_ctc,
                effective_date=emp.start_date,
                description='Joining CTC'
            )
            
            # Appraisal if joined before 2024
            if emp.start_date.year < 2024:
                EmployeeCTC.objects.create(
                    employee=emp,
                    amount=base_ctc * Decimal('1.15'),
                    effective_date='2024-04-01',
                    description='Annual Increment 2024'
                )

    print("Universal seeding complete!")

if __name__ == '__main__':
    seed_unified_data()
