import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { AppWindow } from "lucide-react"

const apps = [
  {
    id: "1",
    name: "Mindfulness",
    platform: "iOS",
    bundleId: "com.example.mindfulness",
    created: "2024-02-15",
  },
  {
    id: "2",
    name: "Mindfulness",
    platform: "Android",
    bundleId: "com.example.mindfulness",
    created: "2024-02-15",
  },
]

export default function AppsPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Apps</h2>
        <Button>Add App</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {apps.map((app) => (
          <Card key={app.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {app.name}
              </CardTitle>
              <AppWindow className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{app.platform}</div>
              <p className="text-xs text-muted-foreground">
                {app.bundleId}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div>Created</div>
                <div className="text-right">{app.created}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
