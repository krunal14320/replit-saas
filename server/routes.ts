import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { hashPassword } from "./auth";
import { 
  insertUserSchema, 
  insertTenantSchema, 
  insertPlanSchema, 
  insertSubscriptionSchema,
  insertSettingSchema
} from "@shared/schema";

// Middleware to ensure user is authenticated
function ensureAuthenticated(req: any, res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}

// Middleware to ensure user has admin role
function ensureAdmin(req: any, res: any, next: any) {
  if (req.isAuthenticated() && req.user.role === 'admin') {
    return next();
  }
  res.status(403).json({ message: "Forbidden: Admin role required" });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  setupAuth(app);

  // User routes
  app.get("/api/users", ensureAuthenticated, async (req, res) => {
    try {
      const users = await storage.getUsers();
      res.json(users.map(user => ({ ...user, password: undefined })));
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/users/:id", ensureAuthenticated, async (req, res) => {
    try {
      const user = await storage.getUser(parseInt(req.params.id));
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ ...user, password: undefined });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.post("/api/users", ensureAdmin, async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check for existing username or email
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
      
      // Hash password
      const user = await storage.createUser({
        ...userData,
        password: await hashPassword(userData.password),
      });
      
      await storage.createActivity({
        userId: req.user.id,
        tenantId: req.user.tenantId,
        action: "user.created",
        description: `User ${user.username} was created by ${req.user.username}`
      });
      
      res.status(201).json({ ...user, password: undefined });
    } catch (error) {
      res.status(400).json({ message: "Invalid user data", error: error.message });
    }
  });

  app.patch("/api/users/:id", ensureAuthenticated, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Only admins can update other users
      if (req.user.id !== userId && req.user.role !== 'admin') {
        return res.status(403).json({ message: "Forbidden: You can only update your own account" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Handle password update separately to hash it
      let updateData: any = { ...req.body };
      if (updateData.password) {
        updateData.password = await hashPassword(updateData.password);
      }
      
      // Prevent role change unless admin
      if (req.user.role !== 'admin' && updateData.role) {
        delete updateData.role;
      }
      
      const updatedUser = await storage.updateUser(userId, updateData);
      
      await storage.createActivity({
        userId: req.user.id,
        tenantId: req.user.tenantId,
        action: "user.updated",
        description: `User ${user.username} was updated by ${req.user.username}`
      });
      
      res.json({ ...updatedUser, password: undefined });
    } catch (error) {
      res.status(400).json({ message: "Failed to update user", error: error.message });
    }
  });

  app.delete("/api/users/:id", ensureAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Prevent deleting self
      if (req.user.id === userId) {
        return res.status(400).json({ message: "Cannot delete your own account" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      await storage.deleteUser(userId);
      
      await storage.createActivity({
        userId: req.user.id,
        tenantId: req.user.tenantId,
        action: "user.deleted",
        description: `User ${user.username} was deleted by ${req.user.username}`
      });
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Tenant routes
  app.get("/api/tenants", ensureAuthenticated, async (req, res) => {
    try {
      const tenants = await storage.getTenants();
      res.json(tenants);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tenants" });
    }
  });

  app.get("/api/tenants/:id", ensureAuthenticated, async (req, res) => {
    try {
      const tenant = await storage.getTenant(parseInt(req.params.id));
      if (!tenant) {
        return res.status(404).json({ message: "Tenant not found" });
      }
      res.json(tenant);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tenant" });
    }
  });

  app.post("/api/tenants", ensureAdmin, async (req, res) => {
    try {
      const tenantData = insertTenantSchema.parse(req.body);
      
      // Check for existing name or domain
      const existingName = await storage.getTenantByName(tenantData.name);
      if (existingName) {
        return res.status(400).json({ message: "Tenant name already exists" });
      }
      
      const existingDomain = await storage.getTenantByDomain(tenantData.domain);
      if (existingDomain) {
        return res.status(400).json({ message: "Tenant domain already exists" });
      }
      
      const tenant = await storage.createTenant(tenantData);
      
      await storage.createActivity({
        userId: req.user.id,
        tenantId: tenant.id,
        action: "tenant.created",
        description: `Tenant ${tenant.name} was created by ${req.user.username}`
      });
      
      res.status(201).json(tenant);
    } catch (error) {
      res.status(400).json({ message: "Invalid tenant data", error: error.message });
    }
  });

  app.patch("/api/tenants/:id", ensureAdmin, async (req, res) => {
    try {
      const tenantId = parseInt(req.params.id);
      const tenant = await storage.getTenant(tenantId);
      
      if (!tenant) {
        return res.status(404).json({ message: "Tenant not found" });
      }
      
      const updatedTenant = await storage.updateTenant(tenantId, req.body);
      
      await storage.createActivity({
        userId: req.user.id,
        tenantId: tenant.id,
        action: "tenant.updated",
        description: `Tenant ${tenant.name} was updated by ${req.user.username}`
      });
      
      res.json(updatedTenant);
    } catch (error) {
      res.status(400).json({ message: "Failed to update tenant", error: error.message });
    }
  });

  app.delete("/api/tenants/:id", ensureAdmin, async (req, res) => {
    try {
      const tenantId = parseInt(req.params.id);
      const tenant = await storage.getTenant(tenantId);
      
      if (!tenant) {
        return res.status(404).json({ message: "Tenant not found" });
      }
      
      // Check if there are users in this tenant
      const users = await storage.getUsersByTenant(tenantId);
      if (users.length > 0) {
        return res.status(400).json({ message: "Cannot delete tenant with active users" });
      }
      
      await storage.deleteTenant(tenantId);
      
      await storage.createActivity({
        userId: req.user.id,
        tenantId: null,
        action: "tenant.deleted",
        description: `Tenant ${tenant.name} was deleted by ${req.user.username}`
      });
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete tenant" });
    }
  });

  // Plan routes
  app.get("/api/plans", ensureAuthenticated, async (req, res) => {
    try {
      const plans = await storage.getPlans();
      res.json(plans);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch plans" });
    }
  });

  app.get("/api/plans/:id", ensureAuthenticated, async (req, res) => {
    try {
      const plan = await storage.getPlan(parseInt(req.params.id));
      if (!plan) {
        return res.status(404).json({ message: "Plan not found" });
      }
      res.json(plan);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch plan" });
    }
  });

  app.post("/api/plans", ensureAdmin, async (req, res) => {
    try {
      const planData = insertPlanSchema.parse(req.body);
      const plan = await storage.createPlan(planData);
      
      await storage.createActivity({
        userId: req.user.id,
        tenantId: null,
        action: "plan.created",
        description: `Plan ${plan.name} was created by ${req.user.username}`
      });
      
      res.status(201).json(plan);
    } catch (error) {
      res.status(400).json({ message: "Invalid plan data", error: error.message });
    }
  });

  app.patch("/api/plans/:id", ensureAdmin, async (req, res) => {
    try {
      const planId = parseInt(req.params.id);
      const plan = await storage.getPlan(planId);
      
      if (!plan) {
        return res.status(404).json({ message: "Plan not found" });
      }
      
      const updatedPlan = await storage.updatePlan(planId, req.body);
      
      await storage.createActivity({
        userId: req.user.id,
        tenantId: null,
        action: "plan.updated",
        description: `Plan ${plan.name} was updated by ${req.user.username}`
      });
      
      res.json(updatedPlan);
    } catch (error) {
      res.status(400).json({ message: "Failed to update plan", error: error.message });
    }
  });

  app.delete("/api/plans/:id", ensureAdmin, async (req, res) => {
    try {
      const planId = parseInt(req.params.id);
      const plan = await storage.getPlan(planId);
      
      if (!plan) {
        return res.status(404).json({ message: "Plan not found" });
      }
      
      await storage.deletePlan(planId);
      
      await storage.createActivity({
        userId: req.user.id,
        tenantId: null,
        action: "plan.deleted",
        description: `Plan ${plan.name} was deleted by ${req.user.username}`
      });
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete plan" });
    }
  });

  // Subscription routes
  app.get("/api/subscriptions", ensureAuthenticated, async (req, res) => {
    try {
      const tenantId = req.query.tenantId ? parseInt(req.query.tenantId as string) : null;
      
      let subscriptions;
      if (tenantId) {
        subscriptions = await storage.getSubscriptionsByTenant(tenantId);
      } else {
        // Get all subscriptions
        // TODO: Add pagination
        subscriptions = Array.from(Array(100).keys()).map(i => {
          return storage.getSubscription(i + 1);
        }).filter(Boolean);
      }
      
      res.json(subscriptions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch subscriptions" });
    }
  });

  app.get("/api/subscriptions/:id", ensureAuthenticated, async (req, res) => {
    try {
      const subscription = await storage.getSubscription(parseInt(req.params.id));
      if (!subscription) {
        return res.status(404).json({ message: "Subscription not found" });
      }
      res.json(subscription);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch subscription" });
    }
  });

  app.post("/api/subscriptions", ensureAdmin, async (req, res) => {
    try {
      const subscriptionData = insertSubscriptionSchema.parse(req.body);
      
      // Verify tenant exists
      const tenant = await storage.getTenant(subscriptionData.tenantId);
      if (!tenant) {
        return res.status(400).json({ message: "Tenant not found" });
      }
      
      // Verify plan exists
      const plan = await storage.getPlan(subscriptionData.planId);
      if (!plan) {
        return res.status(400).json({ message: "Plan not found" });
      }
      
      const subscription = await storage.createSubscription(subscriptionData);
      
      await storage.createActivity({
        userId: req.user.id,
        tenantId: subscription.tenantId,
        action: "subscription.created",
        description: `Subscription to ${plan.name} was created for ${tenant.name} by ${req.user.username}`
      });
      
      res.status(201).json(subscription);
    } catch (error) {
      res.status(400).json({ message: "Invalid subscription data", error: error.message });
    }
  });

  app.patch("/api/subscriptions/:id", ensureAdmin, async (req, res) => {
    try {
      const subscriptionId = parseInt(req.params.id);
      const subscription = await storage.getSubscription(subscriptionId);
      
      if (!subscription) {
        return res.status(404).json({ message: "Subscription not found" });
      }
      
      const updatedSubscription = await storage.updateSubscription(subscriptionId, req.body);
      
      await storage.createActivity({
        userId: req.user.id,
        tenantId: subscription.tenantId,
        action: "subscription.updated",
        description: `Subscription #${subscription.id} was updated by ${req.user.username}`
      });
      
      res.json(updatedSubscription);
    } catch (error) {
      res.status(400).json({ message: "Failed to update subscription", error: error.message });
    }
  });

  app.delete("/api/subscriptions/:id", ensureAdmin, async (req, res) => {
    try {
      const subscriptionId = parseInt(req.params.id);
      const subscription = await storage.getSubscription(subscriptionId);
      
      if (!subscription) {
        return res.status(404).json({ message: "Subscription not found" });
      }
      
      await storage.deleteSubscription(subscriptionId);
      
      await storage.createActivity({
        userId: req.user.id,
        tenantId: subscription.tenantId,
        action: "subscription.deleted",
        description: `Subscription #${subscription.id} was deleted by ${req.user.username}`
      });
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete subscription" });
    }
  });

  // Activity routes
  app.get("/api/activities", ensureAuthenticated, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const activities = await storage.getActivities(limit);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  // Settings routes
  app.get("/api/settings", ensureAuthenticated, async (req, res) => {
    try {
      const tenantId = req.query.tenantId ? parseInt(req.query.tenantId as string) : null;
      let settings;
      
      if (tenantId) {
        settings = await storage.getSettingsByTenant(tenantId);
      } else {
        // Get global settings (tenantId = null)
        settings = await storage.getSettingsByTenant(null);
      }
      
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.post("/api/settings", ensureAdmin, async (req, res) => {
    try {
      const settingData = insertSettingSchema.parse(req.body);
      
      // Check if setting already exists
      const existingSetting = await storage.getSettingByKey(settingData.key, settingData.tenantId);
      if (existingSetting) {
        const updated = await storage.updateSetting(existingSetting.id, { value: settingData.value });
        return res.json(updated);
      }
      
      const setting = await storage.createSetting(settingData);
      
      await storage.createActivity({
        userId: req.user.id,
        tenantId: setting.tenantId,
        action: "setting.created",
        description: `Setting ${setting.key} was created by ${req.user.username}`
      });
      
      res.status(201).json(setting);
    } catch (error) {
      res.status(400).json({ message: "Invalid setting data", error: error.message });
    }
  });

  // Dashboard stats route
  app.get("/api/dashboard/stats", ensureAuthenticated, async (req, res) => {
    try {
      const [users, tenants, plans, activities] = await Promise.all([
        storage.getUsers(),
        storage.getTenants(),
        storage.getPlans(),
        storage.getActivities(10)
      ]);
      
      // Calculate simple stats
      const stats = {
        totalUsers: users.length,
        activeUsers: users.filter(u => u.status === 'active').length,
        totalTenants: tenants.length,
        activeTenants: tenants.filter(t => t.status === 'active').length,
        totalPlans: plans.length,
        recentActivities: activities
      };
      
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
