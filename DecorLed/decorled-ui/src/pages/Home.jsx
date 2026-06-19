import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h1>🌟 DecorLed E-Ticaret Vitrinine Hoş Geldiniz!</h1>
      <p style={{ color: '#666', maxWidth: '500px' }}>Şu an burası yapım aşamasında. Çok yakında muhteşem LED panellerimiz ve donanımlarımız burada sergilenecek.</p>
      
      <div style={{ marginTop: '20px' }}>
        {/* Router linkleri sayesinde sayfa yenilenmeden geçiş yapılır */}
        <Link to="/admin" style={{ padding: '10px 20px', backgroundColor: '#4f46e5', color: '#fff', textDecoration: 'none', borderRadius: '8px', fontWeight: 'bold' }}>
          ⚙️ Yönetim Paneline Git
        </Link>
      </div>
    </div>
  );
}