'use client';

import React from 'react';

export default function TestNavPage() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-[#090633] via-[#05031C] to-[#090821]'>
      <div className='container mx-auto px-4 py-8'>
        <div className='max-w-2xl mx-auto'>
          <h1 className='text-3xl font-bold text-white mb-6'>Тестовая страница</h1>
          <p className='text-white/80'>
            Эта страница используется для тестирования навигации. Если вы видите эту страницу,
            значит навигация работает корректно.
          </p>
        </div>
      </div>
    </div>
  );
}
