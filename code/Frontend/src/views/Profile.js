"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Pencil, Check, X, User, Mail, Key, Shield, AtSign, Camera, AlertCircle } from "lucide-react"
import HeadingWithEffect from "../components/HeadingWithEffects"
import LoadingSpinner from "../components/LoadingSpinner"
import GlitchText from "../components/GlitchText"
import ErrorMessage from "../components/ErrorMessage"
import { DEFAULT_AVATARS, getAvatarUrl, getInitials, getColorForName, CUSTOM_AVATARS } from "../constants/avatars"

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    name: "",
    username: "",
    email: "",
    role: "",
    avatarIndex: 0,
    hasCustomAvatar: false
  })
  
  const [isEditing, setIsEditing] = useState(false)
  const [isEditingPassword, setIsEditingPassword] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordError, setPasswordError] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [showAvatarSelector, setShowAvatarSelector] = useState(false)
  const [selectedAvatarIndex, setSelectedAvatarIndex] = useState(0)
  const [newImage, setNewImage] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })
  
  const fileInputRef = useRef(null)

  // Update the state to include OTP-related states
  const [passwordChangeStep, setPasswordChangeStep] = useState('request') // 'request', 'verify', 'success'
  const [otpData, setOtpData] = useState({
    otp: '',
    expiryTime: null,
    resendTimer: 0
  })
  const [otpTimer, setOtpTimer] = useState(300) // 5 minutes in seconds
  const otpTimerRef = useRef(null)
  const resendTimerRef = useRef(null)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${process.env.REACT_APP_BACKEND}/api/users/profile`, {
        method: "GET",
        headers: {
          authorization: `Bearer ${localStorage.getItem("accessToken")}`
        },
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch profile")
      }

      const data = await response.json()
      // console.log("Profile data:", data.data) // Debug
      setIsError(false)
      setProfile(data.data)
      setSelectedAvatarIndex(data.data.avatarIndex || 0)
      setIsLoading(false)
    } catch (err) {
      console.error("Profile fetch error:", err.message)
      setIsError(true)
      setIsLoading(false)
    }
  }

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    })
  }

  const toggleAvatarSelector = () => {
    setShowAvatarSelector(!showAvatarSelector)
    if (!showAvatarSelector) {
      setSelectedAvatarIndex(profile.avatarIndex || 0)
    }
  }

  const selectAvatar = (index) => {
    setSelectedAvatarIndex(index)
  }

  const saveAvatar = async () => {
    try {
      setIsSaving(true)
      // console.log("Saving avatar with index:", selectedAvatarIndex);
      
      const response = await fetch(`${process.env.REACT_APP_BACKEND}/api/users/avatar`, {
        method: "PATCH",
        headers: {
          authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          avatarIndex: selectedAvatarIndex,
          hasCustomAvatar: true  // User has chosen a custom avatar
        }),
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to update avatar")
      }

      // Refresh the profile data instead of just updating state
      await fetchProfile()
      
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
      setShowAvatarSelector(false)
    } catch (err) {
      console.error(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdateProfile = async () => {
    try {
      setIsSaving(true)
      const response = await fetch(`${process.env.REACT_APP_BACKEND}/api/auth/me`, {
        method: "PUT",
        headers: {
          authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: profile.name,
          username: profile.username,
        }),
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to update profile")
      }

      const data = await response.json()
      setProfile((prev) => ({
        ...prev,
        name: data.data.name,
        username: data.data.username,
      }))
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
      setIsEditing(false)
    } catch (err) {
      console.error(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const cancelEditing = () => {
    setIsEditing(false)
    setNewImage(null) // Reset any image changes
  }

  const isStrongPassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return (
      password.length >= minLength &&
      hasUpperCase &&
      hasLowerCase &&
      hasNumbers &&
      hasSpecialChar
    );
  };

  // Replace handlePasswordChange with OTP-based flow
  const handleInitiatePasswordChange = async () => {
    try {
      setIsChangingPassword(true);
      setPasswordError('');
      
      const response = await fetch(`${process.env.REACT_APP_BACKEND}/api/users/initiate-password-change`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to request OTP');
      }
      
      // Set OTP expiry time
      const expiryTime = new Date(data.data.otpExpiry);
      setOtpData({
        ...otpData,
        expiryTime
      });
      
      // Start countdown timer for OTP expiry
      const totalSeconds = Math.floor((expiryTime - new Date()) / 1000);
      setOtpTimer(totalSeconds);
      
      // Start timer for allowing resend (2 minutes)
      setOtpData(prev => ({
        ...prev,
        resendTimer: 120 // 2 minutes
      }));
      
      // Move to verification step
      setPasswordChangeStep('verify');
      
    } catch (error) {
      setPasswordError(error.message);
    } finally {
      setIsChangingPassword(false);
    }
  };
  
  // Handle OTP verification and password change
  const handleVerifyOTPAndChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("Passwords don't match");
      return;
    }

    if (!isStrongPassword(passwordData.newPassword)) {
      setPasswordError(
        'Password must be at least 8 characters long and contain uppercase, lowercase, numbers, and special characters'
      );
      return;
    }
    
    if (!otpData.otp) {
      setPasswordError('Please enter the OTP sent to your email');
      return;
    }

    try {
      setIsChangingPassword(true);
      const response = await fetch(`${process.env.REACT_APP_BACKEND}/api/users/verify-otp-change-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          otp: otpData.otp,
          newPassword: passwordData.newPassword
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to verify OTP');
      }

      // Clear timers
      if (otpTimerRef.current) clearInterval(otpTimerRef.current);
      if (resendTimerRef.current) clearInterval(resendTimerRef.current);
      
      // Reset form and show success
      setPasswordChangeStep('success');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setOtpData({
        otp: '',
        expiryTime: null,
        resendTimer: 0
      });
      
      // Close modal after delay
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordChangeStep('request');
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }, 2000);

    } catch (error) {
      setPasswordError(error.message);
    } finally {
      setIsChangingPassword(false);
    }
  };
  
  // Handle resend OTP
  const handleResendOTP = async () => {
    try {
      setIsChangingPassword(true);
      const response = await fetch(`${process.env.REACT_APP_BACKEND}/api/users/resend-password-change-otp`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend OTP');
      }
      
      // Update OTP expiry time
      const expiryTime = new Date(data.data.otpExpiry);
      setOtpData({
        ...otpData,
        expiryTime,
        resendTimer: 120 // Reset resend timer to 2 minutes
      });
      
      // Reset and restart timers
      setOtpTimer(300); // 5 minutes
      
    } catch (error) {
      setPasswordError(error.message);
    } finally {
      setIsChangingPassword(false);
    }
  };
  
  // Format seconds to MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Setup timers when OTP is requested
  useEffect(() => {
    if (passwordChangeStep === 'verify' && otpData.expiryTime) {
      // Start OTP expiry timer
      otpTimerRef.current = setInterval(() => {
        setOtpTimer(prev => {
          if (prev <= 1) {
            clearInterval(otpTimerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      // Start resend timer
      resendTimerRef.current = setInterval(() => {
        setOtpData(prev => ({
          ...prev,
          resendTimer: prev.resendTimer <= 1 ? 0 : prev.resendTimer - 1
        }));
      }, 1000);
      
      // Cleanup timers on unmount
      return () => {
        if (otpTimerRef.current) clearInterval(otpTimerRef.current);
        if (resendTimerRef.current) clearInterval(resendTimerRef.current);
      };
    }
  }, [passwordChangeStep, otpData.expiryTime]);

  const handleImageError = (e) => {
    // If image fails to load, set a fallback
    e.target.src = `https://ui-avatars.com/api/?name=${profile.name?.charAt(0) || 'U'}&background=random&color=fff&size=200&bold=true`;
  }

  const resetToInitialsAvatar = async () => {
    try {
      setIsSaving(true)
      const response = await fetch(`${process.env.REACT_APP_BACKEND}/api/users/avatar`, {
        method: "PATCH",
        headers: {
          authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          avatarIndex: 0,
          hasCustomAvatar: false
        }),
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to update avatar")
      }

      // Refresh the profile data
      await fetchProfile()
      
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
      setShowAvatarSelector(false)
    } catch (err) {
      console.error(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  // Update the getCurrentAvatarUrl function to work with the array indices directly
  const getCurrentAvatarUrl = () => {
    if (profile.hasCustomAvatar) {
      // console.log("Using custom avatar with index:", profile.avatarIndex);
      return CUSTOM_AVATARS[profile.avatarIndex];
    } else {
      // Generate initials-based avatar
      // console.log("Using initials for:", profile.name);
      const initials = getInitials(profile.name);
      const color = getColorForName(profile.name);
      return `https://ui-avatars.com/api/?name=${initials}&background=${color}&color=fff&size=200&bold=true&format=png`;
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FFFCF4] flex flex-col items-center justify-center">
        <LoadingSpinner />
        <p className="mt-4 text-[#57321A] font-medium animate-pulse">Loading your profile...</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-[#FFFCF4] flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full text-center"
        >
          <AlertCircle size={64} className="text-red-500 mx-auto mb-4" />
          <GlitchText>Failed To Fetch</GlitchText>
          <p className="text-[#57321A] mt-4">We couldn't load your profile information. Please try again later.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-2 bg-[#EFC815] text-[#57321A] font-medium rounded-md hover:bg-[#57321A] hover:text-white transition-all duration-300"
          >
            Retry
          </button>
        </motion.div>
      </div>
    )
  }

  const renderPasswordChangeContent = () => {
    switch (passwordChangeStep) {
      case 'request':
        return (
          <div className="text-center">
            <Key className="text-[#57321A] text-4xl mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[#57321A] mb-4">Change Your Password</h3>
            <p className="text-gray-600 mb-6">
              We'll send a verification code to your email address ({profile.email})
            </p>
            
            <button
              onClick={handleInitiatePasswordChange}
              disabled={isChangingPassword}
              className={`w-full px-4 py-2 bg-[#EFC815] text-[#57321A] rounded-lg hover:bg-[#57321A] hover:text-white transition-all duration-300 ${
                isChangingPassword ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isChangingPassword ? 'Sending...' : 'Send Verification Code'}
            </button>
          </div>
        );
      
      case 'verify':
        return (
          <form onSubmit={handleVerifyOTPAndChangePassword} className="space-y-4">
            <div className="text-center mb-4">
              <Mail className="text-[#57321A] text-4xl mx-auto mb-2" />
              <h3 className="text-xl font-semibold text-[#57321A]">Verify Your Email</h3>
              <p className="text-gray-600 text-sm">
                Enter the 6-digit code sent to {profile.email}
              </p>
              
              {/* OTP Timer */}
              <div className={`mt-2 font-medium ${otpTimer < 60 ? 'text-red-500' : 'text-[#57321A]'}`}>
                Code expires in: {formatTime(otpTimer)}
              </div>
            </div>
            
            {/* OTP Input */}
            <div>
              <label className="text-sm font-medium text-[#57321A]">Verification Code</label>
              <input
                type="text"
                value={otpData.otp}
                onChange={(e) => setOtpData(prev => ({...prev, otp: e.target.value}))}
                placeholder="Enter 6-digit code"
                className="w-full px-4 py-2.5 mt-1 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EFC815]"
                maxLength={6}
                required
              />
            </div>
            
            {/* New Password */}
            <div>
              <label className="text-sm font-medium text-[#57321A]">New Password</label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData(prev => ({
                  ...prev,
                  newPassword: e.target.value
                }))}
                className="w-full px-4 py-2.5 mt-1 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EFC815]"
                required
              />
            </div>
            
            {/* Confirm New Password */}
            <div>
              <label className="text-sm font-medium text-[#57321A]">Confirm New Password</label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData(prev => ({
                  ...prev,
                  confirmPassword: e.target.value
                }))}
                className="w-full px-4 py-2.5 mt-1 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EFC815]"
                required
              />
            </div>
            
            {/* Resend OTP Button */}
            <div className="text-center">
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={otpData.resendTimer > 0 || isChangingPassword}
                className={`text-sm text-[#57321A] hover:text-[#EFC815] transition-colors ${
                  otpData.resendTimer > 0 || isChangingPassword ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {otpData.resendTimer > 0 
                  ? `Resend code in ${formatTime(otpData.resendTimer)}` 
                  : 'Resend verification code'}
              </button>
            </div>
            
            {passwordError && (
              <p className="text-red-500 text-sm">{passwordError}</p>
            )}
            
            <div className="flex justify-end gap-4 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordChangeStep('request');
                  if (otpTimerRef.current) clearInterval(otpTimerRef.current);
                  if (resendTimerRef.current) clearInterval(resendTimerRef.current);
                }}
                className="px-4 py-2 text-[#57321A] hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isChangingPassword || otpTimer === 0}
                className={`px-4 py-2 bg-[#EFC815] text-[#57321A] rounded-lg hover:bg-[#57321A] hover:text-white transition-all duration-300 ${
                  (isChangingPassword || otpTimer === 0) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isChangingPassword ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </form>
        );
      
      case 'success':
        return (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold text-[#57321A] mb-2">Password Updated!</h3>
            <p className="text-gray-600">Your password has been changed successfully.</p>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFCF4] py-12 px-4">
      <div className="max-w-4xl mx-auto ml-100">
        <HeadingWithEffect className="mb-12">My Profile</HeadingWithEffect>

        <motion.div
          className="bg-white rounded-xl shadow-lg overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Profile Header with Avatar */}
          <div className="bg-gradient-to-r from-[#57321A] to-[#8B5A2B] h-32 relative">
            {/* Profile Avatar */}
            <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white">
                  <img 
                    src={getCurrentAvatarUrl()} 
                    alt="Profile Avatar" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error("Avatar image failed to load:", e.target.src);
                      e.target.src = `https://ui-avatars.com/api/?name=${getInitials(profile.name)}&background=${getColorForName(profile.name)}&color=fff&size=200&bold=true`;
                    }}
                  />
                </div>
                <button 
                  onClick={toggleAvatarSelector}
                  className="absolute bottom-0 right-0 bg-[#EFC815] p-2 rounded-full shadow-md hover:bg-yellow-500 transition-colors duration-300"
                >
                  <Camera className="w-5 h-5 text-[#57321A]" />
                </button>
              </div>
            </div>
          </div>

          {/* Avatar Selector Modal */}
          <AnimatePresence>
            {showAvatarSelector && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
              >
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.9 }}
                  className="bg-white rounded-xl p-6 max-w-md w-full"
                >
                  <h3 className="text-xl font-semibold mb-4 text-[#57321A]">Choose an Avatar</h3>
                  
                  <div className="grid grid-cols-5 gap-3 mb-6">
                    {/* Add option to use initials */}
                    <button
                      onClick={() => resetToInitialsAvatar()}
                      className={`w-16 h-16 rounded-full overflow-hidden border-2 transition-all ${
                        !profile.hasCustomAvatar ? 'border-[#EFC815] scale-110' : 'border-gray-200 hover:border-[#EFC815]'
                      }`}
                    >
                      <div 
                        className="w-full h-full flex items-center justify-center"
                        style={{ 
                          backgroundColor: `#${getColorForName(profile.name)}`,
                          color: 'white',
                          fontWeight: 'bold' 
                        }}
                      >
                        {getInitials(profile.name)}
                      </div>
                    </button>
                    
                    {/* Custom avatars */}
                    {CUSTOM_AVATARS.map((avatarSrc, index) => (
                      <button
                        key={index}
                        onClick={() => selectAvatar(index)}
                        className={`w-16 h-16 rounded-full overflow-hidden border-2 transition-all ${
                          profile.hasCustomAvatar && selectedAvatarIndex === index ? 'border-[#EFC815] scale-110' : 'border-gray-200 hover:border-[#EFC815]'
                        }`}
                      >
                        <img 
                          src={avatarSrc} 
                          alt={`Avatar option ${index + 1}`} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.error("Avatar option failed to load:", avatarSrc);
                            e.target.src = `https://ui-avatars.com/api/?name=${index + 1}&background=random&color=fff`;
                          }}
                        />
                      </button>
                    ))}
                  </div>
                  
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={toggleAvatarSelector}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveAvatar}
                      disabled={isSaving}
                      className="px-4 py-2 bg-[#EFC815] rounded-lg text-[#57321A] font-medium hover:bg-yellow-500 disabled:opacity-50 flex items-center gap-2"
                    >
                      {isSaving ? <LoadingSpinner size="sm" /> : <Check className="w-4 h-4" />}
                      Save
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Profile Content */}
          <div className="pt-20 px-6 pb-8">
            {/* Success Message */}
            <AnimatePresence>
              {saveSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6 p-3 bg-green-100 text-green-700 rounded-lg flex items-center justify-center gap-2"
                >
                  <Check className="h-5 w-5" />
                  <span>Profile updated successfully!</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Profile Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[#57321A]">
                  <User className="h-5 w-5 text-[#EFC815]" />
                  <label className="text-sm font-medium">Full Name</label>
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={profile.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EFC815] focus:border-transparent transition-all duration-200"
                    placeholder="Enter your full name"
                  />
                ) : (
                  <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                    <p className="font-medium text-gray-800">{profile.name || "Not set"}</p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[#57321A]">
                  <AtSign className="h-5 w-5 text-[#EFC815]" />
                  <label className="text-sm font-medium">Username</label>
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    name="username"
                    value={profile.username}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EFC815] focus:border-transparent transition-all duration-200"
                    placeholder="Enter your username"
                  />
                ) : (
                  <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                    <p className="font-medium text-gray-800">{profile.username || "username"}</p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[#57321A]">
                  <Mail className="h-5 w-5 text-[#EFC815]" />
                  <label className="text-sm font-medium">Email Address</label>
                </div>
                <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="font-medium text-gray-800">{profile.email}</p>
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[#57321A]">
                  <Shield className="h-5 w-5 text-[#EFC815]" />
                  <label className="text-sm font-medium">Account Role</label>
                </div>
                <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-[#EFC815]/20 text-[#57321A] text-xs font-medium rounded-full">
                      {profile.role || "User"}
                    </span>
                    <p className="font-medium text-gray-800">{profile.role || "Standard User"}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[#57321A]">
                  <Key className="h-5 w-5 text-[#EFC815]" />
                  <label className="text-sm font-medium">Password</label>
                </div>
                <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-100 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-800">••••••••</p>
                  </div>
                  <button
                    onClick={() => setShowPasswordModal(true)}
                    className="px-3 py-1 text-sm bg-[#EFC815] text-[#57321A] rounded-md hover:bg-[#57321A] hover:text-white transition-all duration-300"
                  >
                    Change
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4 mt-8">
              {isEditing ? (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleUpdateProfile}
                    disabled={isSaving}
                    className={`px-6 py-2.5 rounded-lg flex items-center gap-2 font-medium shadow-sm
                      ${
                        isSaving
                          ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                          : "bg-[#EFC815] text-[#57321A] hover:bg-[#57321A] hover:text-white"
                      } 
                      transition-all duration-300`}
                  >
                    {isSaving ? (
                      <>
                        <LoadingSpinner size="small" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Check className="h-5 w-5" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={cancelEditing}
                    disabled={isSaving}
                    className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg flex items-center gap-2 font-medium
                              hover:bg-gray-300 transition-all duration-300 shadow-sm"
                  >
                    <X className="h-5 w-5" />
                    <span>Cancel</span>
                  </motion.button>
                </>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-2.5 bg-[#57321A] text-white rounded-lg flex items-center gap-2 font-medium
                            hover:bg-[#EFC815] hover:text-[#57321A] transition-all duration-300 shadow-md"
                >
                  <Pencil className="h-5 w-5" />
                  <span>Edit Profile</span>
                </motion.button>
              )}
            </div>

            {/* Password Change Modal */}
            {showPasswordModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl"
                >
                  {renderPasswordChangeContent()}
                </motion.div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

