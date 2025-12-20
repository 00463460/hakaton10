import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import styles from './admin-users.module.css';

const BACKEND_URL = process.env.NODE_ENV === 'production'
  ? 'https://your-backend-url.onrender.com'
  : 'http://localhost:8000';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/auth/users`);

      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status}`);
      }

      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Layout
      title="Admin - Registered Users"
      description="View all registered users for the Physical AI textbook chatbot"
    >
      <div className={styles.adminContainer}>
        <div className={styles.adminHeader}>
          <h1>Registered Users</h1>
          <p className={styles.subtitle}>
            All users who have signed up for the Physical AI textbook chatbot
          </p>
          <button onClick={fetchUsers} className={styles.refreshButton}>
            🔄 Refresh
          </button>
        </div>

        {error && (
          <div className={styles.errorBanner}>
            ❌ Error: {error}
            <br />
            <small>Make sure the backend server is running at {BACKEND_URL}</small>
          </div>
        )}

        {isLoading ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>👥</div>
            <h2>No users yet</h2>
            <p>Users will appear here once they sign up for the chatbot</p>
          </div>
        ) : (
          <>
            <div className={styles.statsBar}>
              <div className={styles.statCard}>
                <div className={styles.statNumber}>{users.length}</div>
                <div className={styles.statLabel}>Total Users</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statNumber}>
                  {users.filter(u => u.last_login).length}
                </div>
                <div className={styles.statLabel}>Active Users</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statNumber}>
                  {users.filter(u => !u.last_login).length}
                </div>
                <div className={styles.statLabel}>Never Logged In</div>
              </div>
            </div>

            <div className={styles.tableContainer}>
              <table className={styles.usersTable}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Email</th>
                    <th>Registration Date</th>
                    <th>Last Login</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className={styles.idCell}>#{user.id}</td>
                      <td className={styles.emailCell}>{user.email}</td>
                      <td className={styles.dateCell}>
                        {formatDate(user.created_at)}
                      </td>
                      <td className={styles.dateCell}>
                        {formatDate(user.last_login)}
                      </td>
                      <td className={styles.statusCell}>
                        {user.last_login ? (
                          <span className={styles.statusActive}>Active</span>
                        ) : (
                          <span className={styles.statusInactive}>New</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className={styles.footer}>
              <p className={styles.footerNote}>
                🔒 Note: Passwords are securely hashed and cannot be displayed for security reasons
              </p>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
