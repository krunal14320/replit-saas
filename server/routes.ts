
import express from "express";
import http from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { eq, sql } from "drizzle-orm";
import { PermissionOperation, Role, Permission, User } from "@shared/schema";

// Authentication middleware
const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

export async function registerRoutes(app: express.Express) {
  const server = http.createServer(app);

  // Auth routes are registered by setupAuth function
  setupAuth(app);

  app.get("/api/users", requireAuth, async (req, res) => {
    try {
      const allUsers = await storage.listUsers();
      res.json(allUsers);
    } catch (e) {
      res.status(500).json({ message: "Error fetching users" });
    }
  });

  app.get("/api/users/:id", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(Number(req.params.id));
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (e) {
      res.status(500).json({ message: "Error fetching user" });
    }
  });

  app.post("/api/users", requireAuth, async (req, res) => {
    try {
      const result = await storage.createUser(req.body);
      res.json(result);
    } catch (e) {
      res.status(500).json({ message: "Error creating user" });
    }
  });

  app.put("/api/users/:id", requireAuth, async (req, res) => {
    try {
      const result = await storage.updateUser(Number(req.params.id), req.body);
      res.json(result);
    } catch (e) {
      res.status(500).json({ message: "Error updating user" });
    }
  });

  app.delete("/api/users/:id", requireAuth, async (req, res) => {
    try {
      await storage.deleteUser(Number(req.params.id));
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ message: "Error deleting user" });
    }
  });

  app.get("/api/roles", requireAuth, async (req, res) => {
    try {
      const allRoles = await storage.listRoles();
      res.json(allRoles);
    } catch (e) {
      res.status(500).json({ message: "Error fetching roles" });
    }
  });

  app.get("/api/roles/:id", requireAuth, async (req, res) => {
    try {
      const role = await storage.getRole(Number(req.params.id));
      if (!role) {
        return res.status(404).json({ message: "Role not found" });
      }
      res.json(role);
    } catch (e) {
      res.status(500).json({ message: "Error fetching role" });
    }
  });

  app.post("/api/roles", requireAuth, async (req, res) => {
    try {
      const result = await storage.createRole(req.body);
      res.json(result);
    } catch (e) {
      res.status(500).json({ message: "Error creating role" });
    }
  });

  app.put("/api/roles/:id", requireAuth, async (req, res) => {
    try {
      const result = await storage.updateRole(Number(req.params.id), req.body);
      res.json(result);
    } catch (e) {
      res.status(500).json({ message: "Error updating role" });
    }
  });

  app.delete("/api/roles/:id", requireAuth, async (req, res) => {
    try {
      await storage.deleteRole(Number(req.params.id));
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ message: "Error deleting role" });
    }
  });

  // Permission routes can be implemented when corresponding storage methods are available

  app.get("/api/tenants", requireAuth, async (req, res) => {
    try {
      const allTenants = await storage.listTenants();
      res.json(allTenants);
    } catch (e) {
      res.status(500).json({ message: "Error fetching tenants" });
    }
  });

  app.get("/api/tenants/:id", requireAuth, async (req, res) => {
    try {
      const tenant = await storage.getTenant(Number(req.params.id));
      if (!tenant) {
        return res.status(404).json({ message: "Tenant not found" });
      }
      res.json(tenant);
    } catch (e) {
      res.status(500).json({ message: "Error fetching tenant" });
    }
  });

  app.post("/api/tenants", requireAuth, async (req, res) => {
    try {
      const result = await storage.createTenant(req.body);
      res.json(result);
    } catch (e) {
      res.status(500).json({ message: "Error creating tenant" });
    }
  });

  app.put("/api/tenants/:id", requireAuth, async (req, res) => {
    try {
      const result = await storage.updateTenant(Number(req.params.id), req.body);
      res.json(result);
    } catch (e) {
      res.status(500).json({ message: "Error updating tenant" });
    }
  });

  app.delete("/api/tenants/:id", requireAuth, async (req, res) => {
    try {
      await storage.deleteTenant(Number(req.params.id));
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ message: "Error deleting tenant" });
    }
  });

  app.get("/api/subscriptions", requireAuth, async (req, res) => {
    try {
      const allSubscriptions = await storage.listSubscriptions();
      res.json(allSubscriptions);
    } catch (e) {
      res.status(500).json({ message: "Error fetching subscriptions" });
    }
  });

  app.get("/api/subscriptions/:id", requireAuth, async (req, res) => {
    try {
      const subscription = await storage.getSubscription(Number(req.params.id));
      if (!subscription) {
        return res.status(404).json({ message: "Subscription not found" });
      }
      res.json(subscription);
    } catch (e) {
      res.status(500).json({ message: "Error fetching subscription" });
    }
  });

  app.post("/api/subscriptions", requireAuth, async (req, res) => {
    try {
      const result = await storage.createSubscription(req.body);
      res.json(result);
    } catch (e) {
      res.status(500).json({ message: "Error creating subscription" });
    }
  });

  app.put("/api/subscriptions/:id", requireAuth, async (req, res) => {
    try {
      const result = await storage.updateSubscription(Number(req.params.id), req.body);
      res.json(result);
    } catch (e) {
      res.status(500).json({ message: "Error updating subscription" });
    }
  });

  app.delete("/api/subscriptions/:id", requireAuth, async (req, res) => {
    try {
      await storage.deleteSubscription(Number(req.params.id));
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ message: "Error deleting subscription" });
    }
  });

  return server;
}
