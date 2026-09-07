import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PhotoShare | The considered way to deliver photography',
  description: 'Collect, curate, and deliver private photo galleries with PhotoShare.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased selection:bg-[#c7674e] selection:text-white">
        {children}
      </body>
    </html>
  );
}
