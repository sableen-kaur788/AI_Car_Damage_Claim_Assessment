import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthShell from "../components/AuthShell";
import api from "../services/api";
import { setSession } from "../services/auth";
import { getApiErrorMessage } from "../services/errors";

function LoginPage() {
  const navigate = useNavigate();
  const [values, setValues] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setValues((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await api.post("/auth/login", values);
      setSession(response.data.access_token, response.data.refresh_token, response.data.user);
      navigate("/dashboard", { replace: true });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Unable to login."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Securely access the car damage inspection workspace."
      fields={[
        { name: "email", label: "Email", type: "email", placeholder: "you@example.com" },
        { name: "password", label: "Password", type: "password", placeholder: "Enter your password" },
      ]}
      values={values}
      onChange={handleChange}
      onSubmit={handleSubmit}
      submitLabel="Login"
      error={error}
      loading={loading}
      footer={
        <div className="space-y-2">
          <p>
            Need an account? <Link to="/signup">Create one</Link>
          </p>
          <p>
            Forgot your password? <Link to="/forgot-password">Reset it</Link>
          </p>
        </div>
      }
    />
  );
}

export default LoginPage;
