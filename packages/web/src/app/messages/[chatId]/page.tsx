import { AuthComponent, withUser } from '@/context/Auth/withUser';
import { createApi } from '@/services';
import { AUTH_COOKIE_NAME } from '@/helpers/constants';
import { cookies } from 'next/headers';
import { ChatList } from '@/components/Chat/ChatList';
import { ChatDetails } from '@shared/chat/chat.types';

interface ChatPageProps {
  params: Promise<{ chatId: string }>;
}

const ChatPage: AuthComponent<ChatPageProps> = async ({ user, params }) => {
  const { chatId } = await params;
  const chatIdNum = parseInt(chatId);
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const api = createApi(token);

  const [chats, details] = await Promise.all([
    api.chat.myChats().catch(() => []),
    api.chat.chatDetails(chatIdNum).catch((): ChatDetails | null => null)
  ]);

  const initialChatDetails: Record<number, ChatDetails> = details ? { [chatIdNum]: details } : {};

  return (
    <ChatList
      initialChats={chats}
      userId={user.userId}
      selectedChatId={chatIdNum}
      initialChatDetails={initialChatDetails}
    />
  );
};

export default withUser(ChatPage, false);
