import type { Metadata } from "next";
import { Outfit, DM_Mono } from "next/font/google";
import "./globals.css";
import ReactQueryProvider from "../components/ReactQueryProvider";
import { AuthProvider } from "@/lib/auth-store";
import { ThemeProvider } from "@/features/theme/ui/ThemeProvider";
import ToastProvider from "@/components/ui/toast/ToastProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const outfit = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const dmMono = DM_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

export const metadata: Metadata = {
  title: "Brewsy",
  description: "Sistema de gestión para cafeterías y sucursales",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${outfit.variable} ${dmMono.variable} antialiased`}
      >
        <ThemeProvider>
          <ErrorBoundary>
            <ReactQueryProvider>
              <AuthProvider>
                <ToastProvider>{children}</ToastProvider>
              </AuthProvider>
            </ReactQueryProvider>
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}
