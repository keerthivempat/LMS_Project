import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaUser, FaLock, FaEye, FaEyeSlash, FaGoogle } from "react-icons/fa";
import SuccessAlert from "../components/SuccessAlert";
import LoadingSpinner from "../components/LoadingSpinner";
import CommonButton from "../components/CommonButton";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Load reCAPTCHA script if not already loaded
    if (!window.grecaptcha) {
      const script = document.createElement("script");
      script.src = process.env.REACT_APP_CAPTCHA_LINK;
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Get reCAPTCHA token
      const recaptchaToken = await window.grecaptcha.execute(
        process.env.REACT_APP_RECAPTCHA_SITE_KEY,
        { action: "login" }
      );

      const response = await fetch(
        `${process.env.REACT_APP_BACKEND}/api/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, recaptchaToken }),
          credentials: "include", // Important for handling cookies
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      localStorage.setItem("accessToken", data.data.accessToken);
      setShowSuccess(true);
      setTimeout(() => {
        navigate("/home");
        window.location.reload();
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Logging in...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream">
      {showSuccess && <SuccessAlert message="Login Successful!" />}

      <div className="bg-white p-8 rounded-2xl shadow-lg w-96">
        <h2 className="text-3xl text-brown font-semibold text-center mb-6">
          Login
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Email Input */}
          <div className="flex items-center border border-gray-300 rounded-md p-2 focus-within:border-brown">
            <FaUser className="text-gray-500 mr-2" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full outline-none bg-transparent text-brown" // Text color set to brown
              required
            />
          </div>

          {/* Password Input with Show/Hide Button */}
          <div className="flex items-center border border-gray-300 rounded-md p-2 focus-within:border-brown">
            <FaLock className="text-gray-500 mr-2" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full outline-none bg-transparent text-brown" // Text color set to brown
              required
            />
            <button
              type="button"
              className="ml-2 text-gray-500 focus:outline-none"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          <CommonButton type="submit" disabled ={isLoading}>{isLoading ? "Logging in..." : "Login"}</CommonButton>
        </form>

        {/* Google Login Button */}
        <div className="mt-4">
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
        </div>

        <div className="text-center mt-4 text-gray-600">
          Don't have an account?{" "}
          <Link to="/signup" className="text-brown underline hover:text-yellow">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
