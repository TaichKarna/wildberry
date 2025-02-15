import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const products = [
  {
    id: "1",
    name: "Monthly Pro",
    identifier: "monthly_pro",
    price: "$9.99",
    type: "Subscription",
    created: "2024-02-15",
  },
  {
    id: "2",
    name: "Annual Pro",
    identifier: "annual_pro",
    price: "$99.99",
    type: "Subscription",
    created: "2024-02-15",
  },
]

export default function ProductsPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Products</h2>
        <Button>Add Product</Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Identifier</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">
                  {product.name}
                </TableCell>
                <TableCell>{product.identifier}</TableCell>
                <TableCell>{product.price}</TableCell>
                <TableCell>{product.type}</TableCell>
                <TableCell>{product.created}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
