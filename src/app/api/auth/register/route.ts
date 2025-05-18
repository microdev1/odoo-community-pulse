import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcrypt';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { name, email, password, phone, location } = data;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await hash(password, 10);

    // Create the user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        location,
        isVerified: true, // Auto-verify for simplicity (could use email verification in production)
      },
      select: {
        id: true,
        name: true,
        email: true,
        isVerified: true,
      },
    });

    return NextResponse.json({
      user,
      message: 'Registration successful! You can now log in.',
    }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500 }
    );
  }
}
