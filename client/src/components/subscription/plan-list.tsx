import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Plan } from '@shared/schema';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Edit, Trash2, Plus } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Skeleton } from '@/components/ui/skeleton';

export function PlanList() {
  const { toast } = useToast();
  const [planFormOpen, setPlanFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  
  // Fetch plans
  const { data: plans = [], isLoading } = useQuery<Plan[]>({
    queryKey: ['/api/plans'],
  });
  
  // Delete plan mutation
  const deletePlanMutation = useMutation({
    mutationFn: (planId: number) => {
      return apiRequest('DELETE', `/api/plans/${planId}`);
    },
    onSuccess: () => {
      toast({
        title: 'Plan deleted',
        description: 'Plan has been deleted successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/plans'] });
      setDeleteDialogOpen(false);
      setSelectedPlan(null);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete plan',
        variant: 'destructive',
      });
    },
  });
  
  // Handlers
  const handleEditPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setPlanFormOpen(true);
  };
  
  const handleDeletePlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setDeleteDialogOpen(true);
  };
  
  const confirmDeletePlan = () => {
    if (selectedPlan) {
      deletePlanMutation.mutate(selectedPlan.id);
    }
  };
  
  const closePlanForm = () => {
    setPlanFormOpen(false);
    setSelectedPlan(null);
  };
  
  // Format price to currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price / 100);
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>Subscription Plans</CardTitle>
            <CardDescription>Manage your available subscription plans</CardDescription>
          </div>
          <Skeleton className="h-10 w-[120px]" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-[200px] w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Subscription Plans</CardTitle>
          <CardDescription>Manage your available subscription plans</CardDescription>
        </div>
        <Button onClick={() => setPlanFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Plan
        </Button>
      </CardHeader>
      <CardContent>
        {plans.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-sm text-gray-500">No plans found. Create your first plan to get started.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <Card key={plan.id} className="overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">{plan.name}</h3>
                      <div className="mt-1 text-2xl font-bold">
                        {formatPrice(plan.price)}<span className="text-sm font-normal text-gray-500">/{plan.interval}</span>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleEditPlan(plan)}
                        className="text-blue-600 hover:text-blue-900 hover:bg-blue-50"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDeletePlan(plan)}
                        className="text-red-600 hover:text-red-900 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <p className="mt-4 text-sm text-gray-500">
                    {plan.description || 'No description provided.'}
                  </p>
                  
                  <div className="mt-4 flex items-center">
                    <span className={`px-2 py-1 text-xs rounded ${
                      plan.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {plan.status}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
      
      {/* Plan Form Dialog */}
      <PlanForm 
        open={planFormOpen} 
        onOpenChange={closePlanForm}
        editPlan={selectedPlan || undefined}
      />
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the plan "{selectedPlan?.name}".
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeletePlan}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {deletePlanMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

// Plan Form Component
function PlanForm({ open, onOpenChange, editPlan }: { open: boolean; onOpenChange: (open: boolean) => void; editPlan?: Plan }) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const planSchema = z.object({
    name: z.string().min(1, "Name is required").max(100),
    description: z.string().optional(),
    price: z.preprocess(
      (val) => (val === '' ? undefined : parseInt(val as string, 10)),
      z.number().min(0, "Price must be a positive number")
    ),
    interval: z.string().refine(val => ['month', 'year'].includes(val), {
      message: "Interval must be either month or year"
    }),
    status: z.string().refine(val => ['active', 'inactive'].includes(val), {
      message: "Status must be either active or inactive"
    }),
  });
  
  const form = useForm<z.infer<typeof planSchema>>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      name: editPlan?.name || '',
      description: editPlan?.description || '',
      price: editPlan ? editPlan.price / 100 : undefined,
      interval: editPlan?.interval || 'month',
      status: editPlan?.status || 'active',
    },
  });
  
  const onSubmit = async (values: z.infer<typeof planSchema>) => {
    try {
      setIsSubmitting(true);
      
      // Convert price from dollars to cents
      const planData = {
        ...values,
        price: values.price * 100,
      };
      
      if (editPlan) {
        // Update existing plan
        await apiRequest('PATCH', `/api/plans/${editPlan.id}`, planData);
        toast({
          title: "Plan updated",
          description: "Plan has been updated successfully",
        });
      } else {
        // Create new plan
        await apiRequest('POST', '/api/plans', planData);
        toast({
          title: "Plan created",
          description: "Plan has been created successfully",
        });
      }
      
      // Invalidate the plans query to refetch the latest data
      queryClient.invalidateQueries({ queryKey: ['/api/plans'] });
      
      onOpenChange(false);
      
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "An error occurred while saving the plan",
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
          <DialogTitle>{editPlan ? 'Edit Plan' : 'Create Plan'}</DialogTitle>
          <DialogDescription>
            {editPlan
              ? 'Update details for this subscription plan.'
              : 'Create a new subscription plan for your customers.'}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plan Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Basic Plan" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="A plan for small teams and individuals"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price ($)</FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="19.99"
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="interval"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Billing Interval</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select interval" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="month">Monthly</SelectItem>
                        <SelectItem value="year">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
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
                      <SelectItem value="inactive">Inactive</SelectItem>
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
                  : editPlan 
                    ? 'Save Changes' 
                    : 'Create Plan'
                }
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
