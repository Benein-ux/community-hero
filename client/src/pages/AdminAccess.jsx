import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/firebase';
import { api } from '../lib/api';
import { Shield, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';

export default function AdminAccess() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      const token = await user.getIdToken();
      const res = await api.post("/api/users/become-admin", { code }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.success) {
        setMessage({ type: "success", text: "You are now an admin!" });
      } else {
        setMessage({ type: "error", text: res.error || "Invalid access code" });
      }
    } catch (err) {
      setMessage({ type: "error", text: err?.error || "Something went wrong" });
    }
    setSubmitting(false);
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-[#64748B] hover:text-[#F1F5F9] transition-colors mb-6"
      >
        <ArrowLeft size={18} />
        Back
      </button>

      <div className="card p-6">
<div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl" style={{ backgroundColor: 'var(--accent-primary)' }}>
          <Shield size={24} className="text-[var(--bg-primary)]" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">Admin Access</h1>
          <p className="text-sm text-[var(--text-secondary)]">Enter the admin access code to gain moderation privileges</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-1">Admin Access Code</label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter code..."
            className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg px-3 py-2 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)]"
            disabled={submitting}
          />
        </div>

        <button
          type="submit"
          disabled={submitting || !code.trim()}
          className="w-full text-[var(--bg-primary)] rounded-lg px-4 py-2 font-medium hover:brightness-110 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: 'var(--accent-primary)' }}
        >
          {submitting ? "Verifying..." : "Submit"}
        </button>
      </form>

      {message && (
        <div
          className={`mt-4 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
            message.type === "success"
              ? "bg-[var(--success)]/10 text-[var(--success)]"
              : "bg-[var(--danger)]/10 text-[var(--danger)]"
          }`}
        >
          {message.type === "success" ? <CheckCircle size={16} /> : <XCircle size={16} />}
          {message.text}
        </div>
      )}
      </div>
    </div>
  );
}
