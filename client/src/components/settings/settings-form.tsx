import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Setting } from '@shared/schema';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Save } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/use-auth';

type SettingGroup = {
  name: string;
  settings: {
    key: string;
    label: string;
    description?: string;
    type: 'text' | 'boolean' | 'select';
    options?: { value: string; label: string }[];
  }[];
};

type SettingsFormProps = {
  section: 'general' | 'appearance' | 'security';
};

export function SettingsForm({ section }: SettingsFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const tenantId = user?.tenantId || null;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [settingsValues, setSettingsValues] = useState<Record<string, any>>({});
  const isAdmin = user?.role === 'admin';
  
  // Predefined settings structure
  const settingsGroups: Record<string, SettingGroup[]> = {
    general: [
      {
        name: 'Site Settings',
        settings: [
          { key: 'site.name', label: 'Site Name', type: 'text' },
          { key: 'site.description', label: 'Site Description', type: 'text' },
          { key: 'site.maintenance_mode', label: 'Maintenance Mode', type: 'boolean', description: 'When enabled, site will show a maintenance message to visitors' },
        ]
      },
      {
        name: 'Notifications',
        settings: [
          { key: 'notifications.email', label: 'Email Notifications', type: 'boolean', description: 'Send email notifications for important events' },
          { key: 'notifications.in_app', label: 'In-App Notifications', type: 'boolean', description: 'Show in-app notifications for updates and events' },
        ]
      }
    ],
    appearance: [
      {
        name: 'Theme Settings',
        settings: [
          { 
            key: 'theme.mode', 
            label: 'Theme Mode', 
            type: 'select',
            options: [
              { value: 'light', label: 'Light' },
              { value: 'dark', label: 'Dark' },
              { value: 'system', label: 'System Default' },
            ]
          },
          { 
            key: 'theme.color', 
            label: 'Primary Color', 
            type: 'select',
            options: [
              { value: 'blue', label: 'Blue' },
              { value: 'green', label: 'Green' },
              { value: 'purple', label: 'Purple' },
              { value: 'orange', label: 'Orange' },
            ]
          },
          { key: 'theme.show_sidebar', label: 'Always Show Sidebar', type: 'boolean' },
        ]
      },
      {
        name: 'Display Options',
        settings: [
          { key: 'display.dense_tables', label: 'Use Dense Tables', type: 'boolean', description: 'More compact table layout' },
          { key: 'display.animations', label: 'Enable Animations', type: 'boolean' },
        ]
      }
    ],
    security: [
      {
        name: 'Authentication',
        settings: [
          { key: 'security.2fa', label: 'Two-Factor Authentication', type: 'boolean', description: 'Require 2FA for all admin users' },
          { key: 'security.session_timeout', label: 'Session Timeout (minutes)', type: 'text' },
        ]
      },
      {
        name: 'Password Policy',
        settings: [
          { key: 'security.password_min_length', label: 'Minimum Password Length', type: 'text' },
          { key: 'security.password_require_complex', label: 'Require Complex Passwords', type: 'boolean', description: 'Passwords must contain letters, numbers, and special characters' },
        ]
      }
    ]
  };
  
  // Fetch settings
  const { data: settings = [], isLoading } = useQuery<Setting[]>({
    queryKey: ['/api/settings', { tenantId }],
    enabled: isAdmin,
  });
  
  // Update settings on load
  useEffect(() => {
    if (settings.length > 0) {
      const values: Record<string, any> = {};
      settings.forEach(setting => {
        // Convert string values to appropriate types
        if (setting.value === 'true') {
          values[setting.key] = true;
        } else if (setting.value === 'false') {
          values[setting.key] = false;
        } else {
          values[setting.key] = setting.value;
        }
      });
      setSettingsValues(values);
    } else {
      // Set defaults if no settings found
      const defaults: Record<string, any> = {};
      settingsGroups[section]?.forEach(group => {
        group.settings.forEach(setting => {
          if (setting.type === 'boolean') {
            defaults[setting.key] = false;
          } else if (setting.type === 'select' && setting.options?.length) {
            defaults[setting.key] = setting.options[0].value;
          } else {
            defaults[setting.key] = '';
          }
        });
      });
      setSettingsValues(defaults);
    }
  }, [settings, section]);
  
  // Save settings mutation
  const saveSettingsMutation = useMutation({
    mutationFn: async (settingData: { key: string; value: string; tenantId: number | null }) => {
      return apiRequest('POST', '/api/settings', settingData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save settings',
        variant: 'destructive',
      });
    },
  });
  
  // Handle settings change
  const handleSettingChange = (key: string, value: any) => {
    setSettingsValues(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  // Save all settings
  const saveSettings = async () => {
    if (!isAdmin) return;
    
    setIsSubmitting(true);
    const keys = Object.keys(settingsValues);
    
    try {
      // Save each setting
      for (const key of keys) {
        let value = settingsValues[key];
        
        // Convert values to strings for storage
        if (typeof value === 'boolean') {
          value = value.toString();
        }
        
        await saveSettingsMutation.mutateAsync({
          key,
          value: value || '',
          tenantId
        });
      }
      
      toast({
        title: 'Settings saved',
        description: 'Your settings have been saved successfully',
      });
    } catch (error) {
      // Error is handled by the mutation
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!isAdmin) {
    return (
      <div className="p-4 text-center">
        <p className="text-sm text-gray-500">Only administrators can change system settings.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {settingsGroups[section]?.map((group, index) => (
        <div key={index} className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">{group.name}</h3>
            <Separator className="my-2" />
          </div>
          
          <div className="space-y-4">
            {group.settings.map((setting) => (
              <div key={setting.key} className="flex flex-col space-y-2">
                {setting.type === 'boolean' ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor={setting.key} className="text-sm font-medium">
                        {setting.label}
                      </Label>
                      {setting.description && (
                        <p className="text-xs text-gray-500">{setting.description}</p>
                      )}
                    </div>
                    <Switch
                      id={setting.key}
                      checked={settingsValues[setting.key] || false}
                      onCheckedChange={(checked) => handleSettingChange(setting.key, checked)}
                    />
                  </div>
                ) : setting.type === 'select' ? (
                  <div className="space-y-2">
                    <Label htmlFor={setting.key} className="text-sm font-medium">
                      {setting.label}
                    </Label>
                    {setting.description && (
                      <p className="text-xs text-gray-500">{setting.description}</p>
                    )}
                    <Select
                      value={settingsValues[setting.key] || ''}
                      onValueChange={(value) => handleSettingChange(setting.key, value)}
                    >
                      <SelectTrigger id={setting.key}>
                        <SelectValue placeholder="Select option" />
                      </SelectTrigger>
                      <SelectContent>
                        {setting.options?.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor={setting.key} className="text-sm font-medium">
                      {setting.label}
                    </Label>
                    {setting.description && (
                      <p className="text-xs text-gray-500">{setting.description}</p>
                    )}
                    <Input
                      id={setting.key}
                      value={settingsValues[setting.key] || ''}
                      onChange={(e) => handleSettingChange(setting.key, e.target.value)}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
      
      <div className="flex justify-end pt-4">
        <Button onClick={saveSettings} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
