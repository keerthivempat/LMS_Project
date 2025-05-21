export const generateOTP = () => {
  // Generate a 6-digit OTP
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const isOTPExpired = (otpCreatedAt) => {
  if (!otpCreatedAt) return true;
  
  // OTP expires after 5 minutes (300000 milliseconds)
  const expiryTime = new Date(otpCreatedAt.getTime() + 300000);
  return new Date() > expiryTime;
};

export const canResendOTP = (otpCreatedAt) => {
  if (!otpCreatedAt) return true;
  
  // Can resend OTP after 2 minutes (120000 milliseconds)
  const resendTime = new Date(otpCreatedAt.getTime() + 120000);
  return new Date() > resendTime;
};
