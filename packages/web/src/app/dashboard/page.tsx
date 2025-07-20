'use client';

import { AuthGuard } from '@/components/AuthGuard';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardPage() {
  const { authorized, loading } = useAuth();

  return (
    <AuthGuard>
      <div className='min-h-screen bg-gradient-to-br from-[#090633] via-[#05031C] to-[#090821]'>
        <div className='container mx-auto px-4 py-8'>
          <div className='bg-white/10 backdrop-blur-lg rounded-lg p-8 shadow-xl border border-white/20'>
            <h1 className='text-3xl font-bold text-white mb-6'>Панель управления</h1>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              <div className='bg-white/5 rounded-lg p-6 border border-white/10'>
                <h3 className='text-xl font-semibold text-white mb-4'>Статус авторизации</h3>
                <div className='space-y-2'>
                  <p className='text-white/80'>
                    Авторизован: <span className='text-green-400'>{authorized ? 'Да' : 'Нет'}</span>
                  </p>
                  <p className='text-white/80'>
                    Загрузка: <span className='text-yellow-400'>{loading ? 'Да' : 'Нет'}</span>
                  </p>
                </div>
              </div>

              <div className='bg-white/5 rounded-lg p-6 border border-white/10'>
                <h3 className='text-xl font-semibold text-white mb-4'>Быстрые действия</h3>
                <div className='space-y-3'>
                  <button className='w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200'>
                    Добавить автомобиль
                  </button>
                  <button className='w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200'>
                    Просмотреть сообщения
                  </button>
                </div>
              </div>

              <div className='bg-white/5 rounded-lg p-6 border border-white/10'>
                <h3 className='text-xl font-semibold text-white mb-4'>Статистика</h3>
                <div className='space-y-2'>
                  <p className='text-white/80'>
                    Автомобилей: <span className='text-blue-400'>0</span>
                  </p>
                  <p className='text-white/80'>
                    Сообщений: <span className='text-green-400'>0</span>
                  </p>
                  <p className='text-white/80'>
                    Просмотров: <span className='text-yellow-400'>0</span>
                  </p>
                </div>
              </div>
            </div>

            <div className='mt-8 p-6 bg-white/5 rounded-lg border border-white/10'>
              <h3 className='text-xl font-semibold text-white mb-4'>
                Добро пожаловать в BEZNOMERA!
              </h3>
              <p className='text-white/80'>
                Это защищенная страница, доступная только авторизованным пользователям. Система
                аутентификации успешно работает!
              </p>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
