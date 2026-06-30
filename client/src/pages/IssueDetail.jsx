import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/firebase';
import { useAdmin } from '../lib/useAdmin';
import { api } from '../lib/api';
import { ArrowLeft, Trash2, MapPin, Clock, AlertTriangle, ThumbsUp, CheckCircle, Loader2, Shield, Check } from 'lucide-react';

const severityColors = {
  low: '#34D399',
  medium: '#F59E0B',
  high: '#F97316',
  critical: '#EF4444',
};

const severityLabels = { low: 'Low', medium: 'Medium', high: 'High', critical: 'Critical' };

const categoryColors = {
  pothole: '#EF4444', streetlight: '#F59E0B', 'water-leak': '#5E6AD2', trash: '#22C55E',
  graffiti: '#A855F7', sidewalk: '#F97316', 'traffic-sign': '#06B6D4', drainage: '#14B8A6',
  vegetation: '#84CC16', other: '#6B7280',
};

export default function IssueDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [upvoted, setUpvoted] = useState(false);
  const [upvoting, setUpvoting] = useState(false);
  const [upvoteError, setUpvoteError] = useState("");
  const [statusUpdating, setStatusUpdating] = useState(false);

  useEffect(() => {
    api.get(`/api/issues/${id}`).then((res) => {
      if (res.success) setIssue(res.data);
      setLoading(false);
    });
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('Delete this issue permanently?')) return;
    const token = await user.getIdToken();
    const res = await api.delete(`/api/issues/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.success) navigate('/', { state: { refetch: Date.now() }, replace: true });
  };

  const handleUpvote = async () => {
    if (upvoted || upvoting) return;
    if (user && issue.reportedBy === user.uid) {
      setUpvoteError("You cannot upvote your own issue");
      return;
    }
    setUpvoteError("");
    setUpvoting(true);
    const res = await api.patch(`/api/issues/${id}/upvote`, { userId: user?.uid });
    setUpvoting(false);
    if (res.success) {
      setIssue((prev) => ({ ...prev, upvotes: res.data.upvotes, verified: res.data.verified }));
      setUpvoted(true);
    } else {
      setUpvoteError(res.error || "Already voted");
      if (res.error === "Already voted") setUpvoted(true);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setStatusUpdating(true);
    const token = await user.getIdToken();
    const res = await api.patch(`/api/issues/${id}/status`, { status: newStatus }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setStatusUpdating(false);
    if (res.success) setIssue((prev) => ({ ...prev, status: newStatus }));
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
        <div className="flex items-center gap-3 text-[var(--fg-muted)]">
          <div className="w-5 h-5 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Loading issue...</span>
        </div>
      </div>
    );
  }

  if (!issue) return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
      <p className="text-[var(--fg-muted)]">Issue not found.</p>
    </div>
  );

  const isOwner = user && issue.reportedBy === user.uid;

  return (
    <div className="min-h-[calc(100vh-3.5rem)] px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors mb-6 group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back</span>
        </button>

        {issue.imageUrl && (
          <img
            src={issue.imageUrl}
            alt={issue.title}
            className="w-full h-64 sm:h-80 object-cover rounded-2xl mb-6 border border-white/[0.06]"
          />
        )}

        <div className="flex items-start justify-between gap-4 mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--fg)] tracking-tight" style={{ fontFamily: '"Sora", sans-serif' }}>
            {issue.title}
          </h1>
          {isOwner && (
            <button
              onClick={handleDelete}
              className="flex items-center gap-1.5 text-sm text-[var(--color-critical)] hover:text-red-400 transition-colors shrink-0 px-3 py-1.5 rounded-xl hover:bg-[var(--color-critical)]/10"
            >
              <Trash2 size={14} />
              Delete
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap mb-6">
          <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium text-white" style={{ backgroundColor: categoryColors?.[issue.category] || '#6B7280' }}>
            {issue.category}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium text-white" style={{ backgroundColor: severityColors[issue.severity] || '#6B7280' }}>
            <AlertTriangle size={12} />
            {severityLabels[issue.severity] || issue.severity}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium text-white" style={{
            backgroundColor: issue.status === "resolved" ? "#34D399" : issue.status === "in_progress" ? "#6872D9" : "#5E6AD2",
          }}>
            {(issue.status || "reported").replace("_", " ")}
          </span>
          <button
            onClick={handleUpvote}
            disabled={upvoted || upvoting || isOwner}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
              upvoted || upvoting || isOwner
                ? "bg-white/[0.04] text-[var(--fg-subtle)] cursor-default"
                : "bg-white/[0.04] text-[var(--fg-muted)] hover:bg-[var(--accent)]/15 hover:text-[var(--accent)]"
            }`}
          >
            {upvoting ? <Loader2 size={12} className="animate-spin" /> : <ThumbsUp size={12} />}
            {issue.upvotes || 0}
          </button>
        </div>

        {upvoteError && (
          <p className="text-xs text-[var(--color-critical)] mb-4">{upvoteError}</p>
        )}

        {issue.verified ? (
          <div className="flex items-center gap-2 text-[var(--color-success)] bg-[var(--color-success)]/10 rounded-xl px-4 py-2.5 text-sm font-medium mb-6 border border-[var(--color-success)]/20">
            <CheckCircle size={16} />
            Verified by Community
          </div>
        ) : (
          <p className="text-[var(--fg-subtle)] text-xs mb-6">{issue.upvotes || 0}/3 votes to verify</p>
        )}

        {isAdmin && (
          <div className="flex items-center gap-2 flex-wrap mb-6 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <div className="flex items-center gap-1 text-xs text-[var(--accent)] bg-[var(--accent)]/10 rounded-full px-2.5 py-1 font-medium mr-1">
              <Shield size={12} />
              Admin
            </div>
            {["reported", "in_progress", "resolved"].map((s) => {
              const colors = {
                reported: { bg: "#5E6AD2", label: "Open" },
                in_progress: { bg: "#6872D9", label: "In Progress" },
                resolved: { bg: "#34D399", label: "Resolved" },
              };
              const active = issue.status === s;
              return (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  disabled={active || statusUpdating}
                  className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                    active
                      ? "text-white cursor-default"
                      : "bg-white/[0.04] text-[var(--fg-muted)] hover:bg-white/[0.08] hover:text-[var(--fg)]"
                  }`}
                  style={active ? { backgroundColor: colors[s].bg } : {}}
                >
                  {active && <Check size={12} />}
                  {colors[s].label}
                </button>
              );
            })}
          </div>
        )}

        <div className="prose prose-invert max-w-none">
          <p className="text-[var(--fg)] leading-relaxed">{issue.description}</p>
        </div>

        {issue.summary && (
          <p className="mt-3 text-[var(--fg-muted)] text-sm italic">{issue.summary}</p>
        )}

        <div className="mt-8 pt-6 border-t border-white/[0.06] flex flex-col gap-3 text-sm text-[var(--fg-muted)]">
          {issue.location?.lat && issue.location?.lng && (
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-[var(--fg-subtle)]" />
              <span>{issue.location.lat.toFixed(4)}, {issue.location.lng.toFixed(4)}</span>
            </div>
          )}
          {issue.location?.address && (
            <p className="text-xs text-[var(--fg-subtle)]">{issue.location.address}</p>
          )}
          {issue.createdAt && (
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-[var(--fg-subtle)]" />
              <span>Reported {new Date(issue.createdAt.seconds * 1000 || issue.createdAt).toLocaleDateString()}</span>
            </div>
          )}
          {issue.estimatedResolutionDays && (
            <p>Estimated resolution: {issue.estimatedResolutionDays} days</p>
          )}
        </div>

        {issue.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-6">
            {issue.tags.map((tag) => (
              <span key={tag} className="text-xs bg-white/[0.04] text-[var(--fg-muted)] px-3 py-1 rounded-full border border-white/[0.06]">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
