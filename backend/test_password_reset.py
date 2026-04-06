import os

import pytest
import requests

BASE_URL = "http://localhost:8000/api/v1/auth"
TEST_EMAIL = "admin@fitpeak.com"
NEW_PASSWORD = "NewSecurePassword123"

def test_password_reset_flow():
    print("--- Starting OTP Password Reset Flow Test ---")

    otp = os.getenv("TEST_RESET_OTP")
    if not otp:
        pytest.skip("Set TEST_RESET_OTP to run this integration test without interactive input.")
    
    # 1. Request OTP
    print(f"\n[1] Requesting OTP for {TEST_EMAIL}...")
    response = requests.post(f"{BASE_URL}/request-otp", json={"email": TEST_EMAIL})
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    
    if response.status_code != 200:
        print("\n[FAILED] OTP request failed.")
        return

    print(f"\n[2] Verifying OTP and resetting password for {TEST_EMAIL}...")
    response = requests.post(
        f"{BASE_URL}/verify-otp-and-reset",
        json={"email": TEST_EMAIL, "otp": otp, "new_password": NEW_PASSWORD},
    )
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")

    if response.status_code == 200:
        print("\n[SUCCESS] OTP reset flow completed.")
    else:
        print("\n[FAILED] OTP verification/reset failed.")

if __name__ == "__main__":
    test_password_reset_flow()
