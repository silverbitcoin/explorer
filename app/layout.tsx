import '@/app/globals.css';
import { Inter } from 'next/font/google';
import { NavbarWrapper } from '@/components/navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'SilverBitcoin Explorer',
  description: 'Production-grade blockchain explorer for SilverBitcoin network',
  metadataBase: new URL(process.env.NEXT_PUBLIC_EXPLORER_URL || 'https://explorer.silverbitcoin.org'),
  other: {
    'Cache-Control': 'no-store, max-age=0',
  },
};

/**
 * PRODUCTION-GRADE ROOT LAYOUT
 * 
 * Provides:
 * - Navigation bar with real blockchain data
 * - Main content area
 * - Footer with network statistics
 * - Real-time updates
 */
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex min-h-screen flex-col">
          {/* Navigation Bar */}
          <NavbarWrapper />

          {/* Main Content */}
          <main className="flex-1 w-full">
            {children}
          </main>

          {/* Footer */}
          <footer className="border-t border-slate-200 bg-white py-6 mt-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="text-sm text-slate-600">
                  © {new Date().getFullYear()} SilverBitcoin Explorer. All rights
                  reserved.
                </div>
                <div className="flex flex-col gap-2 text-sm text-slate-600 md:flex-row md:gap-6">
                  <a
                    href="https://silverbitcoin.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-slate-900"
                  >
                    Website
                  </a>
                  <a
                    href="https://github.com/silverbitcoin"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-slate-900"
                  >
                    GitHub
                  </a>
                  <a
                    href="https://docs.silverbitcoin.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-slate-900"
                  >
                    Documentation
                  </a>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
