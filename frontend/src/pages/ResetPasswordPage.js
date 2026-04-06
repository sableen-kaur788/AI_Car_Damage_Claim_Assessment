import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AuthShell from "../components/AuthShell";
import api from "../services/api";
import { getApiErrorMessage } from "../services/errors";

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [values, setValues] = useState({ token: "", new_password: "" });
  const [error, setError] = useState("");
  const [helper, setHelper] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const tokenFromUrl = searchParams.get("token");
    if (tokenFromUrl) {
      setValues((current) => ({ ...current, token: tokenFromUrl }));
    }
  }, [searchParams]);

  const handleChange = (event) => {
    setValues((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setHelper("");
    setLoading(true);
    try {
      const response = await api.post("/auth/reset-password", values);
      setHelper(response.data.message);
      setTimeout(() => navigate("/login", { replace: true }), 1000);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Unable to reset password."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Reset password"
      subtitle="Set your new password. If you came from forgot password, the reset token will already be filled in."
      fields={[
        { name: "token", label: "Reset Token", type: "text", placeholder: "Paste reset token" },
        { name: "new_password", label: "New Password", type: "password", placeholder: "At least 6 characters" },
      ]}
      values={values}
      onChange={handleChange}
      onSubmit={handleSubmit}
      submitLabel="Reset Password"
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

export default ResetPasswordPage;
