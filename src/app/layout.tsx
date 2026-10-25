import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Metro Bro — Official Store",
  description: "Metro Bro full-face riding masks. Limited batch drops, breathable windproof protection, direct WhatsApp ordering.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var saved = localStorage.getItem('metro_theme') || 'light';
                document.documentElement.setAttribute('data-theme', saved);
              } catch (e) {}
            `,
          }}
        />
        {children}
      </body>
    </html>
  );
}
