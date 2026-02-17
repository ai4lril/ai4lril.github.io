import { render, screen, fireEvent } from '@testing-library/react';
import { FilterPanel } from './FilterPanel';

describe('FilterPanel', () => {
  it('renders filter controls', () => {
    const onFilter = jest.fn();
    render(<FilterPanel onFilter={onFilter} />);

    expect(screen.getByText('Language')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('From Date')).toBeInTheDocument();
    expect(screen.getByText('To Date')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Apply/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reset/i })).toBeInTheDocument();
  });

  it('calls onFilter with filters when Apply is clicked', () => {
    const onFilter = jest.fn();
    render(<FilterPanel onFilter={onFilter} />);

    fireEvent.click(screen.getByRole('button', { name: /Apply/i }));

    expect(onFilter).toHaveBeenCalledWith(
      expect.objectContaining({
        languageCode: '',
        status: 'pending',
        dateFrom: '',
        dateTo: '',
      }),
    );
  });

  it('calls onFilter with default filters when Reset is clicked', () => {
    const onFilter = jest.fn();
    render(<FilterPanel onFilter={onFilter} />);

    const statusSelect = screen.getAllByRole('combobox')[1];
    fireEvent.change(statusSelect, { target: { value: 'approved' } });
    fireEvent.click(screen.getByRole('button', { name: /Reset/i }));

    expect(onFilter).toHaveBeenCalledWith(
      expect.objectContaining({
        languageCode: '',
        status: 'pending',
        dateFrom: '',
        dateTo: '',
      }),
    );
  });

  it('hides status filter when showStatus is false', () => {
    const onFilter = jest.fn();
    render(<FilterPanel onFilter={onFilter} showStatus={false} />);

    expect(screen.queryByText('Status')).not.toBeInTheDocument();
  });
});
