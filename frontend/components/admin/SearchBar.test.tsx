import { render, screen, fireEvent } from '@testing-library/react';
import { SearchBar } from './SearchBar';

describe('SearchBar', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders with default placeholder', () => {
    const onSearch = jest.fn();
    render(<SearchBar onSearch={onSearch} />);
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });

  it('renders with custom placeholder', () => {
    const onSearch = jest.fn();
    render(<SearchBar onSearch={onSearch} placeholder="Search users..." />);
    expect(screen.getByPlaceholderText('Search users...')).toBeInTheDocument();
  });

  it('calls onSearch after debounce when user types', () => {
    const onSearch = jest.fn();
    render(<SearchBar onSearch={onSearch} debounceMs={300} />);
    const input = screen.getByRole('textbox');

    fireEvent.change(input, { target: { value: 'test' } });
    expect(onSearch).not.toHaveBeenCalled();

    jest.advanceTimersByTime(300);
    expect(onSearch).toHaveBeenCalledWith('test');
  });

  it('updates input value on change', () => {
    const onSearch = jest.fn();
    render(<SearchBar onSearch={onSearch} />);
    const input = screen.getByRole('textbox');

    fireEvent.change(input, { target: { value: 'hello' } });
    expect(input).toHaveValue('hello');
  });
});
