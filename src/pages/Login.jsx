import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { useAuth } from "../contexts/AuthContext";
import { classNames } from "primereact/utils";
import { loginApi } from "../api/auth";

const Login = () => {
  const [form, setForm] = useState({
    username: "",
    password: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const { login, error: authError, fetchUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";

  useEffect(() => {
    // Clear error saat komponen pertama mount
    if (authError) {
      fetchUser(); // Ini akan reset error state
    }
  }, []);

  const validateForm = () => {
    const errors = {};
    if (!form.username.trim()) errors.username = "Username harus diisi";
    if (!form.password) errors.password = "Password harus diisi";
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // Clear validation error when user types
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);
    setValidationErrors({});

    try {
      // Panggil API login terlebih dahulu
      const response = await loginApi({
        username: form.username,
        password: form.password,
      });

      // Gunakan response dari API untuk login ke context
      const success = await login(response.data.token, response.data.user);

      if (success) {
        navigate(from, { replace: true });
      }
    } catch (error) {
      console.error("Login error:", error);
      if (error.response) {
        // Tangani error yang dikirim dari backend
        const { status, data } = error.response;

        if (status === 400) {
          setValidationErrors({
            username: data.message || "Username atau password salah",
          });
        } else {
          // Error selain 400 (misal: 500)
          alert(data.message || "Terjadi kesalahan. Coba lagi nanti.");
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Login</h1>
          {/* <p className="text-gray-600">Enter your credentials to continue</p> */}
        </div>

        {authError && (
          <div className="p-3 mb-4 bg-red-100 text-red-700 rounded-md">
            {authError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Username
            </label>
            <InputText
              id="username"
              name="username"
              value={form.username}
              onChange={handleChange}
              className={classNames("w-full", {
                "p-invalid": validationErrors.username,
              })}
              disabled={submitting}
            />
            {validationErrors.username && (
              <small className="p-error">{validationErrors.username}</small>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <Password
              id="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className={classNames("w-full", {
                "p-invalid": validationErrors.password,
              })}
              feedback={false}
              // toggleMask
              disabled={submitting}
              inputClassName="w-full"
            />
            {validationErrors.password && (
              <small className="p-error">{validationErrors.password}</small>
            )}
          </div>

          <Button
            type="submit"
            label={submitting ? "Logging in..." : "Login"}
            className="w-full"
            disabled={submitting}
            loading={submitting}
          />
        </form>

        {/* <div className="mt-4 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <a href="/register" className="text-blue-600 hover:underline">
            Register here
          </a>
        </div> */}
      </div>
    </div>
  );
};

export default Login;
