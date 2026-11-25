import urllib.request
import json

def verify_api():
    url = "http://localhost:8000/api/employees/1001/profile/"
    try:
        with urllib.request.urlopen(url) as response:
            if response.getcode() == 200:
                print("API Verification Successful!")
                data = json.loads(response.read().decode())
                print(f"Employee: {data['full_name']}")
                print(f"Bank Details: {data['bank_details']['bank_name'] if data['bank_details'] else 'Missing'}")
                print(f"Compliance: {data['compliance']['pan_number'] if data['compliance'] else 'Missing'}")
                print(f"CTC History Count: {len(data['ctc_history'])}")
                print("CTC Timeline:")
                for ctc in data['ctc_history']:
                    print(f"  - ₹{ctc['amount']} effective {ctc['effective_date']}")
            else:
                print(f"API Verification Failed with status: {response.getcode()}")
    except Exception as e:
        print(f"Error connecting to API: {e}")

if __name__ == '__main__':
    verify_api()
