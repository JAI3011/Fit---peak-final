import { useRef, useState } from "react";

const OTPInput = ({ length = 6, value = "", onChange, onComplete }) => {
  const [internalOtp, setInternalOtp] = useState(new Array(length).fill(""));
  const inputs = useRef([]);

  const controlledOtp = value
    .replace(/\D/g, "")
    .slice(0, length)
    .split("");

  const normalizedControlledOtp = Array.from({ length }, (_, index) => controlledOtp[index] || "");

  const otp = onChange ? normalizedControlledOtp : internalOtp;

  const updateOtp = (nextOtpArray) => {
    if (onChange) {
      onChange(nextOtpArray.join(""));
    } else {
      setInternalOtp(nextOtpArray);
    }

    const completeOtp = nextOtpArray.join("");
    if (completeOtp.length === length && !completeOtp.includes("")) {
      onComplete?.(completeOtp);
    }
  };

  const handleChange = (element, index) => {
    const value = element.value.replace(/\D/g, "");
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    updateOtp(newOtp);

    if (value && index < length - 1) {
      inputs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  return (
    <div className="flex justify-center gap-2">
      {otp.map((digit, idx) => (
        <input
          key={idx}
          type="text"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(e.target, idx)}
          onKeyDown={(e) => handleKeyDown(e, idx)}
          ref={(el) => (inputs.current[idx] = el)}
          className="w-12 h-12 text-center text-xl bg-white/5 border border-white/10 rounded-xl outline-none focus:border-cyan-400/50 focus:bg-white/10 text-white"
        />
      ))}
    </div>
  );
};

export default OTPInput;