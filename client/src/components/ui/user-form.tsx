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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { User } from '@shared/schema';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useQuery } from '@tanstack/react-query';

type FormValues = {
  username: string;
  password?: string;
  fullName: string;
  email: string;
  role: string;
  tenantId: string;
  status: string;
};

type UserFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editUser?: User;
  onSuccess?: () => void;
};

export function UserForm({ open, onOpenChange, editUser, onSuccess }: UserFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch tenants for the tenant dropdown
  const { data: tenants = [] } = useQuery<{ id: number; name: string }[]>({
    queryKey: ['/api/tenants'],
    enabled: open,
  });
  
  const formSchema = z.object({
    username: z.string()
      .min(3, { message: "Username must be at least 3 characters" })
      .max(50, { message: "Username must be less than 50 characters" }),
    password: editUser 
      ? z.string().min(6, { message: "Password must be at least 6 characters" }).optional().or(z.literal(''))
      : z.string().min(6, { message: "Password must be at least 6 characters" }),
    fullName: z.string()
      .min(2, { message: "Full name must be at least 2 characters" })
      .max(100, { message: "Full name must be less than 100 characters" }),
    email: z.string()
      .email({ message: "Please enter a valid email address" }),
    role: z.string()
      .refine(val => ['admin', 'editor', 'user'].includes(val), { 
        message: "Role must be one of admin, editor, or user" 
      }),
    tenantId: z.string().optional(),
    status: z.string()
      .refine(val => ['active', 'inactive', 'invited'].includes(val), { 
        message: "Status must be one of active, inactive, or invited" 
      }),
  });
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: editUser?.username || '',
      password: '',
      fullName: editUser?.fullName || '',
      email: editUser?.email || '',
      role: editUser?.role || 'user',
      tenantId: editUser?.tenantId?.toString() || '',
      status: editUser?.status || 'active',
    },
  });
  
  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      
      // Prepare the data for the API
      const userData = {
        ...values,
        tenantId: values.tenantId === "null" ? null : (values.tenantId ? parseInt(values.tenantId) : null),
      };
      
      // Remove empty password when editing
      if (editUser && !values.password) {
        delete userData.password;
      }
      
      if (editUser) {
        // Update existing user
        await apiRequest('PATCH', `/api/users/${editUser.id}`, userData);
        toast({
          title: "User updated",
          description: "User has been updated successfully",
        });
      } else {
        // Create new user
        await apiRequest('POST', '/api/users', userData);
        toast({
          title: "User created",
          description: "User has been created successfully",
        });
      }
      
      // Invalidate the users query to refetch the latest data
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      
      onOpenChange(false);
      if (onSuccess) onSuccess();
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred while saving the user",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editUser ? 'Edit User' : 'Add New User'}</DialogTitle>
          <DialogDescription>
            {editUser 
              ? 'Update user information and permissions.'
              : 'Create a new user with specific permissions.'}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="John Doe" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="johndoe" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" placeholder="john@example.com" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{editUser ? 'New Password (leave blank to keep current)' : 'Password'}</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" placeholder={editUser ? '••••••••' : 'Enter password'} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="editor">Editor</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="tenantId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tenant</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a tenant" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="null">No tenant (Global)</SelectItem>
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
                      <SelectItem value="invited">Invited</SelectItem>
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
                  : editUser 
                    ? 'Save Changes' 
                    : 'Create User'
                }
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
