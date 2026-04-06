import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import OTPInput from "../components/OTPInput";
import { requestOTP, verifyOTPAndReset } from "../services/authService";
import "./SignIn.css";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600);

  useEffect(() => {
    if (!email) {
      navigate("/forgot-password");
    }
  }, [email, navigate]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const handleResend = async () => {
    if (!email || isResending) return;

    setIsResending(true);
    setMessage("");
    setIsError(false);

    try {
      const data = await requestOTP(email);
      setMessage(data.message || "A new OTP has been sent.");
      setTimeLeft(600);
      setOtp("");
    } catch (error) {
      setIsError(true);
      setMessage(error.message || "Failed to resend OTP. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setIsError(true);
      setMessage("Please enter the 6-digit OTP.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setIsError(true);
      setMessage("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      setIsError(true);
      setMessage("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    setMessage("");
    setIsError(false);

    try {
      const data = await verifyOTPAndReset(email, otp, newPassword);
      setMessage(data.message || "Password reset successful!");
      setTimeout(() => navigate("/signin"), 1500);
    } catch (error) {
      setIsError(true);
      setMessage(error.message || "Invalid OTP or expired. Please request a new OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative py-12">
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <Link
          to="/forgot-password"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-all text-sm font-semibold mb-4 group px-2 py-1"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back
        </Link>

        <div className="p-8 sm:p-10 space-y-6 glass-panel rounded-[2rem] shadow-2xl">
          <h1 className="text-3xl font-bold text-center">Set New Password</h1>
          <p className="text-center text-gray-400">
            We've sent a 6-digit OTP to <strong>{email}</strong>
          </p>
          <p className="text-center text-sm text-gray-500">
            OTP expires in {minutes}:{seconds.toString().padStart(2, "0")}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <OTPInput value={otp} onChange={setOtp} onComplete={setOtp} />

            <input
              type="password"
              placeholder="New password (min 6 characters)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-cyan-400/50 focus:bg-white/10 text-white placeholder-gray-500"
            />

            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-cyan-400/50 focus:bg-white/10 text-white placeholder-gray-500"
            />

            <button
              type="submit"
              disabled={isLoading}
              className="w-full neon-button py-3.5 rounded-xl font-bold text-white disabled:opacity-50"
            >
              {isLoading ? "Resetting..." : "Reset Password"}
            </button>

            {message && (
              <p className={`text-sm text-center ${isError ? "text-red-400" : "text-emerald-400"}`}>
                {message}
              </p>
            )}
          </form>

          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending}
              className="text-cyan-400 hover:text-cyan-300 transition-colors disabled:opacity-50"
            >
              {isResending ? "Resending..." : "Resend OTP"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Change email
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;