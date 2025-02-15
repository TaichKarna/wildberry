import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    if (
      username === process.env.ADMIN_USERNAME &&
      password === process.env.ADMIN_PASSWORD
    ) {
      // Create JWT token
      const token = jwt.sign(
        {
          sub: username,
          role: 'admin',
        },
        process.env.NEXTAUTH_SECRET as string,
        {
          expiresIn: '1h',
        }
      );

      // Create refresh token
      const refreshToken = jwt.sign(
        {
          sub: username,
          type: 'refresh',
        },
        process.env.NEXTAUTH_SECRET as string,
        {
          expiresIn: '7d',
        }
      );

      const response = NextResponse.json({
        success: true,
        data: {
          user: {
            username,
            role: 'admin',
          },
        },
      });

      // Set cookies
      response.cookies.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 3600, // 1 hour
      });

      response.cookies.set('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 604800, // 7 days
      });

      return response;
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid username or password',
        },
      },
      { status: 401 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred during login',
        },
      },
      { status: 500 }
    );
  }
}
