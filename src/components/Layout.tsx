import { useState, useEffect, useRef } from "react";
import { NavLink, Outlet } from "react-router";

function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-slate-700 bg-slate-800">
        <nav className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <h1 className="text-lg font-bold text-white">
            Octopus Agile Rates
          </h1>
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="flex h-9 w-9 items-center justify-center rounded text-slate-300 hover:bg-slate-700 hover:text-white"
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
            >
              {menuOpen ? (
                // X icon
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                // Hamburger icon
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full z-50 mt-1 w-44 rounded-lg border border-slate-700 bg-slate-800 py-1 shadow-lg">
                <NavLink
                  to="/"
                  end
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `block px-4 py-2 text-sm ${
                      isActive
                        ? "bg-slate-700 font-semibold text-purple-400"
                        : "text-slate-300 hover:bg-slate-700 hover:text-white"
                    }`
                  }
                >
                  Home
                </NavLink>
                <NavLink
                  to="/about"
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `block px-4 py-2 text-sm ${
                      isActive
                        ? "bg-slate-700 font-semibold text-purple-400"
                        : "text-slate-300 hover:bg-slate-700 hover:text-white"
                    }`
                  }
                >
                  About
                </NavLink>
                <NavLink
                  to="/settings"
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `block px-4 py-2 text-sm ${
                      isActive
                        ? "bg-slate-700 font-semibold text-purple-400"
                        : "text-slate-300 hover:bg-slate-700 hover:text-white"
                    }`
                  }
                >
                  Settings
                </NavLink>
              </div>
            )}
          </div>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
