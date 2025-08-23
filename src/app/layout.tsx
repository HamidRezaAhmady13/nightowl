// src/app/layout.tsx
import "./globals.css";

export const metadata = {
  title: "Social App",
  description: "Chat, post, and call in real time",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header className="p-4 bg-white shadow">My Header</header>
        <div>
          <aside>Aside</aside>
          <main className="p-6">{children}</main>
        </div>
        <footer className="p-4 text-center text-sm text-gray-500">
          My Footer
        </footer>
      </body>
    </html>
  );
}
