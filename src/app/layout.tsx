import Link from "next/link";
import "./globals.css";
import AdminPanel from "./Admin";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <p>
          <Link href={"/"}>S212 🥷🏻</Link>
        </p>
        <AdminPanel />
        {children}
      </body>
    </html>
  );
}
