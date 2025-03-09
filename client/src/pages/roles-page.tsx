import { useState } from "react";
import { Sidebar } from "@/components/ui/sidebar";
import { TopNavbar } from "@/components/ui/top-navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Shield, Edit, Trash, AlertTriangle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { RoleForm, Role, Permission } from "@/components/role/role-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

// This is a simplified RBAC page as the backend doesn't have full RBAC capabilities yet
export default function RolesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const isAdmin = user?.role === "admin";
  
  const [roleFormOpen, setRoleFormOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | undefined>(undefined);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingRole, setDeletingRole] = useState<Role | undefined>(undefined);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // We'll use state to manage the roles data
  const [rolePermissions, setRolePermissions] = useState<Role[]>([
    {
      name: "admin",
      description: "Full system access",
      permissions: [
        { name: "Users", create: true, read: true, update: true, delete: true },
        { name: "Tenants", create: true, read: true, update: true, delete: true },
        { name: "Subscriptions", create: true, read: true, update: true, delete: true },
        { name: "Settings", create: true, read: true, update: true, delete: true },
      ]
    },
    {
      name: "editor",
      description: "Can edit most resources but cannot delete",
      permissions: [
        { name: "Users", create: true, read: true, update: true, delete: false },
        { name: "Tenants", create: false, read: true, update: true, delete: false },
        { name: "Subscriptions", create: false, read: true, update: true, delete: false },
        { name: "Settings", create: false, read: true, update: true, delete: false },
      ]
    },
    {
      name: "user",
      description: "Basic user with limited permissions",
      permissions: [
        { name: "Users", create: false, read: true, update: false, delete: false },
        { name: "Tenants", create: false, read: true, update: false, delete: false },
        { name: "Subscriptions", create: false, read: true, update: false, delete: false },
        { name: "Settings", create: false, read: true, update: false, delete: false },
      ]
    }
  ]);

  const handleCreateRole = () => {
    setEditingRole(undefined);
    setRoleFormOpen(true);
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setRoleFormOpen(true);
  };

  const handleDeleteRole = (role: Role) => {
    setDeletingRole(role);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!deletingRole) return;
    
    setIsDeleting(true);
    
    // Simulate API call
    setTimeout(() => {
      setRolePermissions(prev => prev.filter(role => role.name !== deletingRole.name));
      
      toast({
        title: "Role deleted",
        description: `The role "${deletingRole.name}" has been deleted successfully`,
      });
      
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setDeletingRole(undefined);
    }, 1000);
  };

  const handleRoleFormSuccess = () => {
    // Refresh the roles data (in a real app, you'd fetch from the API)
    // For now, we'll just close the form and show a success message
    setRoleFormOpen(false);
  };

  return (
    <div className="min-h-screen flex overflow-hidden bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavbar />
        
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-gray-900">Roles & Permissions</h1>
              <p className="mt-1 text-sm text-gray-500">Manage role-based access control for your organization.</p>
            </div>
            
            {/* Roles Overview */}
            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>System Roles</CardTitle>
                    <CardDescription>Overview of available roles and their descriptions</CardDescription>
                  </div>
                  {isAdmin && (
                    <Button onClick={handleCreateRole}>
                      Create Role
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Role Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rolePermissions.map((role) => (
                      <TableRow key={role.name}>
                        <TableCell className="font-medium flex items-center">
                          <Shield className="h-4 w-4 mr-2 text-blue-500" />
                          <span className="capitalize">{role.name}</span>
                        </TableCell>
                        <TableCell>{role.description}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              disabled={!isAdmin || role.name === "admin"} 
                              onClick={() => handleEditRole(role)}
                            >
                              <Edit className="h-4 w-4 mr-1" /> Edit
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              disabled={!isAdmin || role.name === "admin"} 
                              onClick={() => handleDeleteRole(role)}
                            >
                              <Trash className="h-4 w-4 mr-1" /> Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            
            {/* Permissions Matrix */}
            <Card>
              <CardHeader>
                <CardTitle>Permissions Matrix</CardTitle>
                <CardDescription>Detailed permissions for each role</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Resource</TableHead>
                        <TableHead>Permission</TableHead>
                        {rolePermissions.map(role => (
                          <TableHead key={role.name} className="capitalize">{role.name}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rolePermissions[0].permissions.map((permission) => (
                        <Fragment key={permission.name}>
                          <TableRow>
                            <TableCell rowSpan={4} className="font-medium">{permission.name}</TableCell>
                            <TableCell>Create</TableCell>
                            {rolePermissions.map(role => (
                              <TableCell key={`${role.name}-${permission.name}-create`}>
                                {role.permissions.find(p => p.name === permission.name)?.create ? "✓" : "✗"}
                              </TableCell>
                            ))}
                          </TableRow>
                          <TableRow>
                            <TableCell>Read</TableCell>
                            {rolePermissions.map(role => (
                              <TableCell key={`${role.name}-${permission.name}-read`}>
                                {role.permissions.find(p => p.name === permission.name)?.read ? "✓" : "✗"}
                              </TableCell>
                            ))}
                          </TableRow>
                          <TableRow>
                            <TableCell>Update</TableCell>
                            {rolePermissions.map(role => (
                              <TableCell key={`${role.name}-${permission.name}-update`}>
                                {role.permissions.find(p => p.name === permission.name)?.update ? "✓" : "✗"}
                              </TableCell>
                            ))}
                          </TableRow>
                          <TableRow>
                            <TableCell>Delete</TableCell>
                            {rolePermissions.map(role => (
                              <TableCell key={`${role.name}-${permission.name}-delete`}>
                                {role.permissions.find(p => p.name === permission.name)?.delete ? "✓" : "✗"}
                              </TableCell>
                            ))}
                          </TableRow>
                        </Fragment>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
      
      {/* Role Form Dialog */}
      <RoleForm 
        open={roleFormOpen} 
        onOpenChange={setRoleFormOpen}
        editRole={editingRole}
        onSuccess={handleRoleFormSuccess}
      />
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Role</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the "{deletingRole?.name}" role? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center p-4 border rounded-md bg-amber-50 border-amber-200 text-amber-700">
            <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
            <p className="text-sm">
              Users with this role will lose their permissions and may lose access to certain features.
            </p>
          </div>
          <DialogFooter className="flex space-x-2 justify-end">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              variant="destructive" 
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
