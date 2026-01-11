import { Link } from "react-router-dom";
import { Shield, AlertTriangle, Home } from "lucide-react";

function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex flex-col items-center justify-center p-6">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-2xl w-full text-center space-y-8">
        {/* Animated 404 Container */}
        <div className="relative">
          {/* Glowing background effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 blur-2xl rounded-3xl"></div>
          
          {/* Main 404 display */}
          <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 shadow-2xl">
            {/* Shield Icon Animation */}
            <div className="inline-flex items-center justify-center mb-6 relative">
              <div className="absolute inset-0 animate-ping bg-blue-400/30 rounded-full"></div>
              <Shield className="h-16 w-16 text-blue-600 relative z-10 animate-bounce" />
            </div>

            {/* 404 Text with gradient */}
            <h1 className="text-8xl md:text-9xl font-black mb-4">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient">
                404
              </span>
            </h1>

            {/* Error Icon */}
            <div className="inline-flex items-center justify-center p-3 bg-red-50 rounded-full mb-4 animate-pulse">
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>

            {/* Title */}
            <h2 className="text-3xl font-bold text-gray-800 mb-3">
              Oops! Page Not Found
            </h2>
            
            {/* Description */}
            <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
              The page you're looking for has been moved, deleted, or might never have existed.
              Don't worry, our security scanners are keeping this area safe!
            </p>

            {/* Animated dots */}
            <div className="flex justify-center space-x-2 mb-8">
              {[...Array(3)].map((_, i) => (
                <div 
                  key={i}
                  className="h-3 w-3 bg-blue-500 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.2}s`, animationDuration: '1s' }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="group relative inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl blur opacity-0 group-hover:opacity-50 transition-opacity"></div>
            <Home className="mr-3 h-5 w-5 relative z-10" />
            <span className="relative z-10">Go Home</span>
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </Link>
          
          <Link
            to="/dashboard"
            className="group relative inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 font-semibold rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl blur opacity-0 group-hover:opacity-50 transition-opacity"></div>
            <Shield className="mr-3 h-5 w-5 relative z-10" />
            <span className="relative z-10">Go to Dashboard</span>
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gray-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </Link>
        </div>

        {/* Security Message */}
        <div className="bg-gradient-to-r from-blue-50/50 to-purple-50/50 rounded-xl p-6 border border-gray-200/50 backdrop-blur-sm">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Shield className="h-6 w-6 text-blue-500 animate-pulse" />
            <h3 className="text-lg font-semibold text-gray-800">Security Status: All Clear</h3>
          </div>
          <p className="text-gray-600">
            This 404 error is completely normal and secure. No security threats detected.
            Continue browsing safely with WebShield protection.
          </p>
        </div>

        {/* Scan suggestion */}
        <div className="text-sm text-gray-500">
          <p>
            Want to check a website's security?{" "}
            <Link to="/start-scan" className="text-blue-600 hover:text-blue-700 font-medium hover:underline">
              Run a security scan
            </Link>
          </p>
        </div>
      </div>

      {/* Floating elements */}
      <div className="absolute bottom-10 left-10 w-8 h-8 bg-blue-300/30 rounded-full animate-pulse"></div>
      <div className="absolute top-10 right-10 w-6 h-6 bg-purple-300/30 rounded-full animate-pulse delay-500"></div>
      <div className="absolute top-1/3 left-1/4 w-4 h-4 bg-blue-400/20 rounded-full animate-ping"></div>

      {/* Add CSS for gradient animation */}
      <style>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
}

export default NotFound;
