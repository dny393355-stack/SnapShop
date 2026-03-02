import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-br from-primary via-secondary to-accent min-h-screen overflow-hidden">
        {children}
      </body>
    </html>
  );
}