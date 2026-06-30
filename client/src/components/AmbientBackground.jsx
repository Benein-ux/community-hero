import { useEffect, useRef, useState } from 'react';

const noiseSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
  <filter id="noise">
    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" stitchTiles="stitch"/>
  </filter>
  <rect width="100%" height="100%" filter="url(#noise)" opacity="1"/>
</svg>
`;

const noiseBase64 = `data:image/svg+xml;base64,${btoa(noiseSvg)}`;

const BLOB_SIZES = ['900px', '1100px', '800px'];
const BLOB_BLURS = ['150px', '120px', '140px'];
const BLOB_OPACITIES = ['0.20', '0.15', '0.12'];
const BLOB_TOP_OFFSETS = ['-200px', '-300px', '-150px'];
const BLOB_LEFT_OFFSETS = ['-300px', '60%', '10%'];
const BLOB_DELAYS = ['0s', '2s', '4s'];
const BLOB_DURATIONS = ['9s', '10s', '8s'];

export default function AmbientBackground() {
  const [mounted, setMounted] = useState(false);
  const blobsRef = useRef([]);

  useEffect(() => {
    setMounted(true);
    // Generate random blob positions on mount
    blobsRef.current = Array.from({ length: 3 }, (_, i) => ({
      size: BLOB_SIZES[i],
      blur: BLOB_BLURS[i],
      opacity: BLOB_OPACITIES[i],
      top: BLOB_TOP_OFFSETS[i],
      left: BLOB_LEFT_OFFSETS[i],
      delay: BLOB_DELAYS[i],
      duration: BLOB_DURATIONS[i],
    }));
  }, []);

  if (!mounted) return null;

  return (
    <>
      {/* Layer 1: Radial Gradient Base */}
      <div
        className="fixed inset-0 z-[-50]"
        style={{
          background: 'radial-gradient(ellipse at top, #0a0a0f 0%, #050506 50%, #020203 100%)',
        }}
      />

      {/* Layer 2: Noise Texture */}
      <div
        className="fixed inset-0 z-[-40]"
        style={{
          backgroundImage: `url(${noiseBase64})`,
          backgroundRepeat: 'repeat',
          backgroundSize: '256px 256px',
          opacity: 0.015,
          pointerEvents: 'none',
        }}
      />

      {/* Layer 3: Floating Blurred Gradient Blobs */}
      <div className="fixed inset-0 z-[-30] pointer-events-none" aria-hidden="true">
        {blobsRef.current.map((blob, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: blob.size,
              height: blob.size,
              top: blob.top,
              left: blob.left,
              filter: `blur(${blob.blur})`,
              opacity: blob.opacity,
              background: `radial-gradient(circle at center, var(--accent) 0%, transparent 70%)`,
              animation: `float ${blob.duration} ease-in-out infinite ${blob.delay}`,
            }}
          />
        ))}
      </div>

      {/* Layer 4: Grid Pattern Overlay */}
      <div
        className="fixed inset-0 z-[-20] grid-overlay pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px',
        }}
      />
    </>
  );
}