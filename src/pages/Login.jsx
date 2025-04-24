import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { login } from "../utils/auth";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Login gagal");
      }

      const { token } = await res.json();
      login(token);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="w-md p-6 shadow-xl rounded-2xl bg-white">
        <h2 className="text-xl text-center font-bold mb-5">LOGIN</h2>

        <div className="mb-5">
          <label>Nama Pengguna</label>
          <InputText
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-inputtext-sm"
          />
        </div>

        <div className="mb-5">
          <label>Kata Sandi</label>
          <Password
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            feedback={false}
            className="w-full p-inputtext-sm"
            inputClassName="w-full"
          />
        </div>

        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}

        <Button label="Login" onClick={handleLogin} className="w-full" />
      </div>
    </div>
  );
};

export default Login;
