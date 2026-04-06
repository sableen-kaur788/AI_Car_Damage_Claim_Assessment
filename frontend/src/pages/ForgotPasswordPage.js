import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthShell from "../components/AuthShell";
import api from "../services/api";
import { getApiErrorMessage } from "../services/errors";

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [values, setValues] = useState({ email: "" });
  const [error, setError] = useState("");
  const [helper, setHelper] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setValues((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setHelper("");
    setLoading(true);
    try {
      const response = await api.post("/auth/forgot-password", values);
      if (response.data.reset_token) {
        setHelper("Reset token generated. Redirecting you to the reset password page...");
        setTimeout(() => {
          navigate(`/reset-password?token=${encodeURIComponent(response.data.reset_token)}`, { replace: true });
        }, 700);
      } else {
        setHelper(`${response.data.message} Check your email or internal delivery flow for the reset link.`);
      }
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Unable to process forgot password."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Forgot password"
      subtitle="Generate a short-lived reset token for your account."
      fields={[{ name: "email", label: "Email", type: "email", placeholder: "you@example.com" }]}
      values={values}
      onChange={handleChange}
      onSubmit={handleSubmit}
      submitLabel="Generate Reset Token"
      error={error}
      helper={helper}
      loading={loading}
      footer={
        <p>
          Back to <Link to="/login">login</Link>
        </p>
      }
    />
  );
}

export default ForgotPasswordPage;
