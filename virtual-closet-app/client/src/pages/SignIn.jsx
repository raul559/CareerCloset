// src/pages/SignIn.jsx
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/SignIn.css";
import { auth } from "../utils/auth";
import api from "../services/api";

const isPFWEmail = (v) => /^[^\s@]+@pfw\.edu$/i.test((v || "").trim());

export default function SignIn({ onLogin, loggedIn }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");

  // if you stored a pathname in location.state, prefer that; otherwise fall back
  const from =
    location.state?.from?.pathname ||
    location.state?.from ||
    "/browse";

  // Redirect if already logged in
  React.useEffect(() => {
    if (loggedIn) {
      navigate(from, { replace: true });
    }
  }, [loggedIn, navigate, from]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !password) {
      setError("Please enter your email and password.");
      return;
    }
    if (!isPFWEmail(trimmedEmail)) {
      setError("Use your PFW email address (e.g., username@pfw.edu).");
      return;
    }

    if (isRegister) {
      // Shouldn't submit registration via this handler; safe-guard
      setError("Use the Create Account button to register.");
      return;
    }

    setLoading(true);
    try {
      // Try server login first
      let serverResult = null;
      try {
        const res = await api.post('/auth/login', {
          email: trimmedEmail,
          password
        });
        serverResult = res.data;

        // store minimal user info in storage as app expects
        const storage = remember ? localStorage : sessionStorage;
        storage.setItem('vc_temp_userEmail', res.data.user.email);
        storage.setItem('vc_temp_userName', res.data.user.name || res.data.user.email.split('@')[0]);
        storage.setItem('vc_temp_userRole', res.data.user.role || 'user');

        // call onLogin so parent app updates if provided
        if (onLogin) onLogin(trimmedEmail, password, remember);
        navigate(from, { replace: true });
        return;
      } catch (err) {
        // No fallback - login must go through server with database validation
        console.error('Server login failed:', err.message);
        setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        setLoading(false);
        return;
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateAccount(e) {
    e.preventDefault();
    setError("");
    const trimmedEmail = email.trim().toLowerCase();
    if (!name || !trimmedEmail || !password || !confirmPassword) {
      setError("Please complete all fields to create an account.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!isPFWEmail(trimmedEmail)) {
      setError("Use your PFW email address (e.g., username@pfw.edu).");
      return;
    }

    // Try to register on the server; fallback to client-side storage if server unavailable
    setLoading(true);
    try {
      try {
        const res = await api.post('/auth/register', {
          email: trimmedEmail,
          password,
          name
        });

        // store user info in preferred storage
        const storage = remember ? localStorage : sessionStorage;
        storage.setItem('vc_temp_userEmail', res.data.user.email);
        storage.setItem('vc_temp_userName', res.data.user.name || name);
        storage.setItem('vc_temp_userRole', res.data.user.role || 'user');

        // call login to verify and get user info
        const loginRes = await api.post('/auth/login', {
          email: trimmedEmail,
          password
        });
        if (loginRes.status === 200) {
          const storage2 = remember ? localStorage : sessionStorage;
          storage2.setItem('vc_temp_userEmail', loginRes.data.user.email);
          storage2.setItem('vc_temp_userName', loginRes.data.user.name || name);
          storage2.setItem('vc_temp_userRole', loginRes.data.user.role || 'user');
        }

        if (onLogin) onLogin(trimmedEmail, password, remember);
        navigate(from, { replace: true });
        return;
      } catch (err) {
        console.error('Server registration failed:', err.message);
        setError(err.response?.data?.message || 'Registration failed. Please try again.');
        setLoading(false);
        return;
      }
    } finally {
      setLoading(false);
    }
  }

  const emailInvalid = email.length > 0 && !isPFWEmail(email);

  return (
    <div className="signin-wrapper">
      <main className="signin-card">
        <h1 className="signin-title">Sign in to Career Closet</h1>
        <p className="signin-sub">Welcome back! Enter your credentials to continue.</p>

        {loggedIn ? (
          <div className="signin-success">You are now logged in!</div>
        ) : (
          <>
            {error && (
              <div role="alert" className="signin-error">{error}</div>
            )}

            {isRegister ? (
              <form onSubmit={handleCreateAccount} className="signin-form" noValidate>
                <div className="field">
                  <label htmlFor="name" className="label">Full name</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input"
                    required
                  />
                </div>

                <div className="field">
                  <label htmlFor="email-reg" className="label">Email</label>
                  <input
                    id="email-reg"
                    name="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="you@pfw.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`input ${emailInvalid ? "input-invalid" : ""}`}
                    aria-invalid={emailInvalid}
                    required
                  />
                </div>

                <div className="field">
                  <label htmlFor="password-reg" className="label">Password</label>
                  <input
                    id="password-reg"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input"
                    minLength={6}
                    required
                  />
                </div>

                <div className="field">
                  <label htmlFor="confirm" className="label">Confirm password</label>
                  <input
                    id="confirm"
                    name="confirm"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input"
                    minLength={6}
                    required
                  />
                </div>

                <div className="row-between">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      className="checkbox"
                    />
                    Remember me
                  </label>

                  <button
                    type="button"
                    onClick={() => setIsRegister(false)}
                    className="link-btn"
                  >
                    Back to sign in
                  </button>
                </div>

                <button type="submit" className="primary-btn" disabled={loading}>
                  {loading ? "Creating account..." : "Create Account"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="signin-form" noValidate>
                <div className="field">
                  <label htmlFor="email" className="label">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="you@pfw.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`input ${emailInvalid ? "input-invalid" : ""}`}
                    aria-invalid={emailInvalid}
                    aria-describedby="email-help"
                    pattern="^[^\s@]+@pfw\.edu$"
                    title="Use your PFW email (e.g., username@pfw.edu)"
                  />
                  {emailInvalid && (
                    <small id="email-help" className="help-text">
                      Email must be your PFW address (e.g., username@pfw.edu).
                    </small>
                  )}
                </div>

                <div className="field">
                  <label htmlFor="password" className="label">Password</label>
                  <div className="password-row">
                    <input
                      id="password"
                      name="password"
                      type={showPass ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input with-toggle"
                      aria-invalid={!!error && !password}
                      minLength={6}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((s) => !s)}
                      className="show-btn"
                      aria-label={showPass ? "Hide password" : "Show password"}
                    >
                      {showPass ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <div className="row-between">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      className="checkbox"
                    />
                    Remember me
                  </label>

                  <button
                    type="button"
                    onClick={() => navigate("/forgot-password")}
                    className="link-btn"
                  >
                    Forgot password?
                  </button>
                </div>

                <button type="submit" className="primary-btn" disabled={loading}>
                  {loading ? "Signing in..." : "Sign In"}
                </button>

                <p className="meta">
                  Don't have an account?{" "}
                  <button type="button" onClick={() => setIsRegister(true)} className="link-btn">
                    Create one
                  </button>
                </p>
              </form>
            )}
          </>
        )}
      </main>


    </div>
  );
}
