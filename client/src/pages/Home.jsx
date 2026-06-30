import { useEffect, useState, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Link, useLocation } from 'react-router-dom';
import { Plus, Trash2, RotateCcw } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { api } from '../lib/api';
import { useAuth } from '../lib/firebase';

const categoryColors = {
  pothole: '#EF4444',
  streetlight: '#F59E0B',
  'water-leak': '#5E6AD2',
  trash: '#22C55E',
  graffiti: '#A855F7',
  sidewalk: '#F97316',
  'traffic-sign': '#06B6D4',
  drainage: '#14B8A6',
  vegetation: '#84CC16',
  other: '#6B7280',
};

function createIcon(category, verified) {
  const color = categoryColors[category] || '#6B7280';
  return L.divIcon({
    className: '',
    html: `<div style="width:20px;height:20px;background:${color};border:3px solid rgba(255,255,255,0.9);border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.5),0 0 16px ${color}40;position:relative;transition:transform 0.2s ease;">${
      verified ? '<span style="position:absolute;top:-6px;right:-6px;background:#22C55E;color:white;border-radius:50%;width:14px;height:14px;font-size:9px;line-height:14px;text-align:center;border:2px solid #050506;box-shadow:0 1px 4px rgba(0,0,0,0.4);">✓</span>' : ''
    }</div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

function FitBounds({ issues }) {
  const map = useMap();
  const fitted = useRef(false);
  useEffect(() => {
    if (fitted.current || issues.length === 0) return;
    const bounds = L.latLngBounds(issues.map((i) => [i.lat, i.lng]));
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50] });
      fitted.current = true;
    }
  }, [issues, map]);
  return null;
}

const seen = {};
function jitterPosition(lat, lng, id) {
  const key = `${lat},${lng}`;
  if (!seen[key]) seen[key] = 0;
  seen[key]++;
  if (seen[key] === 1) return { lat, lng };
  const offset = (seen[key] - 1) * 0.0001;
  return { lat: lat + offset, lng: lng + offset };
}
function resetSeen() { Object.keys(seen).forEach((k) => delete seen[k]); }

export default function Home() {
  const { user } = useAuth();
  const location = useLocation();
  const [issues, setIssues] = useState([]);

  const fetchIssues = useCallback(() => {
    api.get('/api/issues').then((res) => {
      if (res.success) {
        resetSeen();
        setIssues(res.data);
      }
    });
  }, []);

  useEffect(() => {
    fetchIssues();
    const onFocus = () => fetchIssues();
    const onVisibility = () => { if (document.visibilityState === 'visible') fetchIssues(); };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [fetchIssues]);

  useEffect(() => {
    const interval = setInterval(fetchIssues, 10000);
    return () => clearInterval(interval);
  }, [fetchIssues]);

  useEffect(() => {
    if (location.state?.refetch) fetchIssues();
  }, [location.state, fetchIssues]);

  const handleDelete = async (issueId, e) => {
    e.stopPropagation();
    if (!confirm('Delete this issue?')) return;
    const token = await user.getIdToken();
    await api.delete(`/api/issues/${issueId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchIssues();
  };

  const positionedIssues = issues
    .filter((i) => i.location?.lat && i.location?.lng)
    .map((i) => ({ ...i, ...jitterPosition(i.location.lat, i.location.lng, i.id) }));

  return (
    <div className="relative h-[calc(100vh-3.5rem)] w-full">
      <MapContainer
        center={[20, 0]}
        zoom={2}
        className="h-full w-full"
        zoomControl={false}
        style={{ background: '#050506' }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <FitBounds issues={positionedIssues} />
        {positionedIssues.map((issue) => (
          <Marker
            key={issue.id}
            position={[issue.lat, issue.lng]}
            icon={createIcon(issue.category, issue.verified)}
          >
            <Popup>
              <div className="text-[#0F1117] text-sm max-w-[240px]">
                {issue.imageUrl && (
                  <img
                    src={issue.imageUrl}
                    alt={issue.title}
                    className="w-full h-32 object-cover rounded-lg mb-2"
                  />
                )}
                <strong className="text-base block">{issue.title}</strong>
                <p className="text-[#64748B] mt-1 line-clamp-2">{issue.summary || issue.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className="inline-block rounded-full px-2 py-0.5 text-xs font-medium text-white"
                    style={{ backgroundColor: categoryColors[issue.category] || '#6B7280' }}
                  >
                    {issue.category}
                  </span>
                  <span className="text-xs text-[#64748B]">▲ {issue.upvotes || 0}</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Link
                    to={`/issue/${issue.id}`}
                    className="text-[var(--accent)] text-xs font-medium hover:underline"
                  >
                    View Details
                  </Link>
                  {user && issue.reportedBy === user.uid && (
                    <button
                      onClick={(e) => handleDelete(issue.id, e)}
                      className="ml-auto text-[#EF4444] hover:text-red-500 transition-colors"
                      title="Delete issue"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* FAB — Report Issue */}
      <Link
        to="/report"
        className="absolute bottom-24 md:bottom-6 right-6 z-[1000] flex items-center gap-2 bg-[var(--accent)] hover:bg-[var(--accent-bright)] text-white rounded-2xl px-5 py-3 font-medium text-sm shadow-[0_0_0_1px_rgba(94,106,210,0.5),0_4px_16px_rgba(94,106,210,0.4),inset_0_1px_0_0_rgba(255,255,255,0.15)] hover:shadow-[0_0_0_1px_rgba(94,106,210,0.6),0_8px_24px_rgba(94,106,210,0.5),inset_0_1px_0_0_rgba(255,255,255,0.15)] transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
      >
        <Plus size={20} />
        <span className="hidden sm:inline">Report Issue</span>
      </Link>

      {/* Refresh Button */}
      <button
        onClick={fetchIssues}
        className="absolute bottom-24 md:bottom-6 left-6 z-[1000] flex items-center justify-center w-12 h-12 bg-[#0a0a0c]/90 backdrop-blur-xl border border-white/[0.08] text-[var(--fg-muted)] rounded-2xl shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_4px_16px rgba(0,0,0,0.4)] hover:bg-[#0a0a0c] hover:text-[var(--fg)] hover:border-white/[0.12] transition-all duration-200 ease-out active:scale-95"
        title="Refresh Map"
      >
        <RotateCcw size={18} />
      </button>
    </div>
  );
}
