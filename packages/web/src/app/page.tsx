'use client';

import styles from './page.module.css';
import { AuthGuard } from '@/components/AuthGuard';
import TailwindTest from '@/components/TailwindTest';
import { Button } from '@heroui/react';

export default function Home() {
  return (
    <AuthGuard>
      <div className={styles.page}>
        <main className={styles.main}>
          {/* Tailwind CSS тест */}
          <div className='mb-8'>
            <TailwindTest />
          </div>
          <Button color='primary' type='button'>
            Click me
          </Button>
        </main>
      </div>
    </AuthGuard>
  );
}
