'use client'

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Settings,
  Package,
  AppWindow,
  Key,
  Users,
  FileText,
  Gift,
  LogOut,
  PanelLeftClose,
  PanelLeft
} from "lucide-react"
import { useState } from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/theme-toggle"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const handleLogout = () => {
    window.location.href = "/login"
  }

  return (
    <div className={cn(
      "relative flex flex-col min-h-screen border-r",
      isCollapsed ? "w-[80px]" : "w-[280px]",
      "transition-all duration-300 ease-in-out",
      className
    )}>
      <div className={cn(
        "flex items-center h-16 px-4 border-b",
        isCollapsed ? "justify-center" : "justify-between"
      )}>
        
        <div className={cn(
          "flex items-center gap-1",
          isCollapsed && "absolute right-2 top-20 flex-col gap-2"
        )}>
          <ThemeToggle />
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 w-8",
              isCollapsed && "mt-2"
            )}
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? (
              <PanelLeft className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="space-y-2 py-4">
          <div className="px-3">
            <div className="space-y-1">
              <Button
                variant={pathname === "/dashboard" ? "secondary" : "ghost"}
                className={cn(
                  "w-full hover:bg-secondary/80",
                  isCollapsed ? "justify-center px-2" : "justify-start"
                )}
                asChild
              >
                <Link href="/dashboard">
                  <LayoutDashboard className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
                  {!isCollapsed && "Overview"}
                </Link>
              </Button>
            </div>
          </div>

          <div className="px-3">
            <div className="space-y-1">
              <Button
                variant={pathname === "/dashboard/apps" ? "secondary" : "ghost"}
                className={cn(
                  "w-full hover:bg-secondary/80",
                  isCollapsed ? "justify-center px-2" : "justify-start"
                )}
                asChild
              >
                <Link href="/dashboard/apps">
                  <AppWindow className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
                  {!isCollapsed && "Manage Apps"}
                </Link>
              </Button>
            </div>
          </div>

          <div className="px-3 pt-4">
            <div className={cn(
              "text-xs font-semibold text-muted-foreground/60 pb-2 pl-3",
              isCollapsed && "hidden"
            )}>
              Product Catalog
            </div>
            <div className="space-y-1">
              <Button
                variant={pathname === "/dashboard/entitlements" ? "secondary" : "ghost"}
                className={cn(
                  "w-full hover:bg-secondary/80",
                  isCollapsed ? "justify-center px-2" : "justify-start"
                )}
                asChild
              >
                <Link href="/dashboard/entitlements">
                  <Key className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
                  {!isCollapsed && "Entitlements"}
                </Link>
              </Button>
              <Button
                variant={pathname === "/dashboard/products" ? "secondary" : "ghost"}
                className={cn(
                  "w-full hover:bg-secondary/80",
                  isCollapsed ? "justify-center px-2" : "justify-start"
                )}
                asChild
              >
                <Link href="/dashboard/products">
                  <Package className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
                  {!isCollapsed && "Products"}
                </Link>
              </Button>
              <Button
                variant={pathname === "/dashboard/offerings" ? "secondary" : "ghost"}
                className={cn(
                  "w-full hover:bg-secondary/80",
                  isCollapsed ? "justify-center px-2" : "justify-start"
                )}
                asChild
              >
                <Link href="/dashboard/offerings">
                  <Gift className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
                  {!isCollapsed && "Offerings"}
                </Link>
              </Button>
            </div>
          </div>

          <div className="px-3 pt-4">
            <div className={cn(
              "text-xs font-semibold text-muted-foreground/60 pb-2 pl-3",
              isCollapsed && "hidden"
            )}>
              Settings
            </div>
            <div className="space-y-1">
              <Button
                variant={pathname === "/dashboard/settings/general" ? "secondary" : "ghost"}
                className={cn(
                  "w-full hover:bg-secondary/80",
                  isCollapsed ? "justify-center px-2" : "justify-start"
                )}
                asChild
              >
                <Link href="/dashboard/settings/general">
                  <Settings className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
                  {!isCollapsed && "General"}
                </Link>
              </Button>
              <Button
                variant={pathname === "/dashboard/settings/api-keys" ? "secondary" : "ghost"}
                className={cn(
                  "w-full hover:bg-secondary/80",
                  isCollapsed ? "justify-center px-2" : "justify-start"
                )}
                asChild
              >
                <Link href="/dashboard/settings/api-keys">
                  <Key className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
                  {!isCollapsed && "API Keys"}
                </Link>
              </Button>
              <Button
                variant={pathname === "/dashboard/settings/audit-logs" ? "secondary" : "ghost"}
                className={cn(
                  "w-full hover:bg-secondary/80",
                  isCollapsed ? "justify-center px-2" : "justify-start"
                )}
                asChild
              >
                <Link href="/dashboard/settings/audit-logs">
                  <FileText className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
                  {!isCollapsed && "Audit Logs"}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto p-3 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <Button
          variant="ghost"
          className={cn(
            "w-full hover:bg-secondary/80",
            isCollapsed ? "justify-center px-2" : "justify-start"
          )}
          onClick={handleLogout}
        >
          <LogOut className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
          {!isCollapsed && "Logout"}
        </Button>
      </div>
    </div>
  )
}
