import { AUTH_COOKIE_NAME } from '@/helpers/constants';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function GET() {
  (await cookies()).delete(AUTH_COOKIE_NAME);
  redirect('/auth');
}
