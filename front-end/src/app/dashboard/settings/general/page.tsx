import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

export default function GeneralSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">General Settings</h2>
        <p className="text-muted-foreground">
          Manage your project settings and preferences
        </p>
      </div>
      <Separator />
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
            <CardDescription>
              Update your project information and settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="projectName">Project Name</Label>
              <Input
                id="projectName"
                placeholder="Enter project name"
                defaultValue="My Project"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Enter project description"
                defaultValue="A project for managing subscriptions"
              />
            </div>
            <Button>Save Changes</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Webhook Settings</CardTitle>
            <CardDescription>
              Configure webhook endpoints for real-time updates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="webhookUrl">Webhook URL</Label>
              <Input
                id="webhookUrl"
                placeholder="https://your-domain.com/webhook"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="secret">Webhook Secret</Label>
              <Input
                id="secret"
                type="password"
                placeholder="Enter webhook secret"
              />
            </div>
            <Button>Update Webhook</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
