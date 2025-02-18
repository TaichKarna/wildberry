import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const refreshToken = cookies().get('refreshToken')?.value;

    if (!refreshToken) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'REFRESH_TOKEN_REQUIRED',
            message: 'Refresh token is required',
          },
        },
        { status: 401 }
      );
    }

    try {
      // Verify refresh token
      const payload = jwt.verify(
        refreshToken,
        process.env.NEXTAUTH_SECRET as string
      ) as jwt.JwtPayload;

      if (payload.type !== 'refresh') {
        throw new Error('Invalid token type');
      }

      // Create new access token
      const newToken = jwt.sign(
        {
          sub: payload.sub,
          role: 'admin',
        },
        process.env.NEXTAUTH_SECRET as string,
        {
          expiresIn: '1h',
        }
      );

      // Create new refresh token
      const newRefreshToken = jwt.sign(
        {
          sub: payload.sub,
          type: 'refresh',
        },
        process.env.NEXTAUTH_SECRET as string,
        {
          expiresIn: '7d',
        }
      );

      // Set cookies
      cookies().set('token', newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 3600, // 1 hour
      });

      cookies().set('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 604800, // 7 days
      });

      return NextResponse.json({
        success: true,
        data: {
          accessToken: newToken,
          refreshToken: newRefreshToken,
          expiresIn: 3600,
        },
      });
    } catch (error) {
      // Clear invalid tokens
      cookies().delete('token');
      cookies().delete('refreshToken');

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_REFRESH_TOKEN',
            message: 'Invalid or expired refresh token',
          },
        },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Refresh token error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while refreshing the token',
        },
      },
      { status: 500 }
    );
  }
}
