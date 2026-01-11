/* eslint-disable react-hooks/purity */
import { Link } from "react-router-dom";
import { Shield, AlertTriangle, Home, Lock, Zap, Globe, Sparkles } from "lucide-react";

function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-gradient-to-r from-blue-200/40 to-cyan-200/30 rounded-full mix-blend-multiply blur-3xl animate-float-slow"></div>
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-gradient-to-r from-violet-200/40 to-purple-200/30 rounded-full mix-blend-multiply blur-3xl animate-float"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-100/20 to-purple-100/20 rounded-full blur-3xl animate-pulse"></div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/40 rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-2xl w-full text-center space-y-10">
        {/* Main Card with Glass Morphism */}
        <div className="relative group">
          {/* Glowing border effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition duration-500 animate-gradient-border"></div>
          
          {/* Glass card */}
          <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl p-10 border border-white/40 shadow-2xl shadow-blue-100/50">
            {/* Animated Shield Icon */}
            <div className="relative inline-flex mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-xl animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-white to-gray-50 p-5 rounded-2xl shadow-lg">
                <div className="relative">
                  <div className="absolute inset-0 animate-ping bg-blue-400/20 rounded-full"></div>
                  <Shield className="h-20 w-20 text-gradient bg-gradient-to-r from-blue-600 to-purple-600 animate-glow" />
                </div>
              </div>
              <Sparkles className="absolute -top-2 -right-2 h-8 w-8 text-yellow-500 animate-spin-slow" />
            </div>

            {/* 404 Text */}
            <div className="mb-8">
              <h1 className="text-9xl font-black mb-4 tracking-tighter">
                <span className="relative">
                  <span className="absolute inset-0 text-gradient bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient-x blur-xl opacity-70">404</span>
                  <span className="relative text-gradient bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient-x">404</span>
                </span>
              </h1>
              
              {/* Error badge */}
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-50 to-orange-50 px-5 py-2 rounded-full border border-red-100 mb-6 animate-shake">
                <AlertTriangle className="h-5 w-5 text-red-500 animate-pulse" />
                <span className="font-semibold text-red-600">Security Protected</span>
                <Lock className="h-4 w-4 text-red-400" />
              </div>
            </div>

            {/* Title & Description */}
            <div className="space-y-6 mb-10">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-900 bg-clip-text text-transparent">
                Page Not Found
              </h2>
              
              <p className="text-gray-600 text-lg leading-relaxed max-w-lg mx-auto">
                The page you're looking for has been moved, deleted, or never existed.
                <span className="block mt-2 text-blue-600 font-medium">
                  Don't worry, our security scanners are actively protecting this area.
                </span>
              </p>

              {/* Security scanning animation */}
              <div className="flex items-center justify-center gap-3 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-green-500 animate-pulse" />
                  <span>Scanning...</span>
                </div>
                <div className="h-1 w-16 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-full animate-scan"></div>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-blue-500" />
                  <span>100% Secure</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-5 justify-center">
          <Link
            to="/"
            className="group relative inline-flex items-center justify-center px-10 py-5 rounded-2xl overflow-hidden"
          >
            {/* Button glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur-md opacity-70 group-hover:opacity-90 transition duration-500"></div>
            
            {/* Button content */}
            <div className="relative bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl px-10 py-5 w-full transform transition-all duration-300 group-hover:scale-[1.02] group-hover:-translate-y-1 shadow-xl shadow-blue-500/30">
              <div className="flex items-center justify-center gap-3">
                <Home className="h-6 w-6 group-hover:scale-110 transition-transform" />
                <span className="text-lg">Go Home</span>
              </div>
              {/* Underline effect */}
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-white/50 group-hover:w-16 transition-all duration-300"></div>
            </div>
          </Link>

          <Link
            to="/dashboard"
            className="group relative inline-flex items-center justify-center px-10 py-5 rounded-2xl overflow-hidden"
          >
            {/* Button glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur-md opacity-50 group-hover:opacity-70 transition duration-500"></div>
            
            {/* Button content */}
            <div className="relative bg-gradient-to-r from-gray-800 to-gray-900 text-white font-semibold rounded-xl px-10 py-5 w-full transform transition-all duration-300 group-hover:scale-[1.02] group-hover:-translate-y-1 shadow-xl shadow-gray-500/20">
              <div className="flex items-center justify-center gap-3">
                <Shield className="h-6 w-6 group-hover:scale-110 transition-transform" />
                <span className="text-lg">Dashboard</span>
              </div>
              {/* Underline effect */}
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-white/50 group-hover:w-20 transition-all duration-300"></div>
            </div>
          </Link>
        </div>

        {/* Security Status Panel */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-green-400 to-emerald-400 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
          <div className="relative bg-gradient-to-br from-white/80 to-emerald-50/50 backdrop-blur-sm rounded-2xl p-8 border border-emerald-100/50 shadow-lg">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-green-400/20 rounded-full animate-ping"></div>
                  <Shield className="h-12 w-12 text-green-600 relative z-10 animate-bounce-slow" />
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-bold text-gray-800">Security Status</h3>
                  <p className="text-gray-600">All systems operational</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-full">
                <div className="h-2 w-2 bg-white rounded-full animate-pulse"></div>
                <span className="font-semibold">ALL CLEAR</span>
              </div>
            </div>
            
            <p className="mt-6 text-gray-600 text-center">
              This 404 error is completely normal and secure. No threats detected.
              <span className="block mt-1 font-medium text-emerald-600">
                Continue browsing safely with WebShield protection.
              </span>
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <p className="text-gray-500 mb-3">
            Want to check a website's security?
          </p>
          <Link
            to="/start-scan"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold group"
          >
            <Zap className="h-5 w-5 group-hover:scale-110 transition-transform group-hover:text-yellow-500" />
            <span className="border-b-2 border-transparent group-hover:border-blue-400 transition-all">
              Run a security scan
            </span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>
      </div>

      {/* Add custom animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0); }
          50% { transform: translateY(-20px) translateX(10px); }
        }
        
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) translateX(0); }
          50% { transform: translateY(-30px) translateX(-10px); }
        }
        
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes glow {
          0%, 100% { opacity: 1; filter: drop-shadow(0 0 10px currentColor); }
          50% { opacity: 0.8; filter: drop-shadow(0 0 20px currentColor); }
        }
        
        @keyframes scan {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-2px); }
          75% { transform: translateX(2px); }
        }
        
        @keyframes gradient-border {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        
        .animate-float-slow {
          animation: float-slow 12s ease-in-out infinite;
        }
        
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 4s ease infinite;
        }
        
        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }
        
        .animate-scan {
          position: relative;
          overflow: hidden;
        }
        
        .animate-scan::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent);
          animation: scan 1.5s ease-in-out infinite;
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out infinite;
        }
        
        .animate-gradient-border {
          animation: gradient-border 3s ease infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
        
        .text-gradient {
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}</style>
    </div>
  );
}

export default NotFound;