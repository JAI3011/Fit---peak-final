import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { requestOTP } from "../services/authService";
import "./SignIn.css";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const data = await requestOTP(email);
      setMessage(data.message || "OTP sent to your email.");
      setTimeout(() => {
        navigate(`/reset-password?email=${encodeURIComponent(email)}`);
      }, 1200);
    } catch (error) {
      setMessage(error.message || "Something went wrong. Please try again.");
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
          to="/signin"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-all text-sm font-semibold mb-4 group px-2 py-1"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Sign In
        </Link>

        <div className="p-8 sm:p-10 space-y-6 glass-panel rounded-[2rem] shadow-2xl">
          <h1 className="text-3xl font-bold text-center">Reset Password</h1>
          <p className="text-center text-gray-400">
            Enter your email and we'll send you a 6-digit OTP.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-cyan-400/50 focus:bg-white/10 text-white placeholder-gray-500"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="w-full neon-button py-3.5 rounded-xl font-bold text-white disabled:opacity-50"
            >
              {isLoading ? "Sending..." : "Send OTP"}
            </button>
            {message && (
              <p className="text-sm text-center text-red-400">{message}</p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;