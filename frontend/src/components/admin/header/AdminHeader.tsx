import React, { useState, useRef, useEffect } from 'react';
import { User } from '../../../types';
import SearchBar from '../shared/SearchBar';
import styles from './AdminHeader.module.css';

interface AdminHeaderProps {
  user: User;
  notificationCount: number;
  onSearch: (query: string) => void;
  onLogout: () => void;
  onMenuToggle: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({
  user,
  notificationCount,
  onSearch,
  onLogout,
  onMenuToggle
}) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleUserMenuToggle = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  const handleLogout = () => {
    setUserMenuOpen(false);
    onLogout();
  };

  return (
    <header className={styles.adminHeader}>
      <div className={styles.headerLeft}>
        <button 
          className={styles.mobileMenuButton}
          onClick={onMenuToggle}
          aria-label="Toggle navigation menu"
        >
          <span className={styles.hamburgerIcon}>☰</span>
        </button>
        <div className={styles.clinicBrand}>
          <span className={styles.clinicIcon}>🏥</span>
          <h1 className={styles.clinicName}>Clinic Admin</h1>
        </div>
      </div>
      
      <div className={styles.headerCenter}>
        <SearchBar 
          onSearch={onSearch}
          placeholder="Search users, clients, sessions..."
        />
      </div>
      
      <div className={styles.headerRight}>
        <button 
          className={styles.notificationButton}
          aria-label={`${notificationCount} notifications`}
        >
          <span className={styles.notificationIcon}>🔔</span>
          {notificationCount > 0 && (
            <span className={styles.notificationBadge}>{notificationCount}</span>
          )}
        </button>
        
        <div className={styles.userMenu} ref={userMenuRef}>
          <button 
            className={styles.userButton}
            onClick={handleUserMenuToggle}
            aria-label="User menu"
            aria-expanded={userMenuOpen}
          >
            <span className={styles.userAvatar}>👤</span>
            <span className={styles.userName}>{user.fullName || user.username}</span>
            <span className={`${styles.dropdownArrow} ${userMenuOpen ? styles.rotated : ''}`}>▼</span>
          </button>
          
          {userMenuOpen && (
            <div className={styles.userDropdown}>
              <div className={styles.userInfo}>
                <span className={styles.userEmail}>{user.email}</span>
                <span className={styles.userRole}>{user.role}</span>
              </div>
              <hr className={styles.divider} />
              <button onClick={handleLogout} className={styles.logoutButton}>
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader; 