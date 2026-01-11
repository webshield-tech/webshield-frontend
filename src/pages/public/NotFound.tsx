import { Link } from "react-router-dom";
import { ShieldAlert, Home, Zap } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0b1220] via-[#0f172a] to-black text-white px-6">
      
      <div className="relative max-w-xl w-full text-center">
        
        {/* Glow Effect */}
        <div className="absolute inset-0 blur-3xl bg-blue-500/20 rounded-full"></div>

        {/* Card */}
        <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-10 shadow-xl">

          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/40 blur-xl rounded-full animate-pulse"></div>
              <ShieldAlert className="relative h-20 w-20 text-blue-400" />
            </div>
          </div>

          {/* 404 */}
          <h1 className="text-7xl font-extrabold tracking-widest text-blue-400 mb-4">
            404
          </h1>

          <h2 className="text-2xl font-semibold mb-3">
            Access Point Not Found
          </h2>

          <p className="text-gray-400 mb-8">
            This route is not available or has been blocked by
            <span className="text-blue-400 font-medium"> WebShield Security</span>.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 transition font-medium"
            >
              <Home size={18} />
              Home
            </Link>

            <Link
              to="/start-scan"
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-blue-500/40 hover:bg-blue-500/10 transition font-medium"
            >
              <Zap size={18} />
              Run Scan
            </Link>
          </div>

          {/* Footer Text */}
          <p className="mt-8 text-xs text-gray-500">
            WebShield • Real-time Protection Enabled
          </p>
        </div>
      </div>
    </div>
  );
}
