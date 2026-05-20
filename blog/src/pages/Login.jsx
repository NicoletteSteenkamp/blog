import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/authContext";
const Login = () => {
  const [inputs, setInputs] = useState({
  email: "",
  password: "",
});
  const [err, setError] = useState(null);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleChange = (e) => {
    setInputs((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await login(inputs);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="auth">
      <h1>Login</h1>

      <form onSubmit={handleSubmit}>
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

        <button type="submit">Login</button>

        {err && <p>{err}</p>}

        <span>
          Need an account? <Link to="/register">Register</Link>
        </span>
      </form>
    </div>
  );
};

export default Login;