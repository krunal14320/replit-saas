
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { sql } from 'drizzle-orm';
import { z } from 'zod';

// Users table
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  roleId: integer("role_id"),
  tenantId: integer("tenant_id"),
  status: text("status", { enum: ["active", "inactive", "pending"] }).default("active"),
  fullName: text("full_name"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const insertUserSchema = createInsertSchema(users, {
  email: z.string().email(),
  password: z.string().min(6),
}).omit({ id: true, createdAt: true });

export const updateUserSchema = createInsertSchema(users, {
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
}).partial().omit({ id: true, createdAt: true });

// Tenants table
export const tenants = sqliteTable("tenants", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  domain: text("domain"),
  planId: integer("plan_id"),
  status: text("status", { enum: ["active", "inactive", "trial"] }).default("active"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const insertTenantSchema = createInsertSchema(tenants).omit({ 
  id: true,
  createdAt: true 
});

export const updateTenantSchema = createInsertSchema(tenants).partial().omit({ 
  id: true,
  createdAt: true 
});

// Plans table
export const plans = sqliteTable("plans", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  price: real("price").notNull(),
  billingCycle: text("billing_cycle", { enum: ["monthly", "yearly"] }).default("monthly"),
  features: text("features"), // Stored as JSON string
});

export const insertPlanSchema = createInsertSchema(plans).extend({
  features: z.array(z.string()).transform(val => JSON.stringify(val))
}).omit({ 
  id: true 
});

// Subscriptions table
export const subscriptions = sqliteTable("subscriptions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  tenantId: integer("tenant_id").notNull(),
  planId: integer("plan_id").notNull(),
  status: text("status", { enum: ["active", "inactive", "pending", "cancelled"] }).default("active"),
  startDate: text("start_date").default(sql`CURRENT_TIMESTAMP`),
  endDate: text("end_date"),
  renewalDate: text("renewal_date"),
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({ 
  id: true 
});

export const updateSubscriptionSchema = createInsertSchema(subscriptions).partial().omit({ 
  id: true 
});

// Activities table
export const activities = sqliteTable("activities", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id"),
  action: text("action").notNull(),
  entityType: text("entity_type"),
  entityId: integer("entity_id"),
  details: text("details"), // Stored as JSON string
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const insertActivitySchema = createInsertSchema(activities).extend({
  details: z.record(z.any()).optional().transform(val => val ? JSON.stringify(val) : null)
}).omit({ 
  id: true,
  createdAt: true 
});

// Permissions table
export const permissions = sqliteTable("permissions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  description: text("description"),
});

export const insertPermissionSchema = createInsertSchema(permissions).omit({ 
  id: true 
});

// Settings table
export const settings = sqliteTable("settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  tenantId: integer("tenant_id"),
  key: text("key").notNull(),
  value: text("value"),
});

export const insertSettingSchema = createInsertSchema(settings).omit({
  id: true
});

// Roles table
export const roles = sqliteTable("roles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  description: text("description"),
  permissions: text("permissions").notNull(), // Stored as JSON string
});

export const insertRoleSchema = createInsertSchema(roles).extend({
  permissions: z.array(z.object({
    name: z.string(),
    create: z.boolean(),
    read: z.boolean(),
    update: z.boolean(),
    delete: z.boolean()
  })).transform(val => JSON.stringify(val))
}).omit({
  id: true
});

export const updateRoleSchema = createInsertSchema(roles).extend({
  permissions: z.array(z.object({
    name: z.string(),
    create: z.boolean(),
    read: z.boolean(),
    update: z.boolean(),
    delete: z.boolean()
  })).transform(val => JSON.stringify(val))
}).partial().omit({
  id: true
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;

export type Tenant = typeof tenants.$inferSelect;
export type InsertTenant = z.infer<typeof insertTenantSchema>;
export type UpdateTenant = z.infer<typeof updateTenantSchema>;

export type Plan = typeof plans.$inferSelect;
export type InsertPlan = z.infer<typeof insertPlanSchema>;

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type UpdateSubscription = z.infer<typeof updateSubscriptionSchema>;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

export type Setting = typeof settings.$inferSelect;
export type InsertSetting = z.infer<typeof insertSettingSchema>;

export type Role = typeof roles.$inferSelect;
export type InsertRole = z.infer<typeof insertRoleSchema>;
export type UpdateRole = z.infer<typeof updateRoleSchema>;

export type Permission = typeof permissions.$inferSelect;
export type InsertPermission = z.infer<typeof insertPermissionSchema>;

// Enum for permission operations
export enum PermissionOperation {
  CREATE = "create",
  READ = "read",
  UPDATE = "update",
  DELETE = "delete"
}
