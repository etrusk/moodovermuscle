'use client'

export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Simple layout for login page without authentication checks
  return <div className="min-h-screen bg-gray-50">{children}</div>
}
