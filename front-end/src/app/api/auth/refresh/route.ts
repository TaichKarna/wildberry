import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const refreshToken = (await cookies()).get('refreshToken')?.value;
    if (!refreshToken) {
      return NextResponse.json(
        { success: false, error: { code: 'REFRESH_TOKEN_REQUIRED', message: 'Refresh token required' } },
        { status: 401 }
      );
    }

    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1';
    const response = await fetch(`${backendUrl}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await response.json();

    if (!response.ok) {
      (await cookies()).delete('token');
      (await cookies()).delete('refreshToken');
      return NextResponse.json(data, { status: response.status });
    }

    const responseCookies = NextResponse.json(data);
    responseCookies.cookies.set('token', data.data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 3600,
    });
    responseCookies.cookies.set('refreshToken', data.data.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 604800,
    });

    return responseCookies;
  } catch (error) {
    console.error('Refresh token error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Refresh failed' } },
      { status: 500 }
    );
  }
}
