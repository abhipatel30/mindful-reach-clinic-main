import type { Metadata } from 'next'; 
import './globals.css';
import { Providers } from '@/components/providers';

export const metadata: Metadata = {
  title: 'Unveiled Echo - Online Therapy & Counseling Service',
  description: 'Unveiled Echo of Inner Self. Professional online therapy and counseling services. Connect with licensed therapists from the comfort of your home. Start your journey to better mental health today.',
  authors: [{ name: 'Unveiled Echo' }],
  openGraph: {
    title: 'Unveiled Echo - Online Therapy & Counseling Services',
    description: 'Unveiled Echo of Inner Self. Professional online therapy and counseling services. Connect with licensed therapists from the comfort of your home.',
    type: 'website',
    images: ['https://lovable.dev/opengraph-image-p98pqg.png'],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@Lovable',
    images: ['https://lovable.dev/opengraph-image-p98pqg.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
