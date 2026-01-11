import { Link } from "react-router-dom";
import { ShieldAlert, Home, Zap } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b1220] via-[#0f172a] to-black text-white px-10 pt-24">

      {/* Content Wrapper */}
      <div className="max-w-3xl">

        {/* BIG 404 */}
        <h1 className="text-[120px] font-extrabold leading-none text-blue-500 tracking-tight">
          404
        </h1>

        <h2 className="text-4xl font-bold mt-4 mb-3">
          Page Not Found
        </h2>

        <p className="text-gray-400 max-w-xl mb-8">
          This route does not exist or has been restricted by
          <span className="text-blue-400 font-medium"> WebShield Security</span>.
        </p>

        {/* Actions */}
        <div className="flex gap-4 mb-10">
          <Link
            to="/"
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 transition font-medium"
          >
            <Home size={18} />
            Home
          </Link>

          <Link
            to="/start-scan"
            className="flex items-center gap-2 px-6 py-3 rounded-lg border border-blue-500/40 hover:bg-blue-500/10 transition font-medium"
          >
            <Zap size={18} />
            Run Scan
          </Link>
        </div>

        {/* Security Note */}
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <ShieldAlert className="text-blue-400" size={18} />
          WebShield • Real-time Protection Enabled
        </div>
      </div>
    </div>
  );
}
