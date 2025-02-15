import { Sidebar } from "@/components/layout/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar className="border-r bg-gray-100/40" />
      <div className="flex-1 p-8">
        {children}
      </div>
    </div>
  )
}
