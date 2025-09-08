import "./globals.css";
import ErrorBoundary from "@/componunt/ui/errorBoundary";

import { GoogleOAuthProvider } from '@react-oauth/google';

export const metadata = {
  title: 'My App',
  description: 'Best app ever',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <GoogleOAuthProvider clientId="564609262056-ouibh94apksr078s5c9sd47p4ij4mma1.apps.googleusercontent.com">
        {/* Navbar can go here */}
         <ErrorBoundary>
        {children}
        </ErrorBoundary>
        {/* Footer can go here */}
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
