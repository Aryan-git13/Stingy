import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { validateEmail } from "../../utils/helper";
import axiosInstance from "../../utils/axiosinstance";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    setError(null);

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    try {
      setIsLoading(true);

      const response = await axiosInstance.post("/login", { email, password });

      if (response.data && response.data.accessToken) {
        localStorage.setItem("token", response.data.accessToken);
        navigate("/");
      }
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#DFFFE8]">
      {/* Left side: login card */}
      <div className="flex w-full lg:w-1/2 items-center justify-center px-4 py-10 sm:py-14 lg:py-16">
        <div className="w-full max-w-md">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 sm:p-8 md:p-10 shadow-xl border border-gray-100">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2 text-center mb-5">
                <p className="text-xs font-medium uppercase tracking-[0.25em] text-[#16A34A]">
                  Login Page
                </p>
                <h4 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#0F172A]">
                  Log In
                </h4>
                <p className="text-sm sm:text-base text-gray-600">
                  Welcome back! Sign in to your account
                </p>
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <input
                    type="email"
                    placeholder="Email"
                    className="w-full px-4 py-3 text-sm sm:text-base rounded-lg border-2 border-gray-200 focus:outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A] focus:ring-opacity-20 transition-all duration-200"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-label="Email"
                  />
                </div>

                <div>
                  <input
                    type="password"
                    placeholder="Password"
                    className="w-full px-4 py-3 text-sm sm:text-base rounded-lg border-2 border-gray-200 focus:outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A] focus:ring-opacity-20 transition-all duration-200"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    aria-label="Password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full inline-flex items-center justify-center px-4 py-3 mt-2 text-sm sm:text-base font-semibold rounded-lg text-white bg-[#16A34A] hover:bg-[#15803D] disabled:bg-[#9CA3AF] disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isLoading ? (
                  <span className="inline-flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  "Log In"
                )}
              </button>

              <p className="text-center text-sm text-gray-600 mt-4">
                Don&apos;t have an account?{" "}
                <Link
                  to="/signup"
                  className="font-semibold text-[#16A34A] hover:text-[#15803D]"
                >
                  Sign up here
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>

      {/* Right side: brand panel */}
      <div className="hidden lg:flex w-1/2 items-center justify-center bg-gradient-to-br from-[#15803D] to-[#065F46] text-white">
        <div className="flex flex-col items-center gap-8 px-10">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 border border-white/20">
              <span className="text-3xl font-bold">ST</span>
            </div>
            <span className="text-3xl font-semibold tracking-wide">
              Stingy
            </span>
          </div>

          <div className="max-w-md text-center space-y-2">
            <p className="text-lg font-medium">
              Keep your notes organized and always in sync.
            </p>
            <p className="text-sm text-emerald-100">
              Capture ideas, tasks and to‑dos in one clean, minimal workspace
              designed to help you focus.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
