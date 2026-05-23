import { AuthComponent, withUser } from '@/context/Auth/withUser';
import { createApi } from '@/services';
import { AUTH_COOKIE_NAME } from '@/helpers/constants';
import { cookies } from 'next/headers';
import { ChatList } from '@/components/Chat/ChatList';

export const dynamic = 'force-dynamic';

const MessagesPage: AuthComponent = async ({ user }) => {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const api = createApi(token);
  const chats = await api.chat.myChats().catch(() => []);

  return <ChatList initialChats={chats} userId={user.userId} />;
};

export default withUser(MessagesPage, false);
