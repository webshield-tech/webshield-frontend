import { Link } from "react-router-dom";
import { ShieldAlert, Home, Zap } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b1220] via-[#0f172a] to-black text-white px-8 pt-16">

      <div className="max-w-4xl">

        {/* BIG 404 */}
        <h1 className="text-9xl md:text-[10rem] font-extrabold leading-none text-blue-500">
          404
        </h1>

        <h2 className="text-4xl font-bold mt-4">
          Page Not Found
        </h2>

        <p className="text-gray-400 mt-3 max-w-xl">
          This route does not exist or has been restricted by
          <span className="text-blue-400 font-medium"> WebShield Security</span>.
        </p>

        {/* Actions */}
        <div className="flex gap-5 mt-8">
          <Link
            to="/"
            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium"
          >
            <Home size={18} />
            Home
          </Link>

          <Link
            to="/start-scan"
            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium"
          >
            <Zap size={18} />
            Run Scan
          </Link>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 mt-6 text-sm text-gray-500">
          <ShieldAlert size={16} className="text-blue-400" />
          WebShield • Real-time Protection Enabled
        </div>

      </div>
    </div>
  );
}
