import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthShell from "../components/AuthShell";
import api from "../services/api";
import { setSession } from "../services/auth";
import { getApiErrorMessage } from "../services/errors";

function SignupPage() {
  const navigate = useNavigate();
  const [values, setValues] = useState({ full_name: "", email: "", password: "" });
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
      const response = await api.post("/auth/signup", values);
      setSession(response.data.access_token, response.data.refresh_token, response.data.user);
      navigate("/dashboard", { replace: true });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Unable to create account."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start managing AI-assisted inspection reports and claim-ready PDFs."
      fields={[
        { name: "full_name", label: "Full Name", type: "text", placeholder: "Alex Johnson" },
        { name: "email", label: "Email", type: "email", placeholder: "you@example.com" },
        { name: "password", label: "Password", type: "password", placeholder: "At least 6 characters" },
      ]}
      values={values}
      onChange={handleChange}
      onSubmit={handleSubmit}
      submitLabel="Sign Up"
      error={error}
      loading={loading}
      footer={
        <p>
          Already registered? <Link to="/login">Login</Link>
        </p>
      }
    />
  );
}

export default SignupPage;
