'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './login.module.css';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        // 儲存登入資訊到 localStorage
        localStorage.setItem('userSession', JSON.stringify(data.data));
        
        // 重定向到儀表板
        router.push('/dashboard');
      } else {
        setError(data.error || '登入失敗');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('網路錯誤，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <h1 className={styles.title}>登入</h1>
        <p className={styles.subtitle}>白屋職員/學員系統</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>帳號</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className={styles.input}
              placeholder="輸入帳號"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>密碼</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={styles.input}
              placeholder="輸入密碼"
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button type="submit" disabled={loading} className={styles.button}>
            {loading ? '登入中...' : '登入'}
          </button>
        </form>

        <div className={styles.footer}>
          <Link href="/" className={styles.link}>← 返回首頁</Link>
        </div>
      </div>
    </div>
  );
}