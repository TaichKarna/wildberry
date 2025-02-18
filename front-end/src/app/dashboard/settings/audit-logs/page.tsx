import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { FileText, Download } from "lucide-react"

const auditLogs = [
  {
    id: "1",
    action: "API Key Created",
    user: "admin@example.com",
    resource: "API Key (pk_live_****)",
    timestamp: "2024-02-15 10:30:00",
    ip: "192.168.1.1",
  },
  {
    id: "2",
    action: "Product Created",
    user: "admin@example.com",
    resource: "Product (pro_monthly)",
    timestamp: "2024-02-15 10:15:00",
    ip: "192.168.1.1",
  },
  {
    id: "3",
    action: "Entitlement Updated",
    user: "admin@example.com",
    resource: "Entitlement (pro_access)",
    timestamp: "2024-02-15 10:00:00",
    ip: "192.168.1.1",
  },
]

export default function AuditLogsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Audit Logs</h2>
          <p className="text-muted-foreground">
            View a history of actions taken in your project
          </p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Logs
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Action</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Resource</TableHead>
              <TableHead>Timestamp</TableHead>
              <TableHead>IP Address</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {auditLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center">
                    <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                    {log.action}
                  </div>
                </TableCell>
                <TableCell>{log.user}</TableCell>
                <TableCell>{log.resource}</TableCell>
                <TableCell>{log.timestamp}</TableCell>
                <TableCell>
                  <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                    {log.ip}
                  </code>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
