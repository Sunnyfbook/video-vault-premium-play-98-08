
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { updateAdminUser } from "@/models/Auth";
import { User } from "@/models/Auth";

const AdminCredentialsManager = () => {
  const [credentials, setCredentials] = useState<Partial<User>>({
    username: '',
    password: ''
  });
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      setCredentials(prev => ({ 
        ...prev, 
        username: user.email || '' 
      }));
      setLoading(false);
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    // Basic validation
    if (!credentials.username?.trim()) {
      toast({
        title: "Error",
        description: "Email is required",
        variant: "destructive"
      });
      setSaving(false);
      return;
    }

    if (credentials.password && credentials.password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords don't match",
        variant: "destructive"
      });
      setSaving(false);
      return;
    }

    try {
      const currentEmail = user?.email || '';
      
      // Only update if there are changes
      if (credentials.username !== currentEmail || credentials.password) {
        const updatedUser = await updateAdminUser(currentEmail, credentials);
        
        if (updatedUser) {
          toast({
            title: "Success",
            description: "Admin credentials updated successfully",
          });
          
          // Reset password fields
          setCredentials(prev => ({ ...prev, password: '' }));
          setConfirmPassword('');
        }
      } else {
        toast({
          title: "Info",
          description: "No changes detected",
        });
      }
    } catch (error: any) {
      console.error("Error updating admin credentials:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update admin credentials",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Admin Credentials</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin Credentials</CardTitle>
        <CardDescription>
          Update your admin email and password
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Email</Label>
            <Input
              id="username"
              name="username"
              type="email"
              value={credentials.username || ''}
              onChange={handleChange}
              placeholder="Enter admin email"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">New Password (leave blank to keep current)</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={credentials.password || ''}
              onChange={handleChange}
              placeholder="Enter new password"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              disabled={!credentials.password}
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AdminCredentialsManager;
