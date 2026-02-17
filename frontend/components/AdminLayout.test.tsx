import { render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import AdminLayout from './AdminLayout';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('./AdminNavbar', () => function MockAdminNavbar() {
  return <div data-testid="admin-navbar">Admin Navbar</div>;
});

jest.mock('@/lib/realtime', () => ({
  realtimeClient: {
    connect: jest.fn(),
    disconnect: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
    subscribe: jest.fn(),
  },
}));

describe('AdminLayout', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    localStorage.clear();
  });

  it('redirects to admin login when no token', async () => {
    render(
      <AdminLayout>
        <div>Child content</div>
      </AdminLayout>,
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/admin/login');
    });
  });

  it('shows loading spinner initially when token exists', () => {
    localStorage.setItem('token', 'fake-token');
    global.fetch = jest.fn().mockImplementation(() => new Promise(() => { }));

    render(
      <AdminLayout>
        <div>Child content</div>
      </AdminLayout>,
    );

    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('renders admin content when adminToken and adminUser exist', async () => {
    localStorage.setItem('adminToken', 'admin-token');
    localStorage.setItem(
      'adminUser',
      JSON.stringify({
        id: 'admin-1',
        email: 'admin@test.com',
        role: 'super_admin',
        name: 'Admin User',
      }),
    );

    render(
      <AdminLayout>
        <div>Child content</div>
      </AdminLayout>,
    );

    await screen.findByText(/Welcome back/i);
    expect(screen.getByText(/Admin User/)).toBeInTheDocument();
    expect(screen.getByText(/SUPER_ADMIN/)).toBeInTheDocument();
    expect(screen.getByTestId('admin-navbar')).toBeInTheDocument();
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });
});
