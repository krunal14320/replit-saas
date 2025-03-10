import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Subscription, Plan, Tenant } from '@shared/schema';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Edit, Trash2, Plus, Calendar, Building, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Type definitions to include related data
type SubscriptionWithRelations = Subscription & {
  tenant?: { name: string };
  plan?: { name: string; price: number; interval: string };
};

export function SubscriptionList() {
  const { toast } = useToast();
  const [subscriptionFormOpen, setSubscriptionFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<SubscriptionWithRelations | null>(null);
  
  // Fetch subscriptions
  const { data: subscriptions = [], isLoading: isLoadingSubscriptions } = useQuery<SubscriptionWithRelations[]>({
    queryKey: ['/api/subscriptions'],
  });
  
  // Fetch plans for form dropdown
  const { data: plans = [] } = useQuery<Plan[]>({
    queryKey: ['/api/plans'],
  });
  
  // Fetch tenants for form dropdown
  const { data: tenants = [] } = useQuery<Tenant[]>({
    queryKey: ['/api/tenants'],
  });
  
  // Delete subscription mutation
  const deleteSubscriptionMutation = useMutation({
    mutationFn: (subscriptionId: number) => {
      return apiRequest('DELETE', `/api/subscriptions/${subscriptionId}`);
    },
    onSuccess: () => {
      toast({
        title: 'Subscription deleted',
        description: 'Subscription has been deleted successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/subscriptions'] });
      setDeleteDialogOpen(false);
      setSelectedSubscription(null);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete subscription',
        variant: 'destructive',
      });
    },
  });
  
  // Handlers
  const handleEditSubscription = (subscription: SubscriptionWithRelations) => {
    setSelectedSubscription(subscription);
    setSubscriptionFormOpen(true);
  };
  
  const handleDeleteSubscription = (subscription: SubscriptionWithRelations) => {
    setSelectedSubscription(subscription);
    setDeleteDialogOpen(true);
  };
  
  const confirmDeleteSubscription = () => {
    if (selectedSubscription) {
      deleteSubscriptionMutation.mutate(selectedSubscription.id);
    }
  };
  
  const closeSubscriptionForm = () => {
    setSubscriptionFormOpen(false);
    setSelectedSubscription(null);
  };
  
  // Helper to get tenant and plan names
  const getTenantName = (tenantId: number) => {
    const tenant = tenants.find(t => t.id === tenantId);
    return tenant ? tenant.name : 'Unknown Tenant';
  };
  
  const getPlanName = (planId: number) => {
    const plan = plans.find(p => p.id === planId);
    return plan ? plan.name : 'Unknown Plan';
  };
  
  // Format date
  const formatDate = (date: Date | string | null) => {
    if (!date) return 'N/A';
    return format(new Date(date), 'MMM d, yyyy');
  };
  
  // Helper for status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Active</Badge>;
      case 'canceled':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Canceled</Badge>;
      case 'past_due':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Past Due</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  if (isLoadingSubscriptions) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>Customer Subscriptions</CardTitle>
            <CardDescription>Manage customer subscriptions to your plans</CardDescription>
          </div>
          <Skeleton className="h-10 w-[140px]" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-[300px] w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Customer Subscriptions</CardTitle>
          <CardDescription>Manage customer subscriptions to your plans</CardDescription>
        </div>
        <Button onClick={() => setSubscriptionFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Subscription
        </Button>
      </CardHeader>
      <CardContent>
        {subscriptions.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-sm text-gray-500">No subscriptions found. Add a subscription to get started.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tenant</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscriptions.map((subscription) => (
                <TableRow key={subscription.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <Building className="h-4 w-4 mr-2 text-gray-400" />
                      {getTenantName(subscription.tenantId)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Tag className="h-4 w-4 mr-2 text-gray-400" />
                      {getPlanName(subscription.planId)}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(subscription.status)}</TableCell>
                  <TableCell>{formatDate(subscription.startDate)}</TableCell>
                  <TableCell>{formatDate(subscription.endDate)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleEditSubscription(subscription)}
                        className="text-blue-600 hover:text-blue-900 hover:bg-blue-50"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDeleteSubscription(subscription)}
                        className="text-red-600 hover:text-red-900 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
      
      {/* Subscription Form Dialog */}
      <SubscriptionForm 
        open={subscriptionFormOpen} 
        onOpenChange={closeSubscriptionForm}
        editSubscription={selectedSubscription || undefined}
        plans={plans}
        tenants={tenants}
      />
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the subscription for {selectedSubscription ? getTenantName(selectedSubscription.tenantId) : 'this tenant'}.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteSubscription}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {deleteSubscriptionMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

// Subscription Form Component
function SubscriptionForm({ 
  open, 
  onOpenChange, 
  editSubscription,
  plans,
  tenants,
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void; 
  editSubscription?: Subscription;
  plans: Plan[];
  tenants: Tenant[];
}) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const subscriptionSchema = z.object({
    tenantId: z.preprocess(
      (val) => (val === '' ? undefined : parseInt(val as string, 10)),
      z.number({ required_error: "Tenant is required" })
    ),
    planId: z.preprocess(
      (val) => (val === '' ? undefined : parseInt(val as string, 10)),
      z.number({ required_error: "Plan is required" })
    ),
    status: z.string().refine(val => ['active', 'canceled', 'past_due'].includes(val), {
      message: "Status is required"
    }),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  });
  
  const form = useForm<z.infer<typeof subscriptionSchema>>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: {
      tenantId: editSubscription?.tenantId?.toString() || '',
      planId: editSubscription?.planId?.toString() || '',
      status: editSubscription?.status || 'active',
      startDate: editSubscription?.startDate ? format(new Date(editSubscription.startDate), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
      endDate: editSubscription?.endDate ? format(new Date(editSubscription.endDate), 'yyyy-MM-dd') : '',
    },
  });
  
  const onSubmit = async (values: z.infer<typeof subscriptionSchema>) => {
    try {
      setIsSubmitting(true);
      
      // Format dates
      const subscriptionData = {
        ...values,
        startDate: values.startDate ? new Date(values.startDate).toISOString() : undefined,
        endDate: values.endDate ? new Date(values.endDate).toISOString() : undefined,
      };
      
      if (editSubscription) {
        // Update existing subscription
        await apiRequest('PATCH', `/api/subscriptions/${editSubscription.id}`, subscriptionData);
        toast({
          title: "Subscription updated",
          description: "Subscription has been updated successfully",
        });
      } else {
        // Create new subscription
        await apiRequest('POST', '/api/subscriptions', subscriptionData);
        toast({
          title: "Subscription created",
          description: "Subscription has been created successfully",
        });
      }
      
      // Invalidate the subscriptions query to refetch the latest data
      queryClient.invalidateQueries({ queryKey: ['/api/subscriptions'] });
      
      onOpenChange(false);
      
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "An error occurred while saving the subscription",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editSubscription ? 'Edit Subscription' : 'Create Subscription'}</DialogTitle>
          <DialogDescription>
            {editSubscription
              ? 'Update subscription details for this tenant.'
              : 'Create a new subscription for a tenant.'}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="tenantId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tenant</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value.toString()}
                    disabled={!!editSubscription}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select tenant" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {tenants.map(tenant => (
                        <SelectItem key={tenant.id} value={tenant.id.toString()}>
                          {tenant.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="planId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plan</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select plan" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {plans.map(plan => (
                        <SelectItem key={plan.id} value={plan.id.toString()}>
                          {plan.name} (${plan.price/100}/{plan.interval})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        <input
                          type="date"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date (Optional)</FormLabel>
                    <FormControl>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        <input
                          type="date"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          {...field}
                          value={field.value || ''}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="canceled">Canceled</SelectItem>
                      <SelectItem value="past_due">Past Due</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting 
                  ? 'Saving...' 
                  : editSubscription 
                    ? 'Save Changes' 
                    : 'Create Subscription'
                }
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
