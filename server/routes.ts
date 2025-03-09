
import express from "express";
import http from "http";
import { db } from "./storage";
import { roles, users, tenants, subscriptions, permissions } from "./storage";
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
      const allUsers = await db.select().from(users);
      res.json(allUsers);
    } catch (e) {
      res.status(500).json({ message: "Error fetching users" });
    }
  });

  app.get("/api/users/:id", requireAuth, async (req, res) => {
    try {
      const user = await db.select().from(users).where(eq(users.id, Number(req.params.id)));
      if (user.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user[0]);
    } catch (e) {
      res.status(500).json({ message: "Error fetching user" });
    }
  });

  app.post("/api/users", requireAuth, async (req, res) => {
    try {
      const result = await db.insert(users).values(req.body).returning();
      res.json(result[0]);
    } catch (e) {
      res.status(500).json({ message: "Error creating user" });
    }
  });

  app.put("/api/users/:id", requireAuth, async (req, res) => {
    try {
      const result = await db.update(users)
        .set(req.body)
        .where(eq(users.id, Number(req.params.id)))
        .returning();
      res.json(result[0]);
    } catch (e) {
      res.status(500).json({ message: "Error updating user" });
    }
  });

  app.delete("/api/users/:id", requireAuth, async (req, res) => {
    try {
      await db.delete(users).where(eq(users.id, Number(req.params.id)));
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ message: "Error deleting user" });
    }
  });

  app.get("/api/roles", requireAuth, async (req, res) => {
    try {
      const allRoles = await db.select().from(roles);
      res.json(allRoles);
    } catch (e) {
      res.status(500).json({ message: "Error fetching roles" });
    }
  });

  app.get("/api/roles/:id", requireAuth, async (req, res) => {
    try {
      const role = await db.select().from(roles).where(eq(roles.id, Number(req.params.id)));
      if (role.length === 0) {
        return res.status(404).json({ message: "Role not found" });
      }
      res.json(role[0]);
    } catch (e) {
      res.status(500).json({ message: "Error fetching role" });
    }
  });

  app.post("/api/roles", requireAuth, async (req, res) => {
    try {
      const result = await db.insert(roles).values(req.body).returning();
      res.json(result[0]);
    } catch (e) {
      res.status(500).json({ message: "Error creating role" });
    }
  });

  app.put("/api/roles/:id", requireAuth, async (req, res) => {
    try {
      const result = await db.update(roles)
        .set(req.body)
        .where(eq(roles.id, Number(req.params.id)))
        .returning();
      res.json(result[0]);
    } catch (e) {
      res.status(500).json({ message: "Error updating role" });
    }
  });

  app.delete("/api/roles/:id", requireAuth, async (req, res) => {
    try {
      await db.delete(roles).where(eq(roles.id, Number(req.params.id)));
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ message: "Error deleting role" });
    }
  });

  app.get("/api/permissions", requireAuth, async (req, res) => {
    try {
      const allPermissions = await db.select().from(permissions);
      res.json(allPermissions);
    } catch (e) {
      res.status(500).json({ message: "Error fetching permissions" });
    }
  });

  app.get("/api/permissions/:id", requireAuth, async (req, res) => {
    try {
      const permission = await db.select().from(permissions).where(eq(permissions.id, Number(req.params.id)));
      if (permission.length === 0) {
        return res.status(404).json({ message: "Permission not found" });
      }
      res.json(permission[0]);
    } catch (e) {
      res.status(500).json({ message: "Error fetching permission" });
    }
  });

  app.post("/api/permissions", requireAuth, async (req, res) => {
    try {
      const result = await db.insert(permissions).values(req.body).returning();
      res.json(result[0]);
    } catch (e) {
      res.status(500).json({ message: "Error creating permission" });
    }
  });

  app.put("/api/permissions/:id", requireAuth, async (req, res) => {
    try {
      const result = await db.update(permissions)
        .set(req.body)
        .where(eq(permissions.id, Number(req.params.id)))
        .returning();
      res.json(result[0]);
    } catch (e) {
      res.status(500).json({ message: "Error updating permission" });
    }
  });

  app.delete("/api/permissions/:id", requireAuth, async (req, res) => {
    try {
      await db.delete(permissions).where(eq(permissions.id, Number(req.params.id)));
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ message: "Error deleting permission" });
    }
  });

  app.get("/api/tenants", requireAuth, async (req, res) => {
    try {
      const allTenants = await db.select().from(tenants);
      res.json(allTenants);
    } catch (e) {
      res.status(500).json({ message: "Error fetching tenants" });
    }
  });

  app.get("/api/tenants/:id", requireAuth, async (req, res) => {
    try {
      const tenant = await db.select().from(tenants).where(eq(tenants.id, Number(req.params.id)));
      if (tenant.length === 0) {
        return res.status(404).json({ message: "Tenant not found" });
      }
      res.json(tenant[0]);
    } catch (e) {
      res.status(500).json({ message: "Error fetching tenant" });
    }
  });

  app.post("/api/tenants", requireAuth, async (req, res) => {
    try {
      const result = await db.insert(tenants).values(req.body).returning();
      res.json(result[0]);
    } catch (e) {
      res.status(500).json({ message: "Error creating tenant" });
    }
  });

  app.put("/api/tenants/:id", requireAuth, async (req, res) => {
    try {
      const result = await db.update(tenants)
        .set(req.body)
        .where(eq(tenants.id, Number(req.params.id)))
        .returning();
      res.json(result[0]);
    } catch (e) {
      res.status(500).json({ message: "Error updating tenant" });
    }
  });

  app.delete("/api/tenants/:id", requireAuth, async (req, res) => {
    try {
      await db.delete(tenants).where(eq(tenants.id, Number(req.params.id)));
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ message: "Error deleting tenant" });
    }
  });

  app.get("/api/subscriptions", requireAuth, async (req, res) => {
    try {
      const allSubscriptions = await db.select().from(subscriptions);
      res.json(allSubscriptions);
    } catch (e) {
      res.status(500).json({ message: "Error fetching subscriptions" });
    }
  });

  app.get("/api/subscriptions/:id", requireAuth, async (req, res) => {
    try {
      const subscription = await db.select().from(subscriptions).where(eq(subscriptions.id, Number(req.params.id)));
      if (subscription.length === 0) {
        return res.status(404).json({ message: "Subscription not found" });
      }
      res.json(subscription[0]);
    } catch (e) {
      res.status(500).json({ message: "Error fetching subscription" });
    }
  });

  app.post("/api/subscriptions", requireAuth, async (req, res) => {
    try {
      const result = await db.insert(subscriptions).values(req.body).returning();
      res.json(result[0]);
    } catch (e) {
      res.status(500).json({ message: "Error creating subscription" });
    }
  });

  app.put("/api/subscriptions/:id", requireAuth, async (req, res) => {
    try {
      const result = await db.update(subscriptions)
        .set(req.body)
        .where(eq(subscriptions.id, Number(req.params.id)))
        .returning();
      res.json(result[0]);
    } catch (e) {
      res.status(500).json({ message: "Error updating subscription" });
    }
  });

  app.delete("/api/subscriptions/:id", requireAuth, async (req, res) => {
    try {
      await db.delete(subscriptions).where(eq(subscriptions.id, Number(req.params.id)));
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ message: "Error deleting subscription" });
    }
  });

  return server;
}
