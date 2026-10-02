import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--ink)',
        color: 'var(--cream)',
        textAlign: 'center',
        padding: 24,
      }}
    >
      <span style={{ fontFamily: 'var(--font-display)', fontSize: '5rem', color: 'var(--champagne)' }}>
        404
      </span>
      <h1 style={{ color: 'var(--paper)' }}>This page hasn&rsquo;t been built yet</h1>
      <p style={{ color: 'var(--champagne)', maxWidth: '40ch', marginBottom: 24 }}>
        The page you&rsquo;re looking for doesn&rsquo;t exist or may have moved.
      </p>
      <Link to="/" className="btn btn-champagne">
        Back to Home
      </Link>
    </div>
  );
}
