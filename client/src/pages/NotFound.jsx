import { Link } from 'react-router-dom';
import { HiSparkles } from 'react-icons/hi';

const NotFound = () => (
  <div style={{
    minHeight: '80vh', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem',
  }}>
    <div style={{ fontSize: '6rem', marginBottom: '1.5rem' }}>🌌</div>
    <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '4rem', fontWeight: 900, color: '#f1f5f9', marginBottom: '0.5rem' }}>
      4<span className="gradient-text">0</span>4
    </h1>
    <p style={{ color: '#64748b', fontSize: '1rem', maxWidth: 360, marginBottom: '2rem' }}>
      Oops! This page has drifted out of the EventSphere. Let's get you back.
    </p>
    <Link to="/" className="btn-primary" style={{ textDecoration: 'none' }}>
      <HiSparkles /> Back to Events
    </Link>
  </div>
);

export default NotFound;
