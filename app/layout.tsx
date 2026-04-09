import type { Metadata } from "next";
import { Plus_Jakarta_Sans, DM_Mono } from "next/font/google";
import "./globals.css";
import ReactQueryProvider from "../components/ReactQueryProvider";
import { AuthProvider } from "@/lib/auth-store";
import { ThemeProvider } from "@/features/theme/ui/ThemeProvider";
import ToastProvider from "@/components/ui/toast/ToastProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
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
        className={`${jakartaSans.variable} ${dmMono.variable} antialiased`}
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
