import "./globals.css";
import { Open_Sans } from "next/font/google";
import Header from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { UserProvider } from "@/context/UserContext";

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
      <body className={`${openSans.className} min-h-screen flex flex-col bg-[#131618] text-white`}>
         <UserProvider>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        </UserProvider>
      </body>
    </html>
  );
}