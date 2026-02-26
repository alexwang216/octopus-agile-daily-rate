import { Link } from "react-router";

function NotFound() {
  return (
    <div className="py-12 text-center">
      <h2 className="mb-2 text-4xl font-bold">404</h2>
      <p className="mb-4 text-slate-400">Page not found.</p>
      <Link to="/" className="text-purple-400 underline hover:text-purple-300">
        Go back home
      </Link>
    </div>
  );
}

export default NotFound;
