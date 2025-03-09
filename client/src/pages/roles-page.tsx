import { useState } from "react";
import { Sidebar } from "@/components/ui/sidebar";
import { TopNavbar } from "@/components/ui/top-navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Shield, Edit, Trash } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

// This is a simplified RBAC page as the backend doesn't have full RBAC capabilities yet
export default function RolesPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  
  const rolePermissions = [
    {
      role: "admin",
      description: "Full system access",
      permissions: [
        { name: "Users", create: true, read: true, update: true, delete: true },
        { name: "Tenants", create: true, read: true, update: true, delete: true },
        { name: "Subscriptions", create: true, read: true, update: true, delete: true },
        { name: "Settings", create: true, read: true, update: true, delete: true },
      ]
    },
    {
      role: "editor",
      description: "Can edit most resources but cannot delete",
      permissions: [
        { name: "Users", create: true, read: true, update: true, delete: false },
        { name: "Tenants", create: false, read: true, update: true, delete: false },
        { name: "Subscriptions", create: false, read: true, update: true, delete: false },
        { name: "Settings", create: false, read: true, update: true, delete: false },
      ]
    },
    {
      role: "user",
      description: "Basic user with limited permissions",
      permissions: [
        { name: "Users", create: false, read: true, update: false, delete: false },
        { name: "Tenants", create: false, read: true, update: false, delete: false },
        { name: "Subscriptions", create: false, read: true, update: false, delete: false },
        { name: "Settings", create: false, read: true, update: false, delete: false },
      ]
    }
  ];

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
                    <Button disabled>
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
                      <TableRow key={role.role}>
                        <TableCell className="font-medium flex items-center">
                          <Shield className="h-4 w-4 mr-2 text-blue-500" />
                          <span className="capitalize">{role.role}</span>
                        </TableCell>
                        <TableCell>{role.description}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="ghost" size="sm" disabled={!isAdmin}>
                              <Edit className="h-4 w-4 mr-1" /> Edit
                            </Button>
                            <Button variant="ghost" size="sm" disabled={!isAdmin}>
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
                        <TableHead>Admin</TableHead>
                        <TableHead>Editor</TableHead>
                        <TableHead>User</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rolePermissions[0].permissions.map((permission) => (
                        <>
                          <TableRow key={`${permission.name}-create`}>
                            <TableCell rowSpan={4} className="font-medium">{permission.name}</TableCell>
                            <TableCell>Create</TableCell>
                            <TableCell>{rolePermissions[0].permissions.find(p => p.name === permission.name)?.create ? "✓" : "✗"}</TableCell>
                            <TableCell>{rolePermissions[1].permissions.find(p => p.name === permission.name)?.create ? "✓" : "✗"}</TableCell>
                            <TableCell>{rolePermissions[2].permissions.find(p => p.name === permission.name)?.create ? "✓" : "✗"}</TableCell>
                          </TableRow>
                          <TableRow key={`${permission.name}-read`}>
                            <TableCell>Read</TableCell>
                            <TableCell>{rolePermissions[0].permissions.find(p => p.name === permission.name)?.read ? "✓" : "✗"}</TableCell>
                            <TableCell>{rolePermissions[1].permissions.find(p => p.name === permission.name)?.read ? "✓" : "✗"}</TableCell>
                            <TableCell>{rolePermissions[2].permissions.find(p => p.name === permission.name)?.read ? "✓" : "✗"}</TableCell>
                          </TableRow>
                          <TableRow key={`${permission.name}-update`}>
                            <TableCell>Update</TableCell>
                            <TableCell>{rolePermissions[0].permissions.find(p => p.name === permission.name)?.update ? "✓" : "✗"}</TableCell>
                            <TableCell>{rolePermissions[1].permissions.find(p => p.name === permission.name)?.update ? "✓" : "✗"}</TableCell>
                            <TableCell>{rolePermissions[2].permissions.find(p => p.name === permission.name)?.update ? "✓" : "✗"}</TableCell>
                          </TableRow>
                          <TableRow key={`${permission.name}-delete`}>
                            <TableCell>Delete</TableCell>
                            <TableCell>{rolePermissions[0].permissions.find(p => p.name === permission.name)?.delete ? "✓" : "✗"}</TableCell>
                            <TableCell>{rolePermissions[1].permissions.find(p => p.name === permission.name)?.delete ? "✓" : "✗"}</TableCell>
                            <TableCell>{rolePermissions[2].permissions.find(p => p.name === permission.name)?.delete ? "✓" : "✗"}</TableCell>
                          </TableRow>
                        </>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
