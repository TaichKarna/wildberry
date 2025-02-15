import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function RecentSales() {
  return (
    <div className="space-y-8">
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarFallback>AP</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">New App Added</p>
          <p className="text-sm text-muted-foreground">
            iOS App "Mindfulness" added
          </p>
        </div>
        <div className="ml-auto font-medium">Just now</div>
      </div>
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarFallback>EP</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">Entitlement Updated</p>
          <p className="text-sm text-muted-foreground">
            "Premium" entitlement modified
          </p>
        </div>
        <div className="ml-auto font-medium">2h ago</div>
      </div>
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarFallback>PP</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">Product Created</p>
          <p className="text-sm text-muted-foreground">
            New product "Annual Plan" added
          </p>
        </div>
        <div className="ml-auto font-medium">5h ago</div>
      </div>
    </div>
  )
}
