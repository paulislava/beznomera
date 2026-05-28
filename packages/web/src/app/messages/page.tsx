import { AuthComponent, withUser } from '@/context/Auth/withUser';
import { createApi } from '@/services';
import { ChatList } from '@/components/Chat/ChatList';

export const dynamic = 'force-dynamic';

const api = createApi();

const MessagesPage: AuthComponent = async ({ user }) => {
  const chats = await api.chat.myChatsForUser(user.userId).catch(() => []);

  return <ChatList initialChats={chats} userId={user.userId} />;
};

export default withUser(MessagesPage, false);
