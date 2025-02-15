import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const entitlements = [
  {
    id: "1",
    identifier: "pro",
    description: "Pro tier features",
    products: 4,
    created: "2024-02-15",
  },
  {
    id: "2",
    identifier: "premium",
    description: "Premium tier features",
    products: 2,
    created: "2024-02-15",
  },
]

export default function EntitlementsPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Entitlements</h2>
        <Button>Add Entitlement</Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Identifier</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Products</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entitlements.map((entitlement) => (
              <TableRow key={entitlement.id}>
                <TableCell className="font-medium">
                  {entitlement.identifier}
                </TableCell>
                <TableCell>{entitlement.description}</TableCell>
                <TableCell>{entitlement.products}</TableCell>
                <TableCell>{entitlement.created}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
