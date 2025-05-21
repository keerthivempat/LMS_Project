"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { FaUser, FaLock, FaEye, FaEyeSlash, FaEnvelope, FaGraduationCap, FaGoogle } from "react-icons/fa"
import LoadingSpinner from "../components/LoadingSpinner"
import SuccessAlert from "../components/SuccessAlert"
import FailAlert from "../components/FailAlert"
import CommonButton from "../components/CommonButton"

// Utility function for conditional class names
const cn = (...classes) => {
  return classes.filter(Boolean).join(" ")
}

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState("login")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const navigate = useNavigate()

  // Login state
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
    showPassword: false,
  })

  // Signup state
  const [signupData, setSignupData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    showPassword: false,
    showConfirmPassword: false,
  })

  const [passwordStrength, setPasswordStrength] = useState({
    isValid: false,
    message: "",
    animation: "",
  })

  const [isNameFocused, setIsNameFocused] = useState(false)
  const [passwordsMatch, setPasswordsMatch] = useState(true)
  const [loginAttempts, setLoginAttempts] = useState(() => {
    return Number.parseInt(localStorage.getItem("loginAttempts") || "0")
  })

  const [loginCooldown, setLoginCooldown] = useState(() => {
    const cooldownUntil = localStorage.getItem("cooldownUntil")
    if (cooldownUntil && Number.parseInt(cooldownUntil) > Date.now()) {
      return true
    }
    return false
  })

  const [cooldownTimer, setCooldownTimer] = useState(() => {
    const cooldownUntil = localStorage.getItem("cooldownUntil")
    if (cooldownUntil) {
      const timeLeft = Math.max(0, Math.floor((Number.parseInt(cooldownUntil) - Date.now()) / 1000))
      return timeLeft
    }
    return 0
  })

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    // Check if user is in cooldown
    if (loginCooldown) {
      setError(`Too many failed attempts. Please try again in ${cooldownTimer} seconds.`)
      return
    }

    setIsLoading(true)

    try {
      const recaptchaToken = await window.grecaptcha.execute(process.env.REACT_APP_RECAPTCHA_SITE_KEY, {
        action: "login",
      })

      const response = await fetch(`${process.env.REACT_APP_BACKEND}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginData.email,
          password: loginData.password,
          recaptchaToken,
        }),
        credentials: "include",
      })

      const data = await response.json()

      if (!response.ok) {
        // Increment login attempts on failure and store in localStorage
        const newAttempts = loginAttempts + 1
        setLoginAttempts(newAttempts)
        console.log("Data is ",data.data);
        localStorage.setItem("loginAttempts", newAttempts.toString())
        // localStorage.setItem("accessToken",data.data.accessToken);
        
        // If reached 3 attempts, activate cooldown
        if (newAttempts >= 3) {
          const cooldownDuration = 60 // 60 seconds
          const cooldownUntil = Date.now() + cooldownDuration * 1000

          setLoginCooldown(true)
          setCooldownTimer(cooldownDuration)
          localStorage.setItem("cooldownUntil", cooldownUntil.toString())
          // Start cooldown timer
          const interval = setInterval(() => {
            const timeLeft = Math.max(0, Math.floor((cooldownUntil - Date.now()) / 1000))
            setCooldownTimer(timeLeft)

            if (timeLeft <= 0) {
              clearInterval(interval)
              setLoginCooldown(false)
              setLoginAttempts(0)
              localStorage.removeItem("loginAttempts")
              localStorage.removeItem("cooldownUntil")
            }
          }, 1000)
        }

        throw new Error(data.message || "Login failed")
      }

      // Reset attempts on successful login
      setLoginAttempts(0)
      localStorage.removeItem("loginAttempts")
      localStorage.removeItem("cooldownUntil")
      console.log("Data is ",data.data);
      if(data.data.user.role === "admin"){
        console.log("admin here");
        localStorage.setItem("organizationid", data.data.user.organization);
      }
      localStorage.setItem("accessToken", data.data.accessToken);
      localStorage.setItem("role",data.data.user.role);
      setSuccess("Login Successful!")
      setTimeout(() => {
        navigate("/home")
        window.location.reload()
      }, 1500)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignupSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (signupData.password !== signupData.confirmPassword) {
      setError("Passwords do not match!")
      return
    }

    if (!passwordStrength.isValid) {
      setError("Password is not strong enough!")
      return
    }

    setIsLoading(true)
    try {
      const recaptchaToken = await window.grecaptcha.execute(process.env.REACT_APP_RECAPTCHA_SITE_KEY, {
        action: "register",
      })

      const response = await fetch(`${process.env.REACT_APP_BACKEND}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: signupData.name,
          username: signupData.username,
          email: signupData.email,
          password: signupData.password,
          recaptchaToken,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || "Registration failed")
      }

      localStorage.setItem("pendingVerificationEmail", signupData.email)
      setSuccess("Registration successful! Please check your email for a verification link")
      setSignupData({
        name: "",
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        showPassword: false,
        showConfirmPassword: false,
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const validatePassword = (password) => {
    const strongRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-=[\]{};':"\\|,.<>/])[A-Za-z\d@$!%*?&#^()_+\-=[\]{};':"\\|,.<>/]{8,}$/
    if (strongRegex.test(password)) {
      setPasswordStrength({
        isValid: true,
        message: "Strong password!",
        animation: "animate-pulse-green",
      })
    } else {
      setPasswordStrength({
        isValid: false,
        message: "Password must contain at least 8 characters, including uppercase, lowercase, numbers, and symbols.",
        animation: "animate-shake-red",
      })
    }
  }

  const validatePasswordMatch = (password, confirmPassword) => {
    if (password === confirmPassword) {
      setPasswordsMatch(true)
    } else {
      setPasswordsMatch(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">{activeTab === "login" ? "Logging in..." : "Signing up..."}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream">
      <div className="container mx-auto flex items-center justify-center px-4">
        {/* Left side - Image and Text */}
        <div className="hidden lg:flex flex-col items-center w-1/2 pr-8 animate-fade-in">
          <div className="relative w-full max-w-lg">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-brown/20 to-brown/40 rounded-2xl" />
            <img
              src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop"
              alt="Education"
              className="w-full h-auto rounded-2xl shadow-xl"
            />
          </div>
          <div className="mt-8 text-center">
            <div className="flex items-center justify-center mb-4">
              <FaGraduationCap className="text-brown text-4xl" />
              <h2 className="text-brown p-4 text-2xl">Eklavya Education</h2>
            </div>
            <h2 className="text-3xl font-bold text-brown mb-4">Empower Your Learning Journey</h2>
            <p className="text-gray-600 max-w-md">
              Join our community of learners and unlock your potential through quality education and engaging courses.
            </p>
          </div>
        </div>

        {/* Right side - Auth Form */}
        <div className="w-full lg:w-1/2 lg:pl-8">
          <div className="bg-white p-8 rounded shadow-lg max-w-md mx-auto w-full">
            {/* Tabs */}
            <div className="flex mb-8 border-b">
              <button
                className={`flex-1 py-3 text-lg font-semibold transition-all duration-300 ${
                  activeTab === "login" ? "text-brown border-b-2 border-brown" : "text-gray-400 hover:text-brown"
                }`}
                onClick={() => setActiveTab("login")}
              >
                Sign in
              </button>
              <button
                className={`flex-1 py-3 text-lg font-semibold transition-all duration-300 ${
                  activeTab === "signup" ? "text-brown border-b-2 border-brown" : "text-gray-400 hover:text-brown"
                }`}
                onClick={() => setActiveTab("signup")}
              >
                Register
              </button>
            </div>

            {error && <FailAlert message={error} />}
            {success && <SuccessAlert message={success} />}

            <div className="transition-all duration-300 transform">
              <div className={`${activeTab === "login" ? "block" : "hidden"}`}>
                <form className="space-y-4" onSubmit={handleLoginSubmit}>
                  <div className="flex items-center border-2 border-yellow rounded p-2">
                    <FaUser className="text-brown mr-2" />
                    <input
                      type="email"
                      placeholder="Email"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      className="w-full outline-none bg-transparent text-brown focus:outline-none focus:border-[#57321A] placeholder-gray-600"
                      required
                    />
                  </div>

                  <div className="flex items-center border-2 border-yellow rounded p-2">
                    <FaLock className="text-brown mr-2" />
                    <input
                      type={loginData.showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      className="w-full outline-none bg-transparent text-brown placeholder-gray-600"
                      required
                    />
                    <button
                      type="button"
                      className="ml-2 text-brown focus:outline-none"
                      onClick={() => setLoginData({ ...loginData, showPassword: !loginData.showPassword })}
                    >
                      {loginData.showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {loginCooldown && (
                    <div className="text-red-500 text-center py-2 bg-red-100 rounded">
                      Too many failed attempts. Please try again in {cooldownTimer} seconds.
                    </div>
                  )}
                  <CommonButton
                    type="submit"
                    className="w-full transform hover:scale-105 transition-transform duration-300"
                  >
                    Login
                  </CommonButton>
                </form>

                {/* <div className="mt-4">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">Or continue with</span>
                    </div>
                  </div>
                  
                  <button 
                    className="w-full mt-4 flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-md p-2 text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      alert('Google login is currently unavailable');
                    }}
                  >
                    <FaGoogle className="text-red-500" />
                    <span>Sign in with Google</span>
                  </button>
                </div>*/}
              </div> 

              {/* Signup Form */}
              <div className={`${activeTab === "signup" ? "block" : "hidden"}`}>
                <form className="space-y-4" onSubmit={handleSignupSubmit}>
                  <div className="flex items-center border-2 border-yellow rounded p-2">
                    <FaUser className="text-brown mr-2" />
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={signupData.name}
                      onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                      onFocus={() => setIsNameFocused(true)}
                      onBlur={() => setIsNameFocused(false)}
                      className="w-full outline-none bg-transparent text-brown placeholder-gray-600"
                      required
                    />
                  </div>
                  {isNameFocused && (
                    <p className="text-sm text-brown">This name will be used for certification purposes.</p>
                  )}

                  <div className="flex items-center border-2 border-yellow rounded p-2">
                    <FaUser className="text-brown mr-2" />
                    <input
                      type="text"
                      placeholder="Username"
                      value={signupData.username}
                      onChange={(e) => setSignupData({ ...signupData, username: e.target.value })}
                      className="w-full outline-none bg-transparent text-brown placeholder-gray-600"
                      required
                    />
                  </div>

                  <div className="flex items-center border-2 border-yellow rounded p-2">
                    <FaEnvelope className="text-brown mr-2" />
                    <input
                      type="email"
                      placeholder="Email"
                      value={signupData.email}
                      onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                      className="w-full outline-none bg-transparent text-brown placeholder-gray-600"
                      required
                    />
                  </div>

                  <div className="flex items-center border-2 border-yellow rounded p-2">
                    <FaLock className="text-brown mr-2" />
                    <input
                      type={signupData.showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={signupData.password}
                      onChange={(e) => {
                        setSignupData({ ...signupData, password: e.target.value })
                        validatePassword(e.target.value)
                        validatePasswordMatch(e.target.value, signupData.confirmPassword)
                      }}
                      className="w-full outline-none bg-transparent text-brown placeholder-gray-600"
                      required
                    />
                    <button
                      type="button"
                      className="ml-2 text-brown focus:outline-none"
                      onClick={() => setSignupData({ ...signupData, showPassword: !signupData.showPassword })}
                    >
                      {signupData.showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  <div
                    className={`text-sm ${passwordStrength.isValid ? "text-green-500" : "text-red-500"} ${passwordStrength.animation}`}
                  >
                    {passwordStrength.message}
                  </div>

                  <div className="flex items-center border-2 border-yellow rounded p-2">
                    <FaLock className="text-brown mr-2" />
                    <input
                      type={signupData.showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm Password"
                      value={signupData.confirmPassword}
                      onChange={(e) => {
                        setSignupData({ ...signupData, confirmPassword: e.target.value })
                        validatePasswordMatch(signupData.password, e.target.value)
                      }}
                      className="w-full outline-none bg-transparent text-brown placeholder-gray-600"
                      required
                    />
                    <button
                      type="button"
                      className="ml-2 text-brown focus:outline-none"
                      onClick={() =>
                        setSignupData({ ...signupData, showConfirmPassword: !signupData.showConfirmPassword })
                      }
                    >
                      {signupData.showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {!passwordsMatch && (
                    <div className="text-sm text-red-500 animate-shake-red">Passwords do not match!</div>
                  )}

                  <CommonButton
                    type="submit"
                    className="w-full transform hover:scale-105 transition-transform duration-300"
                  >
                    Register
                  </CommonButton>
                </form>

                {/* Google Register Button */}
                <div className="mt-4">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                  </div>
                  
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

