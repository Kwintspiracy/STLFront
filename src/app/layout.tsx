import "./globals.css";
import { Open_Sans } from "next/font/google";
import Header from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { UserProvider } from "@/context/UserContext";
import { ToastProvider } from "@/context/ToastContext";
import { AuthProvider } from "@/context/AuthContext";
import { StudioProvider } from "@/context/StudioContext";
import { CartProvider } from "@/context/CartContext";

const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-open-sans", // optional for use with Tailwind
  display: "swap",
});

export const metadata = {
  title: "Your App",
  description: "Your app description",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${openSans.className} min-h-screen flex flex-col text-text-primary`} style={{ background: 'radial-gradient(ellipse 56.94% 34.54% at 50.02% 28.09%, #172733 0%, #162631 12.5%, #152530 25%, #14232f 37.5%, #13212a 50%, #131f28 62.5%, #121e26 75%, #121c24 87.5%, #111920 100%)', backdropFilter: 'blur(127.85px)' }}>
        <ToastProvider>
          <AuthProvider>
            <StudioProvider>
              <UserProvider>
                <CartProvider>
                  <Header />
                  <main className="flex-1">{children}</main>
                  <Footer />
                  {/* <ThemeSwitcher /> */}
                </CartProvider>
              </UserProvider>
            </StudioProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
