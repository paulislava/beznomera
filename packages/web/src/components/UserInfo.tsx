import { useUser } from '@/hooks/useUser';

/**
 * Компонент для отображения информации о пользователе
 */
export function UserInfo() {
  const { user, loading, error } = useUser();

  if (loading) {
    return <div>Загрузка...</div>;
  }

  if (error) {
    return <div>Ошибка: {error}</div>;
  }

  if (!user) {
    return <div>Пользователь не авторизован</div>;
  }

  return (
    <div>
      <h2>Информация о пользователе</h2>
      <p>ID пользователя: {user.userId}</p>
      <p>Telegram ID: {user.telegramID}</p>
    </div>
  );
}
