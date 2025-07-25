'use client';

import styles from './page.module.css';
import { AuthGuard } from '@/components/AuthGuard';
import { CarsList } from '@/components/CarsList';

export default function Home() {
  return (
    <AuthGuard>
      <div className={styles.page}>
        <main className={styles.main}>
          <CarsList />
        </main>
      </div>
    </AuthGuard>
  );
}
