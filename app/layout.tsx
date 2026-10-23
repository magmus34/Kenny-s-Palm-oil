import type {Metadata} from 'next';
import './globals.css'; // Global styles
import Providers from '@/components/Providers';

export const metadata: Metadata = {
  title: "Kenny's Premium Palm Oil | 100% Pure, Unadulterated Nigerian Palm Oil",
  description: "Pure, natural Nigerian palm oil, carefully packaged and available in different sizes. Shop online or order directly on WhatsApp.",
  openGraph: {
    title: "Kenny's Premium Palm Oil | Pure Nigerian Palm Oil",
    description: "Pure, natural Nigerian palm oil, carefully packaged and available in different sizes. Shop online or order directly on WhatsApp.",
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Kenny's Premium Palm Oil",
    description: "Pure, natural Nigerian palm oil, carefully packaged and available in different sizes.",
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
