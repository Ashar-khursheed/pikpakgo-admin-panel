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
import { formatDate } from '@/utils/utils';
import { Activity, CalendarDays, ChevronDown, Clock, FilePlus } from 'lucide-react';
import { useState } from 'react';

const orderData = [
  { id: '#ORD-001', customer: 'John Doe', email: 'john@example.com', total: 129.99, status: 'Delivered', date: '2024-06-01' },
  { id: '#ORD-002', customer: 'Jane Smith', email: 'jane@example.com', total: 89.50, status: 'Processing', date: '2024-06-05' },
  { id: '#ORD-003', customer: 'Bob Johnson', email: 'bob@example.com', total: 199.99, status: 'Shipped', date: '2024-06-08' },
  { id: '#ORD-004', customer: 'Alice Brown', email: 'alice@example.com', total: 45.00, status: 'Pending', date: '2024-06-10' },
  { id: '#ORD-005', customer: 'Charlie Wilson', email: 'charlie@example.com', total: 299.99, status: 'Cancelled', date: '2024-06-11' },
];

export default function Orders() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  const filteredOrders = orderData.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || order.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive"; className: string }> = {
      Delivered: { variant: 'default', className: 'bg-green-100 text-green-800 hover:bg-green-100' },
      Processing: { variant: 'default', className: 'bg-blue-100 text-blue-800 hover:bg-blue-100' },
      Shipped: { variant: 'default', className: 'bg-purple-100 text-purple-800 hover:bg-purple-100' },
      Pending: { variant: 'secondary', className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' },
      Cancelled: { variant: 'destructive', className: 'bg-red-100 text-red-800 hover:bg-red-100' }
    };
    
    const config = statusConfig[status] || statusConfig.Pending;
    
    return (
      <Badge variant={config.variant} className={config.className}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">Track and manage customer orders</p>
        </div>
        <Button className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90">
          <FilePlus className="mr-2 h-4 w-4" />
          New Order
        </Button>
      </div>

      {/* Order Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <FilePlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-green-600">+12% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-blue-600">Active orders</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$12,345</div>
            <p className="text-xs text-green-600">+8% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Order</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$89.50</div>
            <p className="text-xs text-muted-foreground">Order value</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order Management</CardTitle>
          <CardDescription>
            View and manage all customer orders
          </CardDescription>
          
          {/* Filters */}
          <div className="flex gap-4 pt-4">
            <Input
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Status: {filterStatus}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilterStatus('All')}>All</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('Pending')}>Pending</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('Processing')}>Processing</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('Shipped')}>Shipped</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('Delivered')}>Delivered</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('Cancelled')}>Cancelled</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{order.customer}</div>
                      <div className="text-sm text-muted-foreground">{order.email}</div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">${order.total}</TableCell>
                  <TableCell>
                    {getStatusBadge(order.status)}
                  </TableCell>
                  <TableCell className="text-muted-foreground whitespace-nowrap">
                    {formatDate(order.date)}
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
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Update Status</DropdownMenuItem>
                        <DropdownMenuItem>Print Invoice</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">Cancel Order</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
