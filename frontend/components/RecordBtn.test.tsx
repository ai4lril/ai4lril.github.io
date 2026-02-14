import { render, screen } from '@testing-library/react';
import RecordBtn from './RecordBtn';

jest.mock('@/lib/audio-utils', () => ({
  encodePCMToWAV: jest.fn().mockResolvedValue(new Blob()),
}));

describe('RecordBtn', () => {
  beforeEach(() => {
    Object.defineProperty(global, 'MediaRecorder', {
      value: jest.fn().mockImplementation(() => ({
        start: jest.fn(),
        stop: jest.fn(),
        state: 'inactive',
        ondataavailable: null,
        onstop: null,
      })),
      writable: true,
    });
    Object.defineProperty(global.navigator, 'mediaDevices', {
      value: {
        getUserMedia: jest.fn().mockResolvedValue({
          getTracks: () => [{ stop: jest.fn() }],
          getVideoTracks: () => [],
        }),
        enumerateDevices: jest.fn().mockResolvedValue([]),
      },
      writable: true,
    });
  });

  it('renders record button', () => {
    render(<RecordBtn />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('renders with audio mode by default', () => {
    render(<RecordBtn mode="audio" />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
