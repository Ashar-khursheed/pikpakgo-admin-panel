import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { ChevronDown, FilePlus, FileSearch } from 'lucide-react';
import { useState } from 'react';

const productData = [
  { id: 1, name: 'Wireless Headphones', category: 'Electronics', price: 99.99, stock: 45, status: 'Active' },
  { id: 2, name: 'Laptop Stand', category: 'Accessories', price: 29.99, stock: 120, status: 'Active' },
  { id: 3, name: 'USB-C Cable', category: 'Cables', price: 12.99, stock: 0, status: 'Out of Stock' },
  { id: 4, name: 'Bluetooth Speaker', category: 'Electronics', price: 79.99, stock: 23, status: 'Low Stock' },
  { id: 5, name: 'Phone Case', category: 'Accessories', price: 19.99, stock: 87, status: 'Active' },
];

export default function Products() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  const filteredProducts = productData.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || product.category === filterCategory;
    const matchesStatus = filterStatus === 'All' || product.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusBadge = (status: string, stock: number) => {
    if (stock === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>;
    } else if (stock < 30) {
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Low Stock</Badge>;
    } else {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">Manage your product inventory</p>
        </div>
        <Button className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90">
          <FilePlus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Management</CardTitle>
          <CardDescription>
            View and manage all products in your inventory
          </CardDescription>
          
          {/* Filters and View Toggle */}
          <div className="flex gap-4 pt-4">
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Category: {filterCategory}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilterCategory('All')}>All</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterCategory('Electronics')}>Electronics</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterCategory('Accessories')}>Accessories</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterCategory('Cables')}>Cables</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Status: {filterStatus}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilterStatus('All')}>All</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('Active')}>Active</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('Low Stock')}>Low Stock</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('Out of Stock')}>Out of Stock</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex ml-auto gap-2">
              <Button 
                variant={viewMode === 'table' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setViewMode('table')}
              >
                Table
              </Button>
              <Button 
                variant={viewMode === 'grid' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                Grid
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {viewMode === 'table' ? (
            <div className="overflow-x-auto">
              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-primary to-blue-600 flex items-center justify-center">
                          <FileSearch className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <div className="font-medium">{product.name}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{product.category}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">${product.price}</TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell>
                      {getStatusBadge(product.status, product.stock)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            Actions
                            <ChevronDown className="ml-2 h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Edit Product</DropdownMenuItem>
                          <DropdownMenuItem>Update Stock</DropdownMenuItem>
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">Delete Product</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="hover:shadow-lg transition-shadow duration-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-primary to-blue-600 flex items-center justify-center">
                        <FileSearch className="h-6 w-6 text-primary-foreground" />
                      </div>
                      {getStatusBadge(product.status, product.stock)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Category:</span>
                        <Badge variant="outline" className="text-xs">{product.category}</Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Price:</span>
                        <span className="font-medium">${product.price}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Stock:</span>
                        <span className="font-medium">{product.stock}</span>
                      </div>
                    </div>
                    <div className="pt-4">
                      <Button variant="outline" className="w-full">
                        Manage Product
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
