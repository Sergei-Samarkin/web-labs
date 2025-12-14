import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const baseNavStyle = {
    ...navLinkStyle,
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    padding: '0 2rem',
    margin: '0 1.5rem',
    borderBottom: '2px solid transparent', // одинаковый border
    boxSizing: 'border-box' as const,
    minWidth: '100px',
    justifyContent: 'center',
    textDecoration: 'none',
    color: '#e1e1e1',
    transition: 'all 0.2s ease',
  };

  const activeLinkStyle = {
    ...baseNavStyle,
    color: '#2196f3', // синий цвет текста
    borderBottom: '2px solid #2196f3', // синий бордер
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Ошибка при выходе:', error);
    }
  };

  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      backgroundColor: '#1e1e1e',
      padding: '0.8rem 0',
      boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
      borderBottom: '1px solid #333'
    }}>
      <nav style={{
        maxWidth: '1200px',
        width: '100%',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0 1rem'
      }}>
        <div style={{ 
          display: 'flex', 
          gap: '1.5rem', 
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          maxWidth: '800px'
        }}>
          <Link to="/" style={isActive('/') ? activeLinkStyle : baseNavStyle}>
            Главная
          </Link>
          <Link to="/events" style={isActive('/events') ? activeLinkStyle : baseNavStyle}>
            Мероприятия
          </Link>
          {user ? (
            <>
              <span style={{ margin: '0 1rem', color: '#e1e1e1' }}>{user.email}</span>
              <button 
                onClick={handleLogout}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: 'transparent',
                  color: '#ff6b6b',
                  border: '1px solid #ff6b6b',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  marginLeft: '0.5rem'
                }}
                onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(255, 107, 107, 0.1)'}
                onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                Выйти
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={isActive('/login') ? activeLinkStyle : baseNavStyle}>
                Вход
              </Link>
              <Link to="/register" style={isActive('/register') ? activeLinkStyle : baseNavStyle}>
                Регистрация
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

const navLinkStyle = {
  // убрал псевдоселектор ':hover' – он не работает в inline-стилях
};

export default Header;
