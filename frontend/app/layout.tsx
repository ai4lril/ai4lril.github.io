import type { Metadata } from 'next';
import './globals.css';
import NavbarWrapper from '@/components/NavbarWrapper';
import { ToastContainer } from '@/lib/toast';
import { RealtimeNotificationListener } from '@/components/RealtimeNotificationListener';

export const metadata: Metadata = {
    title: 'Language Data Collection',
    description: 'Contribute to linguistic research and AI development',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                <NavbarWrapper />
                <RealtimeNotificationListener />
                <ToastContainer />
                {children}
            </body>
        </html>
    );
}
