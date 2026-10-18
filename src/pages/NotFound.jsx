import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0b0b12] text-gray-100 flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-8xl font-extrabold bg-gradient-to-r from-[#ff7a1a] via-[#ff2e88] to-[#8b5cf6] bg-clip-text text-transparent">
          404
        </p>
        <h1 className="mt-4 text-2xl font-bold text-white">Page not found</h1>
        <p className="mt-2 text-gray-400">
          The page you're looking for doesn't exist or was moved.
        </p>
        <Link
          to="/"
          className="mt-8 inline-block rounded-xl bg-gradient-to-r from-[#ff7a1a] to-[#ff2e88] px-8 py-3.5 font-bold text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff2e88] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0b12]"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
