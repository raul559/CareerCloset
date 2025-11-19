import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "../contexts/AdminContext";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { login } = useAdmin();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    const ok = await login(username, password);
    if (!ok) return setError("Invalid username or password");
    navigate("/admin/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">

        <h2 className="text-3xl font-bold mb-6 text-center">
          Admin Login
        </h2>

        {error && (
          <p className="text-red-600 text-center mb-4">
            {error}
          </p>
        )}

        <form onSubmit={submit}>
          <label className="block mb-3 text-sm font-semibold">
            Username
            <input
              className="w-full border p-2 rounded mt-1"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </label>

          <label className="block mb-6 text-sm font-semibold">
            Password
            <input
              type="password"
              className="w-full border p-2 rounded mt-1"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-md"
          >
            Login
          </button>
        </form>

      </div>
    </div>
  );
}
