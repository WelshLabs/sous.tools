import "./globals.css";

export const metadata = {
  title: "Sous Tools | Device Setup",
  description: "Captive portal setup for Sous Tools smart devices",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-[#09090b] text-[#fafafa] selection:bg-[#00ffff] selection:text-black">
        {children}
      </body>
    </html>
  );
}
