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
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { CustomPagination } from '@/components/custom-pagination';
import makeApiRequest from '@/services/axios';
import { apiUrl } from '@/services/api-end-point';
import {
  Plane,
  Car,
  Compass,
  Briefcase,
  Search,
  Plus,
  Edit2,
  Trash2,
  Filter,
  RefreshCw,
  Clock,
  MapPin,
  CircleDollarSign,
  ChevronDown,
  PlaneTakeoff,
  PlaneLanding
} from 'lucide-react';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

type ActiveTab = 'flights' | 'cars' | 'experiences' | 'transfers';

export default function Products() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<ActiveTab>('flights');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Form Modals State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);

  // Delete Confirmation State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Dynamic Forms State
  const [flightForm, setFlightForm] = useState({
    airline: '',
    flight_number: '',
    departure_airport_code: '',
    departure_airport_name: '',
    arrival_airport_code: '',
    arrival_airport_name: '',
    departure_time: '12:00:00',
    arrival_time: '14:00:00',
    stops: 0,
    class: 'Economy',
    base_fare: '',
    taxes: '0',
    currency: 'USD',
    is_active: true
  });

  const [carForm, setCarForm] = useState({
    rental_company: '',
    car_model: '',
    car_class: 'Economy',
    pickup_location: '',
    dropoff_location: '',
    transmission: 'Automatic',
    fuel_type: 'Petrol',
    mileage: 'Unlimited',
    daily_rate: '',
    currency: 'USD',
    is_active: true
  });

  const [experienceForm, setExperienceForm] = useState({
    name: '',
    category: 'Sightseeing',
    location: '',
    duration: '2 Hours',
    rating: '5',
    price_per_ticket: '',
    currency: 'USD',
    is_active: true
  });

  const [transferForm, setTransferForm] = useState({
    transfer_type: 'Private SUV',
    name: '',
    vehicle: '',
    capacity: '4 Passengers',
    pickup_location: '',
    dropoff_location: '',
    price: '',
    currency: 'USD',
    is_active: true
  });

  // Query Key for React Query
  const queryKey = ['vertical-inventory', activeTab, { page, search }] as const;

  // Fetch Inventory List
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
      });
      if (search.trim()) {
        params.append('search', search.trim());
      }
      const res = await makeApiRequest<any>(`${apiUrl.verticals}/${activeTab}?${params.toString()}`);
      return res.data;
    }
  });

  const itemsList = data?.data ?? [];
  const pagination = {
    current_page: data?.current_page ?? 1,
    last_page: data?.last_page ?? 1,
    total: data?.total ?? 0,
    per_page: data?.per_page ?? 20
  };

  // Mutate: Save/Update Item
  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      const url = editingItem 
        ? `${apiUrl.verticals}/${activeTab}/${editingItem.id}` 
        : `${apiUrl.verticals}/${activeTab}`;
      const method = editingItem ? 'PUT' : 'POST';
      return await makeApiRequest(url, { method, data: payload });
    },
    onSuccess: (res: any) => {
      toast.success(editingItem ? 'Item updated successfully' : 'Item created successfully');
      setModalOpen(false);
      resetForms();
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to save inventory item');
    }
  });

  // Mutate: Toggle Active Status
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: number; is_active: boolean }) => {
      const url = `${apiUrl.verticals}/${activeTab}/${id}`;
      return await makeApiRequest(url, { method: 'PUT', data: { is_active } });
    },
    onSuccess: () => {
      toast.success('Status updated successfully');
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to update status');
    }
  });

  // Mutate: Delete Item
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const url = `${apiUrl.verticals}/${activeTab}/${id}`;
      return await makeApiRequest(url, { method: 'DELETE' });
    },
    onSuccess: () => {
      toast.success('Item deleted successfully');
      setDeleteConfirmOpen(false);
      setDeletingId(null);
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to delete item');
    }
  });

  // Reset forms helper
  const resetForms = () => {
    setEditingItem(null);
    setFlightForm({
      airline: '',
      flight_number: '',
      departure_airport_code: '',
      departure_airport_name: '',
      arrival_airport_code: '',
      arrival_airport_name: '',
      departure_time: '12:00:00',
      arrival_time: '14:00:00',
      stops: 0,
      class: 'Economy',
      base_fare: '',
      taxes: '0',
      currency: 'USD',
      is_active: true
    });
    setCarForm({
      rental_company: '',
      car_model: '',
      car_class: 'Economy',
      pickup_location: '',
      dropoff_location: '',
      transmission: 'Automatic',
      fuel_type: 'Petrol',
      mileage: 'Unlimited',
      daily_rate: '',
      currency: 'USD',
      is_active: true
    });
    setExperienceForm({
      name: '',
      category: 'Sightseeing',
      location: '',
      duration: '2 Hours',
      rating: '5',
      price_per_ticket: '',
      currency: 'USD',
      is_active: true
    });
    setTransferForm({
      transfer_type: 'Private SUV',
      name: '',
      vehicle: '',
      capacity: '4 Passengers',
      pickup_location: '',
      dropoff_location: '',
      price: '',
      currency: 'USD',
      is_active: true
    });
  };

  const handleOpenAddModal = () => {
    resetForms();
    setModalOpen(true);
  };

  const handleOpenEditModal = (item: any) => {
    setEditingItem(item);
    if (activeTab === 'flights') {
      setFlightForm({
        airline: item.airline || '',
        flight_number: item.flight_number || '',
        departure_airport_code: item.departure_airport_code || '',
        departure_airport_name: item.departure_airport_name || '',
        arrival_airport_code: item.arrival_airport_code || '',
        arrival_airport_name: item.arrival_airport_name || '',
        departure_time: item.departure_time || '12:00:00',
        arrival_time: item.arrival_time || '14:00:00',
        stops: item.stops ?? 0,
        class: item.class || 'Economy',
        base_fare: String(item.base_fare ?? ''),
        taxes: String(item.taxes ?? '0'),
        currency: item.currency || 'USD',
        is_active: item.is_active === 1 || item.is_active === true
      });
    } else if (activeTab === 'cars') {
      setCarForm({
        rental_company: item.rental_company || '',
        car_model: item.car_model || '',
        car_class: item.car_class || 'Economy',
        pickup_location: item.pickup_location || '',
        dropoff_location: item.dropoff_location || '',
        transmission: item.transmission || 'Automatic',
        fuel_type: item.fuel_type || 'Petrol',
        mileage: item.mileage || 'Unlimited',
        daily_rate: String(item.daily_rate ?? ''),
        currency: item.currency || 'USD',
        is_active: item.is_active === 1 || item.is_active === true
      });
    } else if (activeTab === 'experiences') {
      setExperienceForm({
        name: item.name || '',
        category: item.category || 'Sightseeing',
        location: item.location || '',
        duration: item.duration || '2 Hours',
        rating: String(item.rating ?? '5'),
        price_per_ticket: String(item.price_per_ticket ?? ''),
        currency: item.currency || 'USD',
        is_active: item.is_active === 1 || item.is_active === true
      });
    } else if (activeTab === 'transfers') {
      setTransferForm({
        transfer_type: item.transfer_type || 'Private SUV',
        name: item.name || '',
        vehicle: item.vehicle || '',
        capacity: item.capacity || '4 Passengers',
        pickup_location: item.pickup_location || '',
        dropoff_location: item.dropoff_location || '',
        price: String(item.price ?? ''),
        currency: item.currency || 'USD',
        is_active: item.is_active === 1 || item.is_active === true
      });
    }
    setModalOpen(true);
  };

  const handleDeleteClick = (id: number) => {
    setDeletingId(id);
    setDeleteConfirmOpen(true);
  };

  const handleToggleStatus = (id: number, currentStatus: boolean) => {
    toggleStatusMutation.mutate({ id, is_active: !currentStatus });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'flights') {
      if (!flightForm.airline || !flightForm.flight_number || !flightForm.departure_airport_code || !flightForm.arrival_airport_code || !flightForm.base_fare) {
        toast.error('Please fill in all required fields');
        return;
      }
      saveMutation.mutate({
        ...flightForm,
        stops: Number(flightForm.stops),
        base_fare: Number(flightForm.base_fare),
        taxes: Number(flightForm.taxes)
      });
    } else if (activeTab === 'cars') {
      if (!carForm.rental_company || !carForm.car_model || !carForm.pickup_location || !carForm.daily_rate) {
        toast.error('Please fill in all required fields');
        return;
      }
      saveMutation.mutate({
        ...carForm,
        daily_rate: Number(carForm.daily_rate)
      });
    } else if (activeTab === 'experiences') {
      if (!experienceForm.name || !experienceForm.location || !experienceForm.price_per_ticket) {
        toast.error('Please fill in all required fields');
        return;
      }
      saveMutation.mutate({
        ...experienceForm,
        rating: Number(experienceForm.rating),
        price_per_ticket: Number(experienceForm.price_per_ticket)
      });
    } else if (activeTab === 'transfers') {
      if (!transferForm.name || !transferForm.pickup_location || !transferForm.dropoff_location || !transferForm.price) {
        toast.error('Please fill in all required fields');
        return;
      }
      saveMutation.mutate({
        ...transferForm,
        price: Number(transferForm.price)
      });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-green-600 to-emerald-800 bg-clip-text text-transparent">
            Travel Inventory
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage manual database inventory for travel verticals (Flights, Cars, Experiences, Transfers).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => refetch()} 
            className="border-green-200 text-green-700 hover:bg-green-50"
            disabled={isFetching}
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
          <Button 
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-medium shadow-md shadow-green-100"
            onClick={handleOpenAddModal}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add {activeTab.slice(0, -1).toUpperCase()}
          </Button>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex border-b border-muted overflow-x-auto pb-px gap-1">
        {(['flights', 'cars', 'experiences', 'transfers'] as ActiveTab[]).map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setPage(1);
                setSearch('');
              }}
              className={`flex items-center gap-2 px-5 py-3 border-b-2 text-sm font-semibold capitalize whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? 'border-green-600 text-green-700 bg-green-50/50'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
              }`}
            >
              {tab === 'flights' && <Plane className="h-4 w-4" />}
              {tab === 'cars' && <Car className="h-4 w-4" />}
              {tab === 'experiences' && <Compass className="h-4 w-4" />}
              {tab === 'transfers' && <Briefcase className="h-4 w-4" />}
              {tab}
            </button>
          );
        })}
      </div>

      {/* Filter and Search Box */}
      <div className="flex flex-col sm:flex-row gap-4 items-center bg-card p-4 rounded-xl border border-muted">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={`Search ${activeTab}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 w-full bg-muted/30 border-muted"
            onKeyDown={(e) => {
              if (e.key === 'Enter') setPage(1);
            }}
          />
        </div>
        <Button 
          variant="outline" 
          onClick={() => setPage(1)} 
          className="w-full sm:w-auto border-muted text-foreground hover:bg-muted"
        >
          <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
          Search
        </Button>
      </div>

      {/* Grid or Table Card */}
      <Card className="border border-muted shadow-sm overflow-hidden rounded-xl">
        <CardHeader className="bg-muted/10 pb-4">
          <CardTitle className="text-xl capitalize">{activeTab} Inventory</CardTitle>
          <CardDescription>
            Showing database listings. Results are combined with mock results on client queries if necessary.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <RefreshCw className="h-8 w-8 animate-spin text-green-600" />
              <p className="text-sm text-muted-foreground">Loading inventory list...</p>
            </div>
          ) : itemsList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-4">
              <div className="h-16 w-16 rounded-full bg-green-50 flex items-center justify-center text-green-600 mb-4">
                {activeTab === 'flights' && <Plane className="h-8 w-8" />}
                {activeTab === 'cars' && <Car className="h-8 w-8" />}
                {activeTab === 'experiences' && <Compass className="h-8 w-8" />}
                {activeTab === 'transfers' && <Briefcase className="h-8 w-8" />}
              </div>
              <h3 className="font-semibold text-lg">No database records found</h3>
              <p className="text-muted-foreground max-w-sm mt-1">
                Currently, there is no manual inventory for this vertical. Add some records to prioritize them over the mock results!
              </p>
              <Button 
                onClick={handleOpenAddModal} 
                className="mt-5 bg-green-600 hover:bg-green-700 text-white"
              >
                <Plus className="mr-2 h-4 w-4" /> Add Item
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/20">
                  <TableRow>
                    {activeTab === 'flights' && (
                      <>
                        <TableHead>Airline & Flight</TableHead>
                        <TableHead>Route</TableHead>
                        <TableHead>Departure & Arrival</TableHead>
                        <TableHead>Class / Stops</TableHead>
                        <TableHead>Fare</TableHead>
                      </>
                    )}
                    {activeTab === 'cars' && (
                      <>
                        <TableHead>Company & Model</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Pickup / Dropoff</TableHead>
                        <TableHead>Transmission & Fuel</TableHead>
                        <TableHead>Daily Rate</TableHead>
                      </>
                    )}
                    {activeTab === 'experiences' && (
                      <>
                        <TableHead>Experience Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Duration & Rating</TableHead>
                        <TableHead>Price</TableHead>
                      </>
                    )}
                    {activeTab === 'transfers' && (
                      <>
                        <TableHead>Type & Vehicle</TableHead>
                        <TableHead>Pickup</TableHead>
                        <TableHead>Dropoff</TableHead>
                        <TableHead>Capacity</TableHead>
                        <TableHead>Price</TableHead>
                      </>
                    )}
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {itemsList.map((item: any) => (
                    <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                      {activeTab === 'flights' && (
                        <>
                          <TableCell>
                            <div className="font-semibold text-foreground">{item.airline}</div>
                            <div className="text-xs text-muted-foreground font-mono">{item.flight_number}</div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm bg-muted px-2 py-0.5 rounded text-foreground font-mono">{item.departure_airport_code}</span>
                              <span className="text-muted-foreground text-xs">→</span>
                              <span className="font-bold text-sm bg-muted px-2 py-0.5 rounded text-foreground font-mono">{item.arrival_airport_code}</span>
                            </div>
                            <div className="text-xs text-muted-foreground max-w-[200px] truncate mt-1">
                              {item.departure_airport_name} to {item.arrival_airport_name}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-xs text-foreground">
                              <PlaneTakeoff className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>{item.departure_time}</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-foreground mt-1">
                              <PlaneLanding className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>{item.arrival_time}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm font-medium">{item.class}</div>
                            <div className="text-xs text-muted-foreground">{item.stops} Stops</div>
                          </TableCell>
                          <TableCell className="font-bold text-foreground">
                            {item.currency} {item.base_fare}
                            <div className="text-[10px] text-muted-foreground font-normal">+ {item.taxes} taxes</div>
                          </TableCell>
                        </>
                      )}

                      {activeTab === 'cars' && (
                        <>
                          <TableCell>
                            <div className="font-semibold text-foreground">{item.car_model}</div>
                            <div className="text-xs text-muted-foreground">{item.rental_company}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="font-normal text-xs">{item.car_class}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>{item.pickup_location}</span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-0.5 pl-4">to {item.dropoff_location}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-xs">{item.transmission}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">{item.fuel_type} • {item.mileage}</div>
                          </TableCell>
                          <TableCell className="font-bold text-foreground">
                            {item.currency} {item.daily_rate}
                            <span className="text-[10px] text-muted-foreground font-normal"> / day</span>
                          </TableCell>
                        </>
                      )}

                      {activeTab === 'experiences' && (
                        <>
                          <TableCell className="font-semibold text-foreground max-w-[200px] truncate">
                            {item.name}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-normal text-xs">{item.category}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>{item.location}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-xs flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>{item.duration}</span>
                            </div>
                            <div className="text-xs text-yellow-600 font-semibold mt-1">★ {item.rating} / 5</div>
                          </TableCell>
                          <TableCell className="font-bold text-foreground">
                            {item.currency} {item.price_per_ticket}
                            <span className="text-[10px] text-muted-foreground font-normal"> / ticket</span>
                          </TableCell>
                        </>
                      )}

                      {activeTab === 'transfers' && (
                        <>
                          <TableCell>
                            <div className="font-semibold text-foreground">{item.name}</div>
                            <div className="text-xs text-muted-foreground">{item.vehicle || 'Standard Vehicle'}</div>
                          </TableCell>
                          <TableCell className="text-sm">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>{item.pickup_location}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>{item.dropoff_location}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-xs text-foreground font-medium">{item.capacity}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">{item.transfer_type}</div>
                          </TableCell>
                          <TableCell className="font-bold text-foreground">
                            {item.currency} {item.price}
                          </TableCell>
                        </>
                      )}

                      <TableCell>
                        <Switch
                          checked={item.is_active === 1 || item.is_active === true}
                          onCheckedChange={() => handleToggleStatus(item.id, item.is_active === 1 || item.is_active === true)}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground hover:text-green-600 hover:bg-green-50"
                            onClick={() => handleOpenEditModal(item)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-50"
                            onClick={() => handleDeleteClick(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.last_page > 1 && (
        <div className="py-4">
          <CustomPagination
            currentPage={pagination.current_page}
            totalPages={pagination.last_page}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border border-muted rounded-xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-800 bg-clip-text text-transparent">
              {editingItem ? 'Edit' : 'Add'} {activeTab.slice(0, -1).toUpperCase()} Item
            </DialogTitle>
            <DialogDescription>
              Fill in the inventory details below. These records will be served in search results.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5 pt-4">
            {activeTab === 'flights' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="airline" className="text-sm font-medium">Airline *</Label>
                  <Input
                    id="airline"
                    required
                    value={flightForm.airline}
                    onChange={(e) => setFlightForm({ ...flightForm, airline: e.target.value })}
                    placeholder="e.g. Emirates"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="flight_number" className="text-sm font-medium">Flight Number *</Label>
                  <Input
                    id="flight_number"
                    required
                    value={flightForm.flight_number}
                    onChange={(e) => setFlightForm({ ...flightForm, flight_number: e.target.value })}
                    placeholder="e.g. EK-201"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="departure_code" className="text-sm font-medium">Departure Airport Code (IATA) *</Label>
                  <Input
                    id="departure_code"
                    required
                    maxLength={3}
                    value={flightForm.departure_airport_code}
                    onChange={(e) => setFlightForm({ ...flightForm, departure_airport_code: e.target.value.toUpperCase() })}
                    placeholder="e.g. DXB"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="departure_name" className="text-sm font-medium">Departure Airport Name *</Label>
                  <Input
                    id="departure_name"
                    required
                    value={flightForm.departure_airport_name}
                    onChange={(e) => setFlightForm({ ...flightForm, departure_airport_name: e.target.value })}
                    placeholder="e.g. Dubai International Airport"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="arrival_code" className="text-sm font-medium">Arrival Airport Code (IATA) *</Label>
                  <Input
                    id="arrival_code"
                    required
                    maxLength={3}
                    value={flightForm.arrival_airport_code}
                    onChange={(e) => setFlightForm({ ...flightForm, arrival_airport_code: e.target.value.toUpperCase() })}
                    placeholder="e.g. LHR"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="arrival_name" className="text-sm font-medium">Arrival Airport Name *</Label>
                  <Input
                    id="arrival_name"
                    required
                    value={flightForm.arrival_airport_name}
                    onChange={(e) => setFlightForm({ ...flightForm, arrival_airport_name: e.target.value })}
                    placeholder="e.g. London Heathrow"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dep_time" className="text-sm font-medium">Departure Time (HH:MM:SS) *</Label>
                  <Input
                    id="dep_time"
                    required
                    value={flightForm.departure_time}
                    onChange={(e) => setFlightForm({ ...flightForm, departure_time: e.target.value })}
                    placeholder="12:00:00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="arr_time" className="text-sm font-medium">Arrival Time (HH:MM:SS) *</Label>
                  <Input
                    id="arr_time"
                    required
                    value={flightForm.arrival_time}
                    onChange={(e) => setFlightForm({ ...flightForm, arrival_time: e.target.value })}
                    placeholder="14:00:00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stops" className="text-sm font-medium">Stops</Label>
                  <Input
                    id="stops"
                    type="number"
                    min={0}
                    value={flightForm.stops}
                    onChange={(e) => setFlightForm({ ...flightForm, stops: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="class" className="text-sm font-medium">Flight Class</Label>
                  <Select 
                    value={flightForm.class} 
                    onValueChange={(val) => setFlightForm({ ...flightForm, class: val })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Economy">Economy</SelectItem>
                      <SelectItem value="Premium Economy">Premium Economy</SelectItem>
                      <SelectItem value="Business">Business</SelectItem>
                      <SelectItem value="First Class">First Class</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="base_fare" className="text-sm font-medium">Base Fare ($) *</Label>
                  <Input
                    id="base_fare"
                    type="number"
                    step="0.01"
                    required
                    value={flightForm.base_fare}
                    onChange={(e) => setFlightForm({ ...flightForm, base_fare: e.target.value })}
                    placeholder="250.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxes" className="text-sm font-medium">Taxes ($)</Label>
                  <Input
                    id="taxes"
                    type="number"
                    step="0.01"
                    value={flightForm.taxes}
                    onChange={(e) => setFlightForm({ ...flightForm, taxes: e.target.value })}
                    placeholder="45.00"
                  />
                </div>
              </div>
            )}

            {activeTab === 'cars' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rental_company" className="text-sm font-medium">Rental Company *</Label>
                  <Input
                    id="rental_company"
                    required
                    value={carForm.rental_company}
                    onChange={(e) => setCarForm({ ...carForm, rental_company: e.target.value })}
                    placeholder="e.g. Hertz"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="car_model" className="text-sm font-medium">Car Model *</Label>
                  <Input
                    id="car_model"
                    required
                    value={carForm.car_model}
                    onChange={(e) => setCarForm({ ...carForm, car_model: e.target.value })}
                    placeholder="e.g. Toyota Corolla"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="car_class" className="text-sm font-medium">Car Class *</Label>
                  <Select 
                    value={carForm.car_class} 
                    onValueChange={(val) => setCarForm({ ...carForm, car_class: val })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Economy">Economy</SelectItem>
                      <SelectItem value="Compact">Compact</SelectItem>
                      <SelectItem value="Sedan">Sedan</SelectItem>
                      <SelectItem value="SUV">SUV</SelectItem>
                      <SelectItem value="Luxury">Luxury</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pickup_location" className="text-sm font-medium">Pickup Location *</Label>
                  <Input
                    id="pickup_location"
                    required
                    value={carForm.pickup_location}
                    onChange={(e) => setCarForm({ ...carForm, pickup_location: e.target.value })}
                    placeholder="e.g. Dubai Airport DXB"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dropoff_location" className="text-sm font-medium">Dropoff Location *</Label>
                  <Input
                    id="dropoff_location"
                    required
                    value={carForm.dropoff_location}
                    onChange={(e) => setCarForm({ ...carForm, dropoff_location: e.target.value })}
                    placeholder="e.g. Dubai Airport DXB"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transmission" className="text-sm font-medium">Transmission</Label>
                  <Select 
                    value={carForm.transmission} 
                    onValueChange={(val) => setCarForm({ ...carForm, transmission: val })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Transmission" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Automatic">Automatic</SelectItem>
                      <SelectItem value="Manual">Manual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fuel_type" className="text-sm font-medium">Fuel Type</Label>
                  <Input
                    id="fuel_type"
                    value={carForm.fuel_type}
                    onChange={(e) => setCarForm({ ...carForm, fuel_type: e.target.value })}
                    placeholder="e.g. Petrol / Diesel / Electric"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mileage" className="text-sm font-medium">Mileage</Label>
                  <Input
                    id="mileage"
                    value={carForm.mileage}
                    onChange={(e) => setCarForm({ ...carForm, mileage: e.target.value })}
                    placeholder="e.g. Unlimited"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="daily_rate" className="text-sm font-medium">Daily Rate ($) *</Label>
                  <Input
                    id="daily_rate"
                    type="number"
                    step="0.01"
                    required
                    value={carForm.daily_rate}
                    onChange={(e) => setCarForm({ ...carForm, daily_rate: e.target.value })}
                    placeholder="45.00"
                  />
                </div>
              </div>
            )}

            {activeTab === 'experiences' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="exp_name" className="text-sm font-medium">Experience Name *</Label>
                  <Input
                    id="exp_name"
                    required
                    value={experienceForm.name}
                    onChange={(e) => setExperienceForm({ ...experienceForm, name: e.target.value })}
                    placeholder="e.g. Desert Safari Premium Tour"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="exp_category" className="text-sm font-medium">Category *</Label>
                  <Input
                    id="exp_category"
                    required
                    value={experienceForm.category}
                    onChange={(e) => setExperienceForm({ ...experienceForm, category: e.target.value })}
                    placeholder="e.g. Adventure / Sightseeing"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="exp_location" className="text-sm font-medium">Location *</Label>
                  <Input
                    id="exp_location"
                    required
                    value={experienceForm.location}
                    onChange={(e) => setExperienceForm({ ...experienceForm, location: e.target.value })}
                    placeholder="e.g. Dubai, UAE"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="exp_duration" className="text-sm font-medium">Duration</Label>
                  <Input
                    id="exp_duration"
                    value={experienceForm.duration}
                    onChange={(e) => setExperienceForm({ ...experienceForm, duration: e.target.value })}
                    placeholder="e.g. 4 Hours / 1 Day"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="exp_rating" className="text-sm font-medium">Rating (1-5)</Label>
                  <Input
                    id="exp_rating"
                    type="number"
                    min={1}
                    max={5}
                    step="0.1"
                    value={experienceForm.rating}
                    onChange={(e) => setExperienceForm({ ...experienceForm, rating: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="exp_price" className="text-sm font-medium">Price per Ticket ($) *</Label>
                  <Input
                    id="exp_price"
                    type="number"
                    step="0.01"
                    required
                    value={experienceForm.price_per_ticket}
                    onChange={(e) => setExperienceForm({ ...experienceForm, price_per_ticket: e.target.value })}
                    placeholder="75.00"
                  />
                </div>
              </div>
            )}

            {activeTab === 'transfers' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="trans_name" className="text-sm font-medium">Transfer Name *</Label>
                  <Input
                    id="trans_name"
                    required
                    value={transferForm.name}
                    onChange={(e) => setTransferForm({ ...transferForm, name: e.target.value })}
                    placeholder="e.g. Private SUV Airport Transfer to Hotel"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="trans_type" className="text-sm font-medium">Transfer Type *</Label>
                  <Select 
                    value={transferForm.transfer_type} 
                    onValueChange={(val) => setTransferForm({ ...transferForm, transfer_type: val })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Private SUV">Private SUV</SelectItem>
                      <SelectItem value="Private Sedan">Private Sedan</SelectItem>
                      <SelectItem value="Shared Shuttle">Shared Shuttle</SelectItem>
                      <SelectItem value="Luxury Limousine">Luxury Limousine</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="trans_vehicle" className="text-sm font-medium">Vehicle Name / Class</Label>
                  <Input
                    id="trans_vehicle"
                    value={transferForm.vehicle}
                    onChange={(e) => setTransferForm({ ...transferForm, vehicle: e.target.value })}
                    placeholder="e.g. Chevrolet Tahoe or similar"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="trans_capacity" className="text-sm font-medium">Capacity</Label>
                  <Input
                    id="trans_capacity"
                    value={transferForm.capacity}
                    onChange={(e) => setTransferForm({ ...transferForm, capacity: e.target.value })}
                    placeholder="e.g. 6 Passengers"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="trans_pickup" className="text-sm font-medium">Pickup Location *</Label>
                  <Input
                    id="trans_pickup"
                    required
                    value={transferForm.pickup_location}
                    onChange={(e) => setTransferForm({ ...transferForm, pickup_location: e.target.value })}
                    placeholder="e.g. Dubai International Airport (DXB)"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="trans_dropoff" className="text-sm font-medium">Dropoff Location *</Label>
                  <Input
                    id="trans_dropoff"
                    required
                    value={transferForm.dropoff_location}
                    onChange={(e) => setTransferForm({ ...transferForm, dropoff_location: e.target.value })}
                    placeholder="e.g. Downtown Dubai Hotel"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="trans_price" className="text-sm font-medium">Price ($) *</Label>
                  <Input
                    id="trans_price"
                    type="number"
                    step="0.01"
                    required
                    value={transferForm.price}
                    onChange={(e) => setTransferForm({ ...transferForm, price: e.target.value })}
                    placeholder="60.00"
                  />
                </div>
              </div>
            )}

            <DialogFooter className="pt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setModalOpen(false)}
                className="border-muted hover:bg-muted text-foreground"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-green-600 hover:bg-green-700 text-white font-semibold"
                disabled={saveMutation.isPending}
              >
                {saveMutation.isPending ? 'Saving...' : 'Save Item'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="max-w-md bg-card border border-muted rounded-xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-red-600">
              Delete Inventory Item
            </DialogTitle>
            <DialogDescription className="pt-2">
              Are you sure you want to permanently delete this inventory item? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setDeleteConfirmOpen(false)}
              className="border-muted hover:bg-muted text-foreground"
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => deletingId && deleteMutation.mutate(deletingId)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
