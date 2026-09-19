import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./layouts/AdminLayout";
import { AdminAuthProvider } from "./hooks/useAdminAuth";

import Home from "./pages/Home";
import Store from "./pages/Store";
import ProductDetail from "./pages/ProductDetail";
import Portfolio from "./pages/Portfolio";
import ProjectDetail from "./pages/ProjectDetail";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import NotFound from "./pages/NotFound";

import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminProjects from "./pages/admin/AdminProjects";
import AdminContent from "./pages/admin/AdminContent";
import VisualStudio from "./pages/admin/VisualStudio";

type PageTransitionProps = { children: ReactNode };

function PageTransition({ children }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

function PublicRoutes() {
  const location = useLocation();

  return (
    <MainLayout>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><Home /></PageTransition>} />
          <Route path="/store" element={<PageTransition><Store /></PageTransition>} />
          <Route path="/store/:slug" element={<PageTransition><ProductDetail /></PageTransition>} />
          <Route path="/portfolio" element={<PageTransition><Portfolio /></PageTransition>} />
          <Route path="/portfolio/:slug" element={<PageTransition><ProjectDetail /></PageTransition>} />
          <Route path="/about" element={<PageTransition><AboutPage /></PageTransition>} />
          <Route path="/contact" element={<PageTransition><ContactPage /></PageTransition>} />
          <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
        </Routes>
      </AnimatePresence>
    </MainLayout>
  );
}

/**
 * The previous build used a second Routes tree inside /admin/*.
 * Keeping every route in one top-level Routes tree is more reliable with
 * React Router 7 and avoids a blank screen on direct /admin navigation.
 */
export default function App() {
  return (
    <BrowserRouter>
      <AdminAuthProvider>
        <Routes>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
          <Route path="/admin/products" element={<AdminLayout><AdminProducts /></AdminLayout>} />
          <Route path="/admin/projects" element={<AdminLayout><AdminProjects /></AdminLayout>} />
          <Route path="/admin/content" element={<AdminLayout><AdminContent /></AdminLayout>} />
          <Route path="/admin/visual" element={<AdminLayout><VisualStudio /></AdminLayout>} />
          <Route path="/admin/*" element={<AdminLogin />} />
          <Route path="/*" element={<PublicRoutes />} />
        </Routes>
      </AdminAuthProvider>
    </BrowserRouter>
  );
}
