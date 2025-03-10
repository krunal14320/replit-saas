import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Role data type
export type Role = {
  id?: number;
  name: string;
  description: string;
  permissions: Permission[];
};

// Permission data type
export type Permission = {
  name: string;
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
};

type RoleFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editRole?: Role;
  onSuccess?: (role?: Role) => void;
};

export function RoleForm({ open, onOpenChange, editRole, onSuccess }: RoleFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const permissionResources = ["Users", "Tenants", "Subscriptions", "Settings"];

  const formSchema = z.object({
    name: z.string().min(2, "Role name must be at least 2 characters"),
    description: z.string().min(5, "Description must be at least 5 characters"),
    permissions: z.record(z.object({
      create: z.boolean().default(false),
      read: z.boolean().default(true),
      update: z.boolean().default(false),
      delete: z.boolean().default(false),
    })),
  });

  type FormValues = z.infer<typeof formSchema>;

  // Transform the permissions array to the format needed for the form
  const getDefaultPermissions = (role?: Role) => {
    const permissions: Record<string, { create: boolean; read: boolean; update: boolean; delete: boolean }> = {};
    
    permissionResources.forEach(resource => {
      const permission = role?.permissions.find(p => p.name === resource);
      permissions[resource] = {
        create: permission?.create || false,
        read: permission?.read || true,
        update: permission?.update || false,
        delete: permission?.delete || false,
      };
    });
    
    return permissions;
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: editRole?.name || "",
      description: editRole?.description || "",
      permissions: getDefaultPermissions(editRole),
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    
    try {
      // Transform the permissions object back to an array format
      const transformedPermissions: Permission[] = Object.entries(values.permissions).map(([name, perms]) => ({
        name,
        ...perms
      }));
      
      const roleData = {
        name: values.name,
        description: values.description,
        permissions: transformedPermissions,
      };
      
      // For now, we're just simulating the API call as there's no actual endpoint yet
      // In a real app, you would make a POST or PATCH request to your API
      /*
      if (editRole?.id) {
        await apiRequest("PATCH", `/api/roles/${editRole.id}`, roleData);
        toast({
          title: "Role updated",
          description: "The role has been updated successfully",
        });
      } else {
        await apiRequest("POST", "/api/roles", roleData);
        toast({
          title: "Role created",
          description: "The role has been created successfully",
        });
      }
      */

      // Simulate API call success
      setTimeout(() => {
        toast({
          title: editRole ? "Role updated" : "Role created",
          description: `The role has been ${editRole ? "updated" : "created"} successfully`,
        });
        
        // Create a complete role object to pass back to the parent
        const completeRole: Role = {
          ...roleData,
          id: editRole?.id || Math.floor(Math.random() * 1000) // Simulate an ID for new roles
        };
        
        onOpenChange(false);
        if (onSuccess) onSuccess(completeRole);
        setIsSubmitting(false);
      }, 1000);
      
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${editRole ? "update" : "create"} role. Please try again.`,
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editRole ? "Edit Role" : "Create New Role"}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Manager" {...field} />
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
                    <Textarea placeholder="Describe the role's responsibilities and access level" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div>
              <h3 className="text-lg font-medium mb-4">Permissions</h3>
              <div className="border rounded-md p-4 bg-gray-50">
                <div className="grid grid-cols-5 gap-4 mb-2 font-medium text-sm">
                  <div>Resource</div>
                  <div className="text-center">Create</div>
                  <div className="text-center">Read</div>
                  <div className="text-center">Update</div>
                  <div className="text-center">Delete</div>
                </div>
                
                <div className="space-y-4">
                  {permissionResources.map((resource) => (
                    <div key={resource} className="grid grid-cols-5 gap-4 items-center py-2 border-t">
                      <div className="font-medium">{resource}</div>
                      
                      <FormField
                        control={form.control}
                        name={`permissions.${resource}.create`}
                        render={({ field }) => (
                          <FormItem className="flex justify-center">
                            <FormControl>
                              <Checkbox 
                                checked={field.value} 
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name={`permissions.${resource}.read`}
                        render={({ field }) => (
                          <FormItem className="flex justify-center">
                            <FormControl>
                              <Checkbox 
                                checked={field.value} 
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name={`permissions.${resource}.update`}
                        render={({ field }) => (
                          <FormItem className="flex justify-center">
                            <FormControl>
                              <Checkbox 
                                checked={field.value} 
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name={`permissions.${resource}.delete`}
                        render={({ field }) => (
                          <FormItem className="flex justify-center">
                            <FormControl>
                              <Checkbox 
                                checked={field.value} 
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <DialogFooter className="flex space-x-2 justify-end">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editRole ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>{editRole ? "Update Role" : "Create Role"}</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}