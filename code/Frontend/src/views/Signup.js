import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUser, FaLock, FaEye, FaEyeSlash, FaEnvelope, FaPhone } from "react-icons/fa";
import LoadingSpinner from '../components/LoadingSpinner';
import SuccessAlert from '../components/SuccessAlert';
import FailAlert from "../components/FailAlert";
import CommonButton from "../components/CommonButton";
import ShiningButton from "../components/ShiningButton";

export default function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    setLoading(true);

    try {
      // Get reCAPTCHA token
      const recaptchaToken = await window.grecaptcha.execute(
        process.env.REACT_APP_RECAPTCHA_SITE_KEY,
        { action: 'register' }
      );

      const response = await fetch(`${process.env.REACT_APP_BACKEND}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          username: formData.username,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          recaptchaToken
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      // Store email for resend verification feature
      localStorage.setItem('pendingVerificationEmail', formData.email);

      setSuccess(
        "Registration successful! Please check your email for a verification link"
      );
      
      // Clear the form
      setFormData({
        name: "",
        username: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
      });
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  if(loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Signing up...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-semibold text-brown text-center mb-6">Sign Up</h2>

        {error && <FailAlert type="error" message={error} />}
        {success && <SuccessAlert type="success" message={success} />}

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Name */}
          <div className="flex items-center border border-gray-300 rounded-md p-2 focus-within:border-brown">
            <FaUser className="text-gray-500 mr-2" />
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full outline-none bg-transparent text-brown"
              required
            />
          </div>

          {/* Username */}
          <div className="flex items-center border border-gray-300 rounded-md p-2 focus-within:border-brown">
            <FaUser className="text-gray-500 mr-2" />
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              className="w-full outline-none bg-transparent text-brown"
              required
            />
          </div>

          {/* Email */}
          <div className="flex items-center border border-gray-300 rounded-md p-2 focus-within:border-brown">
            <FaEnvelope className="text-gray-500 mr-2" />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full outline-none bg-transparent text-brown"
              required
            />
          </div>

          {/* Phone */}
          <div className="flex items-center border border-gray-300 rounded-md p-2 focus-within:border-brown">
            <FaPhone className="text-gray-500 mr-2" />
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              className="w-full outline-none bg-transparent text-brown"
              required
            />
          </div>

          {/* Password */}
          <div className="flex items-center border border-gray-300 rounded-md p-2 focus-within:border-brown">
            <FaLock className="text-gray-500 mr-2" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full outline-none bg-transparent text-brown"
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

          {/* Confirm Password */}
          <div className="flex items-center border border-gray-300 rounded-md p-2 focus-within:border-brown">
            <FaLock className="text-gray-500 mr-2" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full outline-none bg-transparent text-brown"
              required
            />
            <button
              type="button"
              className="ml-2 text-gray-500 focus:outline-none"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {/* Submit Button */}
          <CommonButton type="submit">
            Sign Up
          </CommonButton>

          <div className="text-center mt-4 text-gray-600">
            Already have an account?{" "}
            <Link to="/auth" className="text-brown underline hover:text-yellow">
              Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}