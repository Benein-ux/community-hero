import { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth, signOutUser } from '../lib/firebase';
import { api } from '../lib/api';
import BadgeDisplay from './BadgeDisplay';
import AmbientBackground from './AmbientBackground';
import { LogIn, Map, ListTodo, LayoutDashboard, Trophy, LogOut, ChevronDown, Star, Flag, Shield } from 'lucide-react';

const NAV_ITEMS = [
  { to: "/", icon: Map, label: "Home" },
  { to: "/report", icon: ListTodo, label: "Report" },
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/leaderboard", icon: Trophy, label: "Leaderboard" },
];

function NavLink({ to, icon: Icon, label, isActive, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-medium transition-all duration-200 ease-out group ${
        isActive
          ? "text-[var(--fg)]"
          : "text-[var(--fg-muted)] hover:text-[var(--fg)]"
      }`}
    >
      {isActive && (
        <span className="absolute inset-0 bg-white/[0.06] rounded-xl border border-white/[0.06]" />
      )}
      <Icon size={16} className="relative shrink-0" />
      <span className="relative">{label}</span>
    </Link>
  );
}

function Dropdown({ isOpen, onClose, children, triggerRef, align }) {
  if (!isOpen) return null;
  return (
    <>
      <div className="fixed inset-0 z-[999]" onClick={onClose} aria-hidden="true" />
      <div
        ref={triggerRef}
        className={`absolute z-[1000] ${align} mt-2 bg-[#0a0a0c]/95 backdrop-blur-2xl border border-white/[0.08] rounded-2xl overflow-hidden min-w-[240px] shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_16px_64px_rgba(0,0,0,0.6),0_0_120px_rgba(94,106,210,0.08)] animate-in fade-in-0 zoom-in-95 duration-200 ease-out`}
      >
        {children}
      </div>
    </>
  );
}

export default function Layout() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [userStats, setUserStats] = useState(null);
  const [prevPath, setPrevPath] = useState(location.pathname);
  const [transitioning, setTransitioning] = useState(false);
  const desktopDropdownRef = useRef(null);
  const mobileDropdownRef = useRef(null);

  useEffect(() => {
    if (location.pathname !== prevPath) {
      setTransitioning(true);
      const t = setTimeout(() => {
        setPrevPath(location.pathname);
        setTransitioning(false);
      }, 150);
      return () => clearTimeout(t);
    }
  }, [location.pathname, prevPath]);

  useEffect(() => {
    if (user) {
      api.get(`/api/users/${user.uid}`).then((res) => {
        if (res.success) setUserStats(res.data);
      });
    } else {
      setUserStats(null);
    }
  }, [user]);

  const handleLogout = async () => {
    setShowDropdown(false);
    await signOutUser();
    navigate('/login');
  };

  const isActive = (path) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  const renderDropdownContent = (close) => (
    <>
      <div className="px-4 py-3 border-b border-white/[0.06]">
        <p className="text-sm font-medium text-[var(--fg)]">{user?.displayName}</p>
        <p className="text-xs text-[var(--fg-muted)] mt-0.5">{user?.email}</p>
      </div>
      <div className="px-4 py-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-4">
          <p className="flex items-center gap-1.5 text-xs text-[var(--fg-muted)]">
            <Star size={12} className="text-[var(--accent)]" />
            <span className="text-[var(--fg)] font-semibold">{userStats?.points || 0}</span> pts
          </p>
          <p className="flex items-center gap-1.5 text-xs text-[var(--fg-muted)]">
            <Flag size={12} className="text-[var(--accent)]" />
            <span className="text-[var(--fg)] font-semibold">{userStats?.issuesReported || 0}</span> issues
          </p>
        </div>
        {userStats?.badges?.length > 0 && (
          <div className="mt-2.5 pt-2.5 border-t border-white/[0.06]">
            <BadgeDisplay badges={userStats.badges} size={18} />
          </div>
        )}
      </div>
      <div className="py-1">
        <Link
          to="/admin-access"
          onClick={close}
          className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-white/[0.04] transition-colors"
        >
          <Shield size={14} />
          Become an Admin
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-[var(--color-critical)] hover:bg-white/[0.04] transition-colors"
        >
          <LogOut size={14} />
          Log Out
        </button>
      </div>
    </>
  );

  if (loading) return null;

  return (
    <div className="min-h-screen text-[var(--fg)]">
      <AmbientBackground />

      {/* Header — z-[1000] to sit above Leaflet maps */}
      <header className="fixed top-0 left-0 right-0 z-[1000]">
        <div className="backdrop-blur-2xl bg-[#050506]/70 border-b border-white/[0.04]">
          <div className="flex h-14 items-center px-4 sm:px-6 lg:px-8 max-w-[1800px] mx-auto">
            {/* Logo — far left */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0" onClick={() => setShowDropdown(false)}>
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent)] to-[var(--accent-bright)] shadow-[0_0_0_1px_rgba(94,106,210,0.4),0_2px_8px_rgba(94,106,210,0.3)]">
                <Map size={16} className="text-white" />
              </div>
              <span className="text-[15px] font-semibold text-[var(--fg)] hidden sm:block" style={{ fontFamily: '"Sora", sans-serif' }}>
                CommunityHero
              </span>
            </Link>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Nav — right-aligned */}
            <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  icon={item.icon}
                  label={item.label}
                  isActive={isActive(item.to)}
                  onClick={() => setShowDropdown(false)}
                />
              ))}
            </nav>

            {/* Divider */}
            <div className="hidden md:block w-px h-5 bg-white/[0.06] mx-3" />

            {/* User — far right (hidden on mobile, bottom nav handles it) */}
            <div className="relative hidden md:block">
              {user ? (
                <>
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-white/[0.05] transition-all duration-200"
                    aria-label="User menu"
                    aria-expanded={showDropdown}
                    aria-haspopup="true"
                  >
                    <img src={user.photoURL} alt="" className="w-7 h-7 rounded-full ring-1 ring-white/[0.1]" />
                    <span className="hidden lg:block truncate max-w-[100px] text-[13px] font-medium text-[var(--fg-muted)]">{user.displayName}</span>
                    <ChevronDown size={12} className={`text-[var(--fg-subtle)] transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  <Dropdown
                    isOpen={showDropdown}
                    onClose={() => setShowDropdown(false)}
                    triggerRef={desktopDropdownRef}
                    align="right-0"
                  >
                    {renderDropdownContent(() => setShowDropdown(false))}
                  </Dropdown>
                </>
              ) : (
                <Link to="/login" className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-[13px] font-medium text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-white/[0.05] transition-all duration-200">
                  <LogIn size={15} />
                  <span>Sign In</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content — pt-14 for header, pb-20 for mobile bottom nav */}
      <main className="min-h-screen pt-14 pb-20 md:pb-0">
        <div
          className={`transition-opacity duration-150 ease-out ${transitioning ? 'opacity-0' : 'opacity-100'}`}
        >
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[1000] bg-[#050506]/80 backdrop-blur-2xl border-t border-white/[0.04]">
        <ul className="flex justify-around py-2 px-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.to);
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={`flex flex-col items-center gap-1 px-3 py-1.5 text-[10px] font-medium transition-all duration-200 rounded-xl ${
                    active
                      ? "text-[var(--accent)]"
                      : "text-[var(--fg-subtle)] active:text-[var(--fg)]"
                  }`}
                  onClick={() => setShowDropdown(false)}
                >
                  <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
                  {item.label}
                </Link>
              </li>
            );
          })}
          <li className="relative">
            {user ? (
              <>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex flex-col items-center gap-1 px-3 py-1.5 text-[10px] font-medium text-[var(--fg-subtle)]"
                >
                  <img src={user.photoURL} alt="" className="w-5 h-5 rounded-full ring-1 ring-white/[0.1]" />
                  Profile
                </button>
                <Dropdown
                  isOpen={showDropdown}
                  onClose={() => setShowDropdown(false)}
                  triggerRef={mobileDropdownRef}
                  align="bottom-full right-0 mb-2"
                >
                  {renderDropdownContent(() => setShowDropdown(false))}
                </Dropdown>
              </>
            ) : (
              <Link to="/login" className="flex flex-col items-center gap-1 px-3 py-1.5 text-[10px] font-medium text-[var(--fg-subtle)]">
                <LogIn size={20} strokeWidth={1.8} />
                Sign In
              </Link>
            )}
          </li>
        </ul>
      </nav>
    </div>
  );
}
