import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Key } from "lucide-react"

const apiKeys = [
  {
    id: "1",
    name: "Production API Key",
    key: "pk_live_***********************",
    created: "2024-02-15",
    lastUsed: "2024-02-15",
  },
  {
    id: "2",
    name: "Development API Key",
    key: "pk_test_***********************",
    created: "2024-02-15",
    lastUsed: "2024-02-15",
  },
]

export default function ApiKeysPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">API Keys</h2>
          <p className="text-muted-foreground">
            Manage API keys for your applications
          </p>
        </div>
        <Button>
          <Key className="mr-2 h-4 w-4" />
          Generate New Key
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Key</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Last Used</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {apiKeys.map((apiKey) => (
              <TableRow key={apiKey.id}>
                <TableCell className="font-medium">{apiKey.name}</TableCell>
                <TableCell>
                  <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                    {apiKey.key}
                  </code>
                </TableCell>
                <TableCell>{apiKey.created}</TableCell>
                <TableCell>{apiKey.lastUsed}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm">
                    Revoke
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
