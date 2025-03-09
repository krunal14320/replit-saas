
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import BetterSqlite3Session from "better-sqlite3-session";
import path from "path";
import * as schema from "../shared/schema";

const sqlite = new Database("data.db");
const db = drizzle(sqlite, { schema });

// Create session store
const SqliteStore = BetterSqlite3Session();
const sessionStore = new SqliteStore({
  client: sqlite,
  expired: {
    clear: true,
    intervalMs: 900000 //ms = 15min
  }
});

class Storage {
  sessionStore = sessionStore;

  async getUser(id: number) {
    const users = await db.select().from(schema.users).where(schema.eq(schema.users.id, id));
    return users[0] || null;
  }

  async getUserByUsername(username: string) {
    const users = await db.select().from(schema.users).where(schema.eq(schema.users.username, username));
    return users[0] || null;
  }

  async getUserByEmail(email: string) {
    const users = await db.select().from(schema.users).where(schema.eq(schema.users.email, email));
    return users[0] || null;
  }

  async createUser(user: Omit<schema.InsertUser, "id">) {
    const result = await db.insert(schema.users).values(user).returning();
    return result[0];
  }

  async listUsers() {
    return await db.select().from(schema.users);
  }

  async updateUser(id: number, user: Partial<schema.UpdateUser>) {
    const result = await db.update(schema.users)
      .set(user)
      .where(schema.eq(schema.users.id, id))
      .returning();
    return result[0];
  }

  async deleteUser(id: number) {
    await db.delete(schema.users).where(schema.eq(schema.users.id, id));
  }

  async listRoles() {
    return await db.select().from(schema.roles);
  }

  async getRole(id: number) {
    const roles = await db.select().from(schema.roles).where(schema.eq(schema.roles.id, id));
    return roles[0] || null;
  }

  async createRole(role: Omit<schema.InsertRole, "id">) {
    const result = await db.insert(schema.roles).values(role).returning();
    return result[0];
  }

  async updateRole(id: number, role: Partial<schema.UpdateRole>) {
    const result = await db.update(schema.roles)
      .set(role)
      .where(schema.eq(schema.roles.id, id))
      .returning();
    return result[0];
  }

  async deleteRole(id: number) {
    await db.delete(schema.roles).where(schema.eq(schema.roles.id, id));
  }

  async createActivity(activity: Omit<schema.InsertActivity, "id" | "createdAt">) {
    const activityWithTimestamp = {
      ...activity,
      createdAt: new Date(),
    };
    const result = await db.insert(schema.activities).values(activityWithTimestamp).returning();
    return result[0];
  }

  async listActivities(limit = 50) {
    return await db.select()
      .from(schema.activities)
      .orderBy(schema.desc(schema.activities.createdAt))
      .limit(limit);
  }

  async listTenants() {
    return await db.select().from(schema.tenants);
  }

  async getTenant(id: number) {
    const tenants = await db.select().from(schema.tenants).where(schema.eq(schema.tenants.id, id));
    return tenants[0] || null;
  }

  async createTenant(tenant: Omit<schema.InsertTenant, "id">) {
    const result = await db.insert(schema.tenants).values(tenant).returning();
    return result[0];
  }

  async updateTenant(id: number, tenant: Partial<schema.UpdateTenant>) {
    const result = await db.update(schema.tenants)
      .set(tenant)
      .where(schema.eq(schema.tenants.id, id))
      .returning();
    return result[0];
  }

  async deleteTenant(id: number) {
    await db.delete(schema.tenants).where(schema.eq(schema.tenants.id, id));
  }

  async listSubscriptions() {
    return await db.select().from(schema.subscriptions);
  }

  async getSubscription(id: number) {
    const subscriptions = await db.select().from(schema.subscriptions).where(schema.eq(schema.subscriptions.id, id));
    return subscriptions[0] || null;
  }

  async createSubscription(subscription: Omit<schema.InsertSubscription, "id">) {
    const result = await db.insert(schema.subscriptions).values(subscription).returning();
    return result[0];
  }

  async updateSubscription(id: number, subscription: Partial<schema.UpdateSubscription>) {
    const result = await db.update(schema.subscriptions)
      .set(subscription)
      .where(schema.eq(schema.subscriptions.id, id))
      .returning();
    return result[0];
  }

  async deleteSubscription(id: number) {
    await db.delete(schema.subscriptions).where(schema.eq(schema.subscriptions.id, id));
  }
}

// Export the storage instance
export const storage = new Storage();

// Run migrations
migrate(db, { migrationsFolder: path.join(__dirname, "../drizzle") });
