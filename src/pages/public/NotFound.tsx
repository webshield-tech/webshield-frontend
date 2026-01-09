import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
        <p className="mb-6">The page you're looking for doesn't exist.</p>
        <Link 
          to="/" 
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}

export default NotFound;