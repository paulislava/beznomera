'use client';

import React from 'react';
import { AuthGuard } from '@/components/AuthGuard';
import { CarCreateForm } from '@/components/CarCreateForm/CarCreateForm';

export default function NewCarPage() {
  return (
    <AuthGuard>
      <div className='min-h-screen bg-gradient-to-br from-[#090633] via-[#05031C] to-[#090821]'>
        <div className='container mx-auto px-4 py-8'>
          <div className='max-w-2xl mx-auto'>
            <CarCreateForm />
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
