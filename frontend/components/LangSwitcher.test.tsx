'use client';

import { render, screen, fireEvent } from '@testing-library/react';
import LangSwitcher from './LangSwitcher';

jest.mock('@/lib/langPreference', () => ({
  getPreferredLanguage: jest.fn().mockReturnValue(null),
  setPreferredLanguage: jest.fn(),
}));

describe('LangSwitcher', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders language selector button', async () => {
    render(<LangSwitcher />);
    await screen.findByRole('button', { name: /Loading|Assamese|English|Hindi/i });
  });

  it('opens dropdown when button is clicked', async () => {
    render(<LangSwitcher />);
    const button = await screen.findByRole('button', { expanded: false });
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });

  it('has accessible listbox for language selection', async () => {
    render(<LangSwitcher />);
    const button = await screen.findByRole('button');
    fireEvent.click(button);
    const listbox = await screen.findByRole('listbox', { hidden: true });
    expect(listbox).toBeInTheDocument();
  });
});
