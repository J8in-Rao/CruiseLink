import React from 'react';
import { render, screen } from '@testing-library/react';
import AppLogo from '../app-logo';

describe('AppLogo', () => {
  it('renders the logo with the correct text', () => {
    render(<AppLogo />);
    const logo = screen.getByText('CruiseLink');
    expect(logo).toBeInTheDocument();
  });
});
