import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1';
    const token = (await cookies()).get('token')?.value;
    
    if (token) {
      await fetch(`${backendUrl}/auth/logout`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include',
      });
    }
    
    const response = NextResponse.json({ success: true });
    response.cookies.delete('token');
    response.cookies.delete('refreshToken');
    
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Logout failed' } },
      { status: 500 }
    );
  }
}
