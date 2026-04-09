import api from './api';

export const requestOTP = async (email) => {
  const response = await api.post('/auth/request-otp', { email });
  return response.data;
};

export const verifyOTPAndReset = async (email, otp, newPassword) => {
  const response = await api.post('/auth/verify-otp-and-reset', {
    email,
    otp,
    new_password: newPassword,
  });
  return response.data;
};