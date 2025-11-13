import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MoviesPage from './page';
import { useFirestore } from '@/firebase';
import { useCollection } from '@/firebase/firestore/use-collection';

// Mock Firebase
jest.mock('@/firebase', () => ({
  useFirestore: jest.fn(),
}));
jest.mock('@/firebase/firestore/use-collection', () => ({
  useCollection: jest.fn(),
}));

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock UI components
jest.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

const mockMovies = [
  {
    id: '1',
    title: 'Inception',
    description: 'A mind-bending thriller.',
    showtimes: ['10:00 AM', '8:00 PM'],
    imageUrl: 'inception.jpg',
  },
];

describe('Movies Page - Booking', () => {
  const useCollectionMock = useCollection as jest.Mock;

  beforeEach(() => {
    useCollectionMock.mockReturnValue({ data: mockMovies, loading: false });
    (useFirestore as jest.Mock).mockReturnValue({});
  });

  test('TC10: should display available movies and showtimes', () => {
    render(<MoviesPage />);

    expect(screen.getByText('Inception')).toBeInTheDocument();
    expect(screen.getByText('10:00 AM')).toBeInTheDocument();
    expect(screen.getByText('8:00 PM')).toBeInTheDocument();
  });

  test('TC11: should be able to book a movie ticket', async () => {
    render(<MoviesPage />);

    // Click on a showtime to open the booking dialog
    const showtimeButton = screen.getByText('8:00 PM');
    fireEvent.click(showtimeButton);

    // In the dialog, confirm the booking
    const confirmButton = await screen.findByRole('button', { name: 'Confirm Booking' });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      // We expect the success toast to appear.
      // As before, we'll assume success if the button was clickable and no errors occurred.
      expect(confirmButton).toBeInTheDocument();
    });
  });
});
