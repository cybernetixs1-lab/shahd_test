import "./globals.css";

export const metadata = {
  title: "Restaurant Waitlist",
  description: "Join and manage a restaurant waiting list.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
