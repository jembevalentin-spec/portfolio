import type { ReactNode } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-bg text-ink noise">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
