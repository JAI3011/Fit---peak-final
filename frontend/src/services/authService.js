const API_BASE = "http://localhost:8000/api/v1/auth";

export const requestOTP = async (email) => {
  const response = await fetch(`${API_BASE}/request-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.detail || "Failed to request OTP");
  }
  return data;
};

export const verifyOTPAndReset = async (email, otp, newPassword) => {
  const response = await fetch(`${API_BASE}/verify-otp-and-reset`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp, new_password: newPassword }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.detail || "Failed to verify OTP");
  }
  return data;
};