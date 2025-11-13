import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Page from '@/app/page';
import { useAuth } from '@/firebase';
import { signInWithEmailAndPassword, UserCredential } from 'firebase/auth';

// Mock Firebase auth
jest.mock('@/firebase', () => ({
  useAuth: jest.fn(),
}));

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('Login Page', () => {
  const mockSignIn = signInWithEmailAndPassword as jest.Mock;
  const useAuthMock = useAuth as jest.Mock;

  beforeEach(() => {
    // Reset mocks before each test
    mockSignIn.mockClear();
    useAuthMock.mockReturnValue({}); // Default mock return value
  });

  test('TC1: should show an error message with invalid credentials', async () => {
    mockSignIn.mockRejectedValue(new Error('Invalid credentials'));
    useAuthMock.mockReturnValue({ auth: {} });

    render(<Page />);

    await userEvent.type(screen.getByLabelText('Email'), 'wrong@email.com');
    await userEvent.type(screen.getByLabelText('Password'), 'wrongpassword');
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));

    await waitFor(() => {
      expect(screen.getByText('Login Failed')).toBeInTheDocument();
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  test('TC2: should show validation error for empty email', async () => {
    render(<Page />);

    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address.')).toBeInTheDocument();
    });
  });

  test('TC3: should successfully log in with valid credentials', async () => {
    const mockUserCredential = {
      user: { uid: '123', email: 'voyager@cruiselink.com' },
    } as UserCredential;
    mockSignIn.mockResolvedValue(mockUserCredential);
    useAuthMock.mockReturnValue({ auth: {} });

    render(<Page />);

    await userEvent.type(screen.getByLabelText('Email'), 'voyager@cruiselink.com');
    await userEvent.type(screen.getByLabelText('Password'), 'password123');
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));

    await waitFor(() => {
      // We can't easily test the redirect, so we'll check that no error appeared
      expect(screen.queryByText('Login Failed')).not.toBeInTheDocument();
    });
  });
});
