import { 
  users, User, InsertUser, 
  tenants, Tenant, InsertTenant,
  plans, Plan, InsertPlan,
  subscriptions, Subscription, InsertSubscription,
  activities, Activity, InsertActivity,
  settings, Setting, InsertSetting
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// Storage interface for CRUD operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUsers(limit?: number, offset?: number): Promise<User[]>;
  getUsersByTenant(tenantId: number): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  
  // Tenant operations
  getTenant(id: number): Promise<Tenant | undefined>;
  getTenantByName(name: string): Promise<Tenant | undefined>;
  getTenantByDomain(domain: string): Promise<Tenant | undefined>;
  getTenants(limit?: number, offset?: number): Promise<Tenant[]>;
  createTenant(tenant: InsertTenant): Promise<Tenant>;
  updateTenant(id: number, tenant: Partial<InsertTenant>): Promise<Tenant | undefined>;
  deleteTenant(id: number): Promise<boolean>;
  
  // Plan operations
  getPlan(id: number): Promise<Plan | undefined>;
  getPlans(limit?: number, offset?: number): Promise<Plan[]>;
  createPlan(plan: InsertPlan): Promise<Plan>;
  updatePlan(id: number, plan: Partial<InsertPlan>): Promise<Plan | undefined>;
  deletePlan(id: number): Promise<boolean>;
  
  // Subscription operations
  getSubscription(id: number): Promise<Subscription | undefined>;
  getSubscriptionsByTenant(tenantId: number): Promise<Subscription[]>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  updateSubscription(id: number, subscription: Partial<InsertSubscription>): Promise<Subscription | undefined>;
  deleteSubscription(id: number): Promise<boolean>;
  
  // Activity operations
  getActivity(id: number): Promise<Activity | undefined>;
  getActivities(limit?: number, offset?: number): Promise<Activity[]>;
  getActivitiesByUser(userId: number): Promise<Activity[]>;
  getActivitiesByTenant(tenantId: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  
  // Settings operations
  getSetting(id: number): Promise<Setting | undefined>;
  getSettingByKey(key: string, tenantId?: number): Promise<Setting | undefined>;
  getSettingsByTenant(tenantId: number): Promise<Setting[]>;
  createSetting(setting: InsertSetting): Promise<Setting>;
  updateSetting(id: number, setting: Partial<InsertSetting>): Promise<Setting | undefined>;
  deleteSetting(id: number): Promise<boolean>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private usersData: Map<number, User>;
  private tenantsData: Map<number, Tenant>;
  private plansData: Map<number, Plan>;
  private subscriptionsData: Map<number, Subscription>;
  private activitiesData: Map<number, Activity>;
  private settingsData: Map<number, Setting>;
  
  sessionStore: session.SessionStore;
  
  private userIdCounter: number;
  private tenantIdCounter: number;
  private planIdCounter: number;
  private subscriptionIdCounter: number;
  private activityIdCounter: number;
  private settingIdCounter: number;

  constructor() {
    this.usersData = new Map();
    this.tenantsData = new Map();
    this.plansData = new Map();
    this.subscriptionsData = new Map();
    this.activitiesData = new Map();
    this.settingsData = new Map();
    
    this.userIdCounter = 1;
    this.tenantIdCounter = 1;
    this.planIdCounter = 1;
    this.subscriptionIdCounter = 1;
    this.activityIdCounter = 1;
    this.settingIdCounter = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });
    
    // Initialize with some demo data
    this.initializeDemoData();
  }
  
  private initializeDemoData() {
    // Create default admin user if there are no users
    if (this.usersData.size === 0) {
      const adminUser: User = {
        id: this.userIdCounter++,
        username: 'admin',
        password: 'admin_password_hash', // This should be properly hashed in production
        fullName: 'Admin User',
        email: 'admin@example.com',
        role: 'admin',
        tenantId: null,
        status: 'active',
        createdAt: new Date()
      };
      this.usersData.set(adminUser.id, adminUser);
      
      // Create a few plans
      const plans: Plan[] = [
        {
          id: this.planIdCounter++,
          name: 'Basic',
          description: 'Basic plan for small teams',
          price: 1999, // $19.99
          interval: 'month',
          status: 'active'
        },
        {
          id: this.planIdCounter++,
          name: 'Pro',
          description: 'Professional plan for growing businesses',
          price: 4999, // $49.99
          interval: 'month',
          status: 'active'
        },
        {
          id: this.planIdCounter++,
          name: 'Enterprise',
          description: 'Enterprise plan for large organizations',
          price: 9999, // $99.99
          interval: 'month',
          status: 'active'
        }
      ];
      
      plans.forEach(plan => this.plansData.set(plan.id, plan));
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.usersData.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.usersData.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.usersData.values()).find(
      (user) => user.email === email,
    );
  }
  
  async getUsers(limit: number = 100, offset: number = 0): Promise<User[]> {
    return Array.from(this.usersData.values())
      .sort((a, b) => a.id - b.id)
      .slice(offset, offset + limit);
  }
  
  async getUsersByTenant(tenantId: number): Promise<User[]> {
    return Array.from(this.usersData.values())
      .filter(user => user.tenantId === tenantId)
      .sort((a, b) => a.id - b.id);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date() 
    };
    this.usersData.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const existingUser = this.usersData.get(id);
    if (!existingUser) return undefined;
    
    const updatedUser = { ...existingUser, ...userData };
    this.usersData.set(id, updatedUser);
    return updatedUser;
  }
  
  async deleteUser(id: number): Promise<boolean> {
    return this.usersData.delete(id);
  }
  
  // Tenant methods
  async getTenant(id: number): Promise<Tenant | undefined> {
    return this.tenantsData.get(id);
  }
  
  async getTenantByName(name: string): Promise<Tenant | undefined> {
    return Array.from(this.tenantsData.values()).find(
      (tenant) => tenant.name === name,
    );
  }
  
  async getTenantByDomain(domain: string): Promise<Tenant | undefined> {
    return Array.from(this.tenantsData.values()).find(
      (tenant) => tenant.domain === domain,
    );
  }
  
  async getTenants(limit: number = 100, offset: number = 0): Promise<Tenant[]> {
    return Array.from(this.tenantsData.values())
      .sort((a, b) => a.id - b.id)
      .slice(offset, offset + limit);
  }
  
  async createTenant(insertTenant: InsertTenant): Promise<Tenant> {
    const id = this.tenantIdCounter++;
    const tenant: Tenant = {
      ...insertTenant,
      id,
      createdAt: new Date()
    };
    this.tenantsData.set(id, tenant);
    return tenant;
  }
  
  async updateTenant(id: number, tenantData: Partial<InsertTenant>): Promise<Tenant | undefined> {
    const existingTenant = this.tenantsData.get(id);
    if (!existingTenant) return undefined;
    
    const updatedTenant = { ...existingTenant, ...tenantData };
    this.tenantsData.set(id, updatedTenant);
    return updatedTenant;
  }
  
  async deleteTenant(id: number): Promise<boolean> {
    return this.tenantsData.delete(id);
  }
  
  // Plan methods
  async getPlan(id: number): Promise<Plan | undefined> {
    return this.plansData.get(id);
  }
  
  async getPlans(limit: number = 100, offset: number = 0): Promise<Plan[]> {
    return Array.from(this.plansData.values())
      .sort((a, b) => a.id - b.id)
      .slice(offset, offset + limit);
  }
  
  async createPlan(insertPlan: InsertPlan): Promise<Plan> {
    const id = this.planIdCounter++;
    const plan: Plan = { ...insertPlan, id };
    this.plansData.set(id, plan);
    return plan;
  }
  
  async updatePlan(id: number, planData: Partial<InsertPlan>): Promise<Plan | undefined> {
    const existingPlan = this.plansData.get(id);
    if (!existingPlan) return undefined;
    
    const updatedPlan = { ...existingPlan, ...planData };
    this.plansData.set(id, updatedPlan);
    return updatedPlan;
  }
  
  async deletePlan(id: number): Promise<boolean> {
    return this.plansData.delete(id);
  }
  
  // Subscription methods
  async getSubscription(id: number): Promise<Subscription | undefined> {
    return this.subscriptionsData.get(id);
  }
  
  async getSubscriptionsByTenant(tenantId: number): Promise<Subscription[]> {
    return Array.from(this.subscriptionsData.values())
      .filter(subscription => subscription.tenantId === tenantId)
      .sort((a, b) => a.id - b.id);
  }
  
  async createSubscription(insertSubscription: InsertSubscription): Promise<Subscription> {
    const id = this.subscriptionIdCounter++;
    const subscription: Subscription = { ...insertSubscription, id };
    this.subscriptionsData.set(id, subscription);
    return subscription;
  }
  
  async updateSubscription(id: number, subscriptionData: Partial<InsertSubscription>): Promise<Subscription | undefined> {
    const existingSubscription = this.subscriptionsData.get(id);
    if (!existingSubscription) return undefined;
    
    const updatedSubscription = { ...existingSubscription, ...subscriptionData };
    this.subscriptionsData.set(id, updatedSubscription);
    return updatedSubscription;
  }
  
  async deleteSubscription(id: number): Promise<boolean> {
    return this.subscriptionsData.delete(id);
  }
  
  // Activity methods
  async getActivity(id: number): Promise<Activity | undefined> {
    return this.activitiesData.get(id);
  }
  
  async getActivities(limit: number = 100, offset: number = 0): Promise<Activity[]> {
    return Array.from(this.activitiesData.values())
      .sort((a, b) => {
        if (a.timestamp && b.timestamp) {
          return b.timestamp.getTime() - a.timestamp.getTime();
        }
        return b.id - a.id;
      })
      .slice(offset, offset + limit);
  }
  
  async getActivitiesByUser(userId: number): Promise<Activity[]> {
    return Array.from(this.activitiesData.values())
      .filter(activity => activity.userId === userId)
      .sort((a, b) => {
        if (a.timestamp && b.timestamp) {
          return b.timestamp.getTime() - a.timestamp.getTime();
        }
        return b.id - a.id;
      });
  }
  
  async getActivitiesByTenant(tenantId: number): Promise<Activity[]> {
    return Array.from(this.activitiesData.values())
      .filter(activity => activity.tenantId === tenantId)
      .sort((a, b) => {
        if (a.timestamp && b.timestamp) {
          return b.timestamp.getTime() - a.timestamp.getTime();
        }
        return b.id - a.id;
      });
  }
  
  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = this.activityIdCounter++;
    const activity: Activity = { 
      ...insertActivity, 
      id,
      timestamp: new Date() 
    };
    this.activitiesData.set(id, activity);
    return activity;
  }
  
  // Settings methods
  async getSetting(id: number): Promise<Setting | undefined> {
    return this.settingsData.get(id);
  }
  
  async getSettingByKey(key: string, tenantId?: number): Promise<Setting | undefined> {
    return Array.from(this.settingsData.values())
      .find(setting => setting.key === key && setting.tenantId === tenantId);
  }
  
  async getSettingsByTenant(tenantId: number): Promise<Setting[]> {
    return Array.from(this.settingsData.values())
      .filter(setting => setting.tenantId === tenantId)
      .sort((a, b) => a.id - b.id);
  }
  
  async createSetting(insertSetting: InsertSetting): Promise<Setting> {
    const id = this.settingIdCounter++;
    const setting: Setting = { ...insertSetting, id };
    this.settingsData.set(id, setting);
    return setting;
  }
  
  async updateSetting(id: number, settingData: Partial<InsertSetting>): Promise<Setting | undefined> {
    const existingSetting = this.settingsData.get(id);
    if (!existingSetting) return undefined;
    
    const updatedSetting = { ...existingSetting, ...settingData };
    this.settingsData.set(id, updatedSetting);
    return updatedSetting;
  }
  
  async deleteSetting(id: number): Promise<boolean> {
    return this.settingsData.delete(id);
  }
}

export const storage = new MemStorage();
