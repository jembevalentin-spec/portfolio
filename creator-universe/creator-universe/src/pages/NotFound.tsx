import { Link } from "react-router-dom";
import MagneticButton from "../components/MagneticButton";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
      <p className="text-sm text-muted mb-4">404</p>
      <h1 className="font-display text-4xl md:text-6xl mb-6">This page wandered off.</h1>
      <MagneticButton
        href="/"
        className="bg-ink text-bg rounded-full px-7 py-3.5 text-sm font-medium hover:opacity-90 transition-opacity"
      >
        Back home
      </MagneticButton>
      <Link to="/store" className="focus-ring text-sm text-muted hover:text-ink mt-4 transition-colors">
        Or browse the store
      </Link>
    </div>
  );
}
