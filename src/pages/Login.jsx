import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { loginApi } from "../api/auth";
import { useAuth } from "../contexts/AuthContext";
import { saveAuthData } from "../utils/auth";

const Login = () => {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); // NEW
  const { updateUser, setNotifications } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    try {
      const response = await loginApi(form);
      const { token, user, notifications } = response.data;
      console.log("Login berhasil:", token, user, notifications);

      saveAuthData(token, user);
      updateUser(user);
      setNotifications(notifications || []);
      navigate("/");
    } catch (error) {
      console.error("Login gagal:", error);
      setErrorMessage("Nama Pengguna atau Kata Sandi salah.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="p-6 rounded-lg shadow-xl w-md bg-white">
        <h2 className="text-2xl font-bold mb-6 text-center">LOGIN</h2>
        {errorMessage && (
          <div className="mb-4 text-red-500 text-center">{errorMessage}</div>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="username" className="block mb-1 font-semibold">
              Nama Pengguna
            </label>
            <InputText
              id="username"
              name="username"
              value={form.username}
              onChange={handleChange}
              className="w-full"
              required
            />
          </div>
          <div className="mb-1">
            <label htmlFor="password" className="block mb-1 font-semibold">
              Kata Sandi
            </label>
            <Password
              id="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full"
              inputClassName="w-full"
              feedback={false}
              // toggleMask
              required
            />
          </div>
          <Button
            type="submit"
            label={loading ? "Logging in..." : "Login"}
            className="w-full"
            disabled={loading}
          />
        </form>
      </div>
    </div>
  );
};

export default Login;
