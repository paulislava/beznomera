import { AuthComponent, withUser } from '@/context/Auth/withUser';
import { createApi } from '@/services';
import { ChatList } from '@/components/Chat/ChatList';
import { ChatDetails } from '@shared/chat/chat.types';

export const dynamic = 'force-dynamic';

interface ChatPageProps {
  params: Promise<{ chatId: string }>;
}

const api = createApi();

const ChatPage: AuthComponent<ChatPageProps> = async ({ user, params }) => {
  const { chatId } = await params;
  const chatIdNum = parseInt(chatId);

  const [chats, details] = await Promise.all([
    api.chat.myChatsForUser(user.userId).catch(() => []),
    api.chat.chatDetailsForUser(chatIdNum, user.userId).catch((): ChatDetails | null => null)
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
