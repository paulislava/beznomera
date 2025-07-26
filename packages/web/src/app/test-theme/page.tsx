import { ThemeToggle } from '@/components/ThemeToggle';

export default function TestThemePage() {
  return (
    <div className='min-h-screen p-8'>
      <h1 className='text-2xl font-bold mb-4'>Тест переключения темы</h1>
      <ThemeToggle />

      <div className='mt-8 p-4 bg-white dark:bg-gray-800 rounded-lg'>
        <h2 className='text-lg font-semibold mb-2'>Тестовый контент</h2>
        <p className='text-gray-700 dark:text-gray-300'>
          Этот блок должен менять цвет в зависимости от темы.
        </p>
      </div>
    </div>
  );
}
