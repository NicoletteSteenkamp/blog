import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { makeRequest } from "../axios";

await makeRequest.post("/auth/register", inputs);

const API = import.meta.env.VITE_API_URL;

const Register = () => {
  const [inputs, setInputs] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [err, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setInputs((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(`${API}/api/register`, inputs, {
        withCredentials: true,
      });

      navigate("/login");
    } catch (err) {
      setError(err.response?.data || "Registration failed");
    }
  };

  return (
    <div className="auth">
      <h1>Register</h1>

      <form onSubmit={handleSubmit}>
        <input
          required
          type="text"
          placeholder="username"
          name="username"
          onChange={handleChange}
        />

        <input
          required
          type="email"
          placeholder="email"
          name="email"
          onChange={handleChange}
        />

        <input
          required
          type="password"
          placeholder="password"
          name="password"
          onChange={handleChange}
        />

        <button type="submit">Register</button>

        {err && <p>{err}</p>}

        <span>
          Do you have an account? <Link to="/login">Login</Link>
        </span>
      </form>
    </div>
  );
};

export default Register;