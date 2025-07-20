import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ссылка не действительна',
  description: 'Ссылка на автомобиль не действительна или устарела'
};

export default function CarNotFound() {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50'>
      <div className='max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center'>
        <div className='mb-6'>
          <h1 className='text-4xl font-bold text-gray-900 mb-2'>🚗</h1>
          <h2 className='text-2xl font-semibold text-gray-700 mb-4'>Ссылка не действительна</h2>
          <p className='text-gray-600 mb-6'>
            Ссылка на автомобиль не действительна или устарела. Возможно, автомобиль был удален или
            ссылка введена неправильно.
          </p>
        </div>

        <div className='space-y-4'>
          <Link
            href='/'
            className='inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors'
          >
            Вернуться на главную
          </Link>

          <div className='text-sm text-gray-500'>
            <p>Если вы уверены, что ссылка правильная,</p>
            <p>попробуйте проверить её ещё раз</p>
          </div>
        </div>
      </div>
    </div>
  );
}
