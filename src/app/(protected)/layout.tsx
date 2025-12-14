export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="auth-wrapper">
      {/* Maybe a centered card or background */}
      {children}
    </div>
  );
}
