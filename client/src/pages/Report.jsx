import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuth } from '../lib/firebase';
import { api } from '../lib/api';
import { Camera, MapPin, Loader2, Upload, Crosshair, ChevronDown, ChevronUp } from 'lucide-react';

const pinIcon = L.divIcon({
  className: '',
  html: `<div style="width:24px;height:24px;background:#5E6AD2;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.5),0 0 16px rgba(94,106,210,0.4);transform:translate(-50%,-50%)"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function Report() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState({ lat: '', lng: '', address: '' });
  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showCoords, setShowCoords] = useState(false);

  const hasCoords = location.lat !== '' && location.lng !== '';

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const detectLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLocation((prev) => ({ ...prev, lat: lat.toString(), lng: lng.toString() }));
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
          );
          const data = await res.json();
          if (data.display_name) {
            setLocation((prev) => ({ ...prev, address: data.display_name }));
          }
        } catch {
          // reverse geocode failed silently
        }
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true }
    );
  };

  const handleMapClick = useCallback((lat, lng) => {
    setLocation((prev) => ({ ...prev, lat: lat.toFixed(6), lng: lng.toFixed(6) }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image || !title || !description || !location.lat || !location.lng) return;

    setSubmitting(true);
    const token = await user.getIdToken();
    const formData = new FormData();
    formData.append('image', image);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('lat', location.lat);
    formData.append('lng', location.lng);
    formData.append('address', location.address);

    try {
      const res = await api.post('/api/issues', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.success) navigate('/', { state: { refetch: Date.now() }, replace: true });
    } catch (err) {
      console.error('Failed to submit issue', err);
    }
    setSubmitting(false);
  };

  const inputClass = "w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-[var(--fg)] placeholder-[var(--fg-subtle)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/30 transition-all duration-200";
  const disabledInputClass = inputClass + " opacity-60 cursor-not-allowed";

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-start justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="w-full max-w-xl">
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--fg)] tracking-tight" style={{ fontFamily: '"Sora", sans-serif' }}>
            Report Issue
          </h1>
          <p className="text-[var(--fg-muted)] mt-2">Help improve your community by reporting problems.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 stagger-children">
          <div
            onClick={() => fileRef.current?.click()}
            className="relative flex flex-col items-center justify-center h-56 rounded-2xl border-2 border-dashed border-white/[0.08] bg-white/[0.02] cursor-pointer hover:border-[var(--accent)]/40 hover:bg-white/[0.04] transition-all duration-300 ease-out overflow-hidden group"
          >
            {preview ? (
              <>
                <img src={preview} alt="Preview" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-sm font-medium text-white">Click to change</span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-3 text-[var(--fg-subtle)]">
                <div className="p-3 rounded-xl bg-white/[0.05] group-hover:bg-[var(--accent)]/10 transition-colors">
                  <Camera size={28} />
                </div>
                <div className="text-center">
                  <span className="text-sm font-medium text-[var(--fg-muted)]">Upload an image</span>
                  <p className="text-xs text-[var(--fg-subtle)] mt-1">Click to browse</p>
                </div>
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} className="hidden" />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--fg-muted)] mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Broken streetlight on Main St"
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--fg-muted)] mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue in detail..."
              rows={4}
              className={inputClass + " resize-none"}
              required
            />
          </div>

          {/* Location Section */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--fg-muted)] mb-2">Address or landmark</label>
              <input
                type="text"
                value={location.address}
                onChange={(e) => setLocation((prev) => ({ ...prev, address: e.target.value }))}
                placeholder="e.g. Near City Mall, MG Road"
                className={inputClass}
              />
              <p className="mt-1.5 text-xs text-[var(--fg-subtle)]">Where is this issue located?</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--fg-muted)] mb-2">Pick location on map</label>
              <p className="text-xs text-[var(--fg-subtle)] mb-2">Click anywhere on the map to drop a pin</p>
              <div className="rounded-xl overflow-hidden border border-white/[0.08] bg-[#050506]">
                <MapContainer
                  center={hasCoords ? [parseFloat(location.lat), parseFloat(location.lng)] : [20, 0]}
                  zoom={hasCoords ? 14 : 2}
                  className="h-[240px] w-full"
                  zoomControl={false}
                  style={{ background: '#050506' }}
                >
                  <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                  />
                  <MapClickHandler onMapClick={handleMapClick} />
                  {hasCoords && (
                    <Marker
                      position={[parseFloat(location.lat), parseFloat(location.lng)]}
                      icon={pinIcon}
                    />
                  )}
                </MapContainer>
              </div>
              {hasCoords && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-2 h-2 rounded-full bg-[var(--accent)]" />
                  <span className="text-xs text-[var(--fg-muted)] font-mono">
                    {parseFloat(location.lat).toFixed(4)}, {parseFloat(location.lng).toFixed(4)}
                  </span>
                </div>
              )}
            </div>

            <div>
              <button
                type="button"
                onClick={detectLocation}
                disabled={locating}
                className="flex items-center gap-2 text-sm text-[var(--accent)] hover:text-[var(--accent-bright)] transition-colors"
              >
                {locating ? <Loader2 size={16} className="animate-spin" /> : <Crosshair size={16} />}
                {locating ? 'Detecting...' : 'Use my current location'}
              </button>
            </div>

            <div className="border-t border-white/[0.04] pt-3">
              <button
                type="button"
                onClick={() => setShowCoords(!showCoords)}
                className="flex items-center gap-1.5 text-xs text-[var(--fg-subtle)] hover:text-[var(--fg-muted)] transition-colors"
              >
                {showCoords ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                {showCoords ? 'Hide coordinates' : 'Show coordinates'}
              </button>

              {showCoords && (
                <div className="flex gap-3 mt-3">
                  <div className="flex-1">
                    <label className="block text-[11px] text-[var(--fg-subtle)] mb-1 font-mono uppercase tracking-wider">Latitude</label>
                    <input
                      type="text"
                      value={location.lat}
                      onChange={(e) => setLocation((p) => ({ ...p, lat: e.target.value }))}
                      placeholder="0.000000"
                      className={hasCoords ? disabledInputClass : inputClass}
                      readOnly={hasCoords}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[11px] text-[var(--fg-subtle)] mb-1 font-mono uppercase tracking-wider">Longitude</label>
                    <input
                      type="text"
                      value={location.lng}
                      onChange={(e) => setLocation((p) => ({ ...p, lng: e.target.value }))}
                      placeholder="0.000000"
                      className={hasCoords ? disabledInputClass : inputClass}
                      readOnly={hasCoords}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || !image || !title || !description || !location.lat || !location.lng}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-bright)] text-white font-medium px-6 py-3.5 shadow-[0_0_0_1px_rgba(94,106,210,0.5),0_4px_16px_rgba(94,106,210,0.3),inset_0_1px_0_0_rgba(255,255,255,0.15)] hover:shadow-[0_0_0_1px_rgba(94,106,210,0.6),0_8px_24px_rgba(94,106,210,0.4),inset_0_1px_0_0_rgba(255,255,255,0.15)] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 ease-out active:scale-[0.98]"
          >
            {submitting ? <Loader2 size={20} className="animate-spin" /> : <Upload size={20} />}
            {submitting ? 'Submitting...' : 'Submit Report'}
          </button>
        </form>
      </div>
    </div>
  );
}
