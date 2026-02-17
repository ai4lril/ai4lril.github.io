import { render } from '@testing-library/react';
import { RealtimeNotificationListener } from './RealtimeNotificationListener';

jest.mock('@/lib/realtime', () => ({
  realtimeClient: {
    connect: jest.fn(),
    disconnect: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
  },
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { realtimeClient } = require('@/lib/realtime');

jest.mock('@/lib/toast', () => ({
  showToast: jest.fn(),
}));

describe('RealtimeNotificationListener', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('renders nothing', () => {
    const { container } = render(<RealtimeNotificationListener />);
    expect(container.firstChild).toBeNull();
  });

  it('does not connect when no token in localStorage', () => {
    render(<RealtimeNotificationListener />);
    expect(realtimeClient.connect).not.toHaveBeenCalled();
  });

  it('connects and subscribes when token exists', () => {
    localStorage.setItem('token', 'test-token');
    render(<RealtimeNotificationListener />);
    expect(realtimeClient.connect).toHaveBeenCalledWith('test-token');
    expect(realtimeClient.on).toHaveBeenCalledWith('notification', expect.any(Function));
  });

  it('disconnects on unmount', () => {
    localStorage.setItem('token', 'test-token');
    const { unmount } = render(<RealtimeNotificationListener />);
    unmount();
    expect(realtimeClient.off).toHaveBeenCalledWith('notification', expect.any(Function));
    expect(realtimeClient.disconnect).toHaveBeenCalled();
  });
});
