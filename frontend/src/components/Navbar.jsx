import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav style={styles.nav}>
      <div style={styles.logo}>PrimeTradeAI</div>
      <div style={styles.right}>
        {user && (
          <>
            <span style={styles.username}>👤 {user.name}</span>
            <span style={styles.role}>{user.role}</span>
            <button onClick={logout} style={styles.logoutBtn}>
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 28px',
    backgroundColor: '#1a1a2e',
    color: '#fff',
  },
  logo: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#4f8ef7',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  username: {
    fontSize: '14px',
    color: '#ccc',
  },
  role: {
    fontSize: '12px',
    background: '#4f8ef7',
    padding: '2px 10px',
    borderRadius: '20px',
    color: '#fff',
    textTransform: 'capitalize',
  },
  logoutBtn: {
    padding: '6px 16px',
    background: 'transparent',
    border: '1px solid #e74c3c',
    color: '#e74c3c',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
  },
};

export default Navbar;