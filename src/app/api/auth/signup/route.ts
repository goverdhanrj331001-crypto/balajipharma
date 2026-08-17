import { NextRequest, NextResponse } from 'next/server';
import { signupWithEmail } from '@/lib/auth/api';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json();
    const result = await signupWithEmail(email, password, name);
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? 'Signup failed' }, { status: 400 });
  }
}
