import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Gift } from "lucide-react"

const offerings = [
  {
    id: "1",
    name: "Basic Plan",
    products: ["Monthly Basic", "Annual Basic"],
    status: "Active",
    created: "2024-02-15",
  },
  {
    id: "2",
    name: "Pro Bundle",
    products: ["Monthly Pro", "Annual Pro", "Lifetime Pro"],
    status: "Active",
    created: "2024-02-15",
  },
]

export default function OfferingsPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Offerings</h2>
          <p className="text-muted-foreground">
            Manage your product offerings and bundles
          </p>
        </div>
        <Button>
          <Gift className="mr-2 h-4 w-4" />
          Create Offering
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Products</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {offerings.map((offering) => (
              <TableRow key={offering.id}>
                <TableCell className="font-medium">
                  {offering.name}
                </TableCell>
                <TableCell>{offering.products.join(", ")}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ring-green-600/20 bg-green-50 text-green-700">
                    {offering.status}
                  </span>
                </TableCell>
                <TableCell>{offering.created}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
