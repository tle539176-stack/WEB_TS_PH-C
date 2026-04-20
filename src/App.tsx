import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Books from './pages/Books';
import BookDetail from './pages/BookDetail';
import Notes from './pages/Notes';
import NoteDetail from './pages/NoteDetail';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Admin from './pages/Admin';
import { DEFAULT_SETTINGS, getSiteSettings } from './services/settingsService';

function AppContent() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  useEffect(() => {
    getSiteSettings()
      .then((settings) => {
        document.title = isAdmin
          ? `Admin - ${settings.siteName}`
          : settings.seoTitle || settings.siteName || DEFAULT_SETTINGS.seoTitle;

        const description =
          settings.seoDescription || DEFAULT_SETTINGS.seoDescription;
        let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
        if (!meta) {
          meta = document.createElement('meta');
          meta.name = 'description';
          document.head.appendChild(meta);
        }
        meta.content = description;
      })
      .catch(() => {
        document.title = DEFAULT_SETTINGS.seoTitle;
      });
  }, [isAdmin]);

  return (
    <div className="min-h-screen bg-white text-[#1A1A1A] font-sans selection:bg-[#0A3151] selection:text-white">
      {!isAdmin && <Navbar />}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/books" element={<Books />} />
          <Route path="/books/:slug" element={<BookDetail />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/notes/:slug" element={<NoteDetail />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:slug" element={<ProductDetail />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
      {!isAdmin && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
