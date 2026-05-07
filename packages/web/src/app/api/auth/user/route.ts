import { getUserFromRequest } from '@/utils/auth-server';
import { NextResponse } from 'next/server';

export async function GET() {
  const user = await getUserFromRequest();

  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json({ user });
}
