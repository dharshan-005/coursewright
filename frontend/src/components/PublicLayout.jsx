import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';

// Wraps pages that use the full marketing chrome: navbar + footer.
export default function PublicLayout({ children }) {
  return (
    <div className="app-shell">
      <Navbar />
      <main style={{ flex: 1 }}>{children}</main>
      <Footer />
    </div>
  );
}
