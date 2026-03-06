// app/layout.jsx
import "./globals.css";
import Providers from "./providers";

export const metadata = {
  title: "Beli Senang",
  description: "Advanced Ticket Management System",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-background"> 
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
