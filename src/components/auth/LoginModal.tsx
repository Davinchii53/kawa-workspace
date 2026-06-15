"use client";

import { useState } from "react";
import { signIn } from "@/lib/auth";

interface LoginModalProps {
  onSuccess: () => void;
  onClose: () => void;
}

export default function LoginModal({ onSuccess, onClose }: LoginModalProps) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);

  async function handleSubmit() {
    setError(null);
    setLoading(true);
    try {
      await signIn(email, password);
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      position:        "fixed",
      inset:           0,
      background:      "rgba(7,9,20,0.85)",
      backdropFilter:  "blur(8px)",
      zIndex:          200,
      display:         "flex",
      alignItems:      "center",
      justifyContent:  "center",
    }}>
      <div style={{
        background:    "rgba(13,31,60,0.95)",
        border:        "1px solid #1A3A5C",
        borderRadius:  "16px",
        padding:       "36px",
        width:         "360px",
        display:       "flex",
        flexDirection: "column",
        gap:           "16px",
      }}>
        <div>
          <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:"20px", fontWeight:600, color:"#E8F4FD" }}>
            Admin login
          </div>
          <div style={{ fontSize:"12px", color:"#6B8FA8", marginTop:"4px" }}>
            kawa. workspace · restricted access
          </div>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{
              background:   "rgba(10,15,30,0.8)",
              border:       "1px solid #1A3A5C",
              borderRadius: "8px",
              padding:      "10px 14px",
              color:        "#E8F4FD",
              fontSize:     "13px",
              fontFamily:   "'Inter',sans-serif",
              outline:      "none",
              width:        "100%",
            }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
            style={{
              background:   "rgba(10,15,30,0.8)",
              border:       "1px solid #1A3A5C",
              borderRadius: "8px",
              padding:      "10px 14px",
              color:        "#E8F4FD",
              fontSize:     "13px",
              fontFamily:   "'Inter',sans-serif",
              outline:      "none",
              width:        "100%",
            }}
          />
        </div>

        {error && (
          <div style={{ fontSize:"12px", color:"#E05A5A" }}>{error}</div>
        )}

        <div style={{ display:"flex", gap:"10px" }}>
          <button
            onClick={onClose}
            style={{
              flex:         1,
              padding:      "11px",
              background:   "transparent",
              border:       "1px solid #1A3A5C",
              borderRadius: "8px",
              color:        "#6B8FA8",
              fontFamily:   "'Space Grotesk',sans-serif",
              fontSize:     "13px",
              cursor:       "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              flex:         2,
              padding:      "11px",
              background:   loading ? "rgba(79,172,222,0.5)" : "#4FACDE",
              border:       "none",
              borderRadius: "8px",
              color:        "#0A0F1E",
              fontFamily:   "'Space Grotesk',sans-serif",
              fontSize:     "13px",
              fontWeight:   600,
              cursor:       loading ? "default" : "pointer",
              transition:   "background 0.15s ease",
            }}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}