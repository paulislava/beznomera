export default function TailwindTest() {
  return (
    <div className='p-4 bg-blue-500 text-white rounded-lg shadow-lg'>
      <h1 className='text-2xl font-bold mb-2'>Tailwind CSS работает!</h1>
      <p className='text-sm opacity-90'>
        Этот компонент использует классы Tailwind CSS для стилизации.
      </p>
      <button className='mt-3 px-4 py-2 bg-green-500 hover:bg-green-600 rounded transition-colors'>
        Тестовая кнопка
      </button>
    </div>
  );
}
