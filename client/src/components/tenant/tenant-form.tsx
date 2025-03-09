import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Tenant } from '@shared/schema';
import { apiRequest, queryClient } from '@/lib/queryClient';

type FormValues = {
  name: string;
  domain: string;
  status: string;
};

type TenantFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editTenant?: Tenant;
  onSuccess?: () => void;
};

export function TenantForm({ open, onOpenChange, editTenant, onSuccess }: TenantFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const formSchema = z.object({
    name: z.string()
      .min(2, { message: "Name must be at least 2 characters" })
      .max(100, { message: "Name must be less than 100 characters" }),
    domain: z.string()
      .min(3, { message: "Domain must be at least 3 characters" })
      .max(100, { message: "Domain must be less than 100 characters" })
      .regex(/^[a-z0-9]([a-z0-9-]+\.)+[a-z0-9]+$/, { 
        message: "Domain must be a valid domain format (e.g. example.com)" 
      }),
    status: z.string()
      .refine(val => ['active', 'inactive'].includes(val), { 
        message: "Status must be either active or inactive" 
      }),
  });
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: editTenant?.name || '',
      domain: editTenant?.domain || '',
      status: editTenant?.status || 'active',
    },
  });
  
  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      
      if (editTenant) {
        // Update existing tenant
        await apiRequest('PATCH', `/api/tenants/${editTenant.id}`, values);
        toast({
          title: "Tenant updated",
          description: "Tenant has been updated successfully",
        });
      } else {
        // Create new tenant
        await apiRequest('POST', '/api/tenants', values);
        toast({
          title: "Tenant created",
          description: "Tenant has been created successfully",
        });
      }
      
      // Invalidate the tenants query to refetch the latest data
      queryClient.invalidateQueries({ queryKey: ['/api/tenants'] });
      
      onOpenChange(false);
      if (onSuccess) onSuccess();
      
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "An error occurred while saving the tenant",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{editTenant ? 'Edit Tenant' : 'Create Tenant'}</DialogTitle>
          <DialogDescription>
            {editTenant 
              ? 'Update tenant information and settings.'
              : 'Create a new tenant organization in your SaaS platform.'}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tenant Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Acme Inc." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="domain"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Domain</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="acme.example.com" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
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
                  : editTenant 
                    ? 'Save Changes' 
                    : 'Create Tenant'
                }
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
