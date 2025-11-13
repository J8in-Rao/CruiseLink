import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import DashboardPage from './page';
import { useAppAuth } from '@/components/auth-provider';
import { UserRole } from '@/types';

// Mock the auth provider
jest.mock('@/components/auth-provider', () => ({
  useAppAuth: jest.fn(),
}));

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

// Mock the dashboard components
jest.mock('./voyager-dashboard', () => () => <div>Voyager Dashboard</div>);
jest.mock('@/components/dashboard/supervisor-dashboard', () => () => <div>Supervisor Dashboard</div>);

describe('Dashboard Page - Role-Based Access', () => {
  const useAppAuthMock = useAppAuth as jest.Mock;

  const mockUser = (role: UserRole) => ({
    user: {
      uid: '123',
      email: `${role}@cruiselink.com`,
      name: `${role} User`,
      role: role,
    },
    loading: false,
  });

  test('TC4: should render VoyagerDashboard for a voyager', async () => {
    useAppAuthMock.mockReturnValue(mockUser('voyager'));

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Voyager Dashboard')).toBeInTheDocument();
    });
  });

  test('TC5: should render SupervisorDashboard for a supervisor', async () => {
    useAppAuthMock.mockReturnValue(mockUser('supervisor'));

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Supervisor Dashboard')).toBeInTheDocument();
    });
  });

  test('TC6: should render a welcome message for admin', async () => {
    useAppAuthMock.mockReturnValue(mockUser('admin'));

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Welcome, admin User!')).toBeInTheDocument();
    });
  });
});
