import { getUserFromRequest } from '@/utils/auth-server';

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:3000';
const BACKEND_API_TOKEN = process.env.BACKEND_API_TOKEN ?? '';

export async function GET() {
  const user = await getUserFromRequest();

  if (!user?.isAdmin) {
    return new Response('Unauthorized', { status: 401 });
  }

  const upstream = await fetch(`${BACKEND_URL}/logs/stream`, {
    headers: { Authorization: `Bearer ${BACKEND_API_TOKEN}` }
  });

  if (!upstream.ok || !upstream.body) {
    return new Response('Failed to connect to log stream', { status: 502 });
  }

  return new Response(upstream.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no'
    }
  });
}
