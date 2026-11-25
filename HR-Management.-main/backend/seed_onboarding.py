import os
import django
import sys

# Setup Django environment
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from hackathon.models import Employee, OnboardingTask

def seed_onboarding_tasks():
    standard_tasks = [
        {"title": "Identity Proof (Aadhaar/PAN)", "description": "Upload scanned copies of Aadhaar and PAN cards.", "document_required": True},
        {"title": "Bank Account Details", "description": "Provide bank account number and IFSC code for salary processing.", "document_required": False},
        {"title": "Educational Certificates", "description": "Upload 10th, 12th and Degree certificates.", "document_required": True},
        {"title": "Previous Employment Relieving Letter", "description": "Upload relieving letter from the last employer.", "document_required": True},
        {"title": "Signed Code of Conduct", "description": "Read and sign the company code of conduct document.", "document_required": True},
    ]

    employees = Employee.objects.all()
    print(f"Seeding onboarding tasks for {employees.count()} employees...")

    for emp in employees:
        if not emp.onboarding_tasks.exists():
            for task_data in standard_tasks:
                OnboardingTask.objects.create(
                    employee=emp,
                    **task_data
                )
            print(f"Created tasks for {emp.full_name}")
        else:
            print(f"Tasks already exist for {emp.full_name}")

    print("Onboarding tasks seeding complete!")

if __name__ == '__main__':
    seed_onboarding_tasks()
