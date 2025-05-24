
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { VideoAccessCode, addAccessCode, updateAccessCode, deleteAccessCode } from '@/models/VideoAccess';
import { useToast } from '@/hooks/use-toast';

interface VideoAccessTabProps {
  accessCodes: VideoAccessCode[];
}

const VideoAccessTab: React.FC<VideoAccessTabProps> = ({ accessCodes }) => {
  const [newAccessCode, setNewAccessCode] = useState('');
  const { toast } = useToast();

  const handleAddAccessCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newAccessCode.trim()) {
      toast({
        title: "Error",
        description: "Access code is required.",
        variant: "destructive",
      });
      return;
    }
    
    console.log('Attempting to add access code:', newAccessCode.trim());
    
    try {
      const result = await addAccessCode(newAccessCode.trim());
      console.log('Add access code result:', result);
      
      if (result) {
        setNewAccessCode('');
        toast({
          title: "Access Code Added",
          description: "The access code has been added successfully.",
        });
      } else {
        throw new Error("Failed to add access code");
      }
    } catch (error) {
      console.error("Error adding access code:", error);
      toast({
        title: "Error",
        description: "Failed to add access code. Check console for details.",
        variant: "destructive",
      });
    }
  };

  const handleToggleAccessCode = async (accessCode: VideoAccessCode) => {
    console.log('Attempting to toggle access code:', accessCode.id, 'from', accessCode.is_active, 'to', !accessCode.is_active);
    
    try {
      const updatedCode = { ...accessCode, is_active: !accessCode.is_active };
      const result = await updateAccessCode(updatedCode);
      console.log('Toggle access code result:', result);
      
      if (result) {
        toast({
          title: "Access Code Updated",
          description: `Access code ${accessCode.is_active ? 'disabled' : 'enabled'} successfully.`,
        });
      } else {
        throw new Error("Failed to update access code");
      }
    } catch (error) {
      console.error("Error toggling access code:", error);
      toast({
        title: "Error",
        description: "Failed to update access code. Check console for details.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveAccessCode = async (id: string) => {
    console.log('Attempting to delete access code:', id);
    
    try {
      const success = await deleteAccessCode(id);
      console.log('Delete access code result:', success);
      
      if (success) {
        toast({
          title: "Access Code Removed",
          description: "The access code has been removed.",
        });
      } else {
        throw new Error("Failed to delete access code");
      }
    } catch (error) {
      console.error("Error removing access code:", error);
      toast({
        title: "Error",
        description: "Failed to remove access code. Check console for details.",
        variant: "destructive",
      });
    }
  };

  // Add debugging info
  React.useEffect(() => {
    const userId = localStorage.getItem('userId');
    const isAdmin = localStorage.getItem('isAdmin');
    console.log('VideoAccessTab - Current user context:', { userId, isAdmin, accessCodesCount: accessCodes.length });
  }, [accessCodes]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Add Access Code Form */}
      <div className="md:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Add Access Code</CardTitle>
            <CardDescription>
              Create a new access code for the videos page
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddAccessCode} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="accessCode">Access Code</Label>
                <Input
                  id="accessCode"
                  value={newAccessCode}
                  onChange={(e) => setNewAccessCode(e.target.value)}
                  placeholder="Enter new access code"
                  required
                />
                <p className="text-xs text-gray-500">
                  This code will be required to access the videos page
                </p>
              </div>
              
              <Button type="submit" className="w-full">
                Add Access Code
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      
      {/* Access Codes List */}
      <div className="md:col-span-2">
        <h2 className="text-xl font-semibold mb-4">Video Access Codes</h2>
        
        {accessCodes.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <p className="text-gray-500 mb-4">No access codes configured</p>
            <p className="text-sm text-gray-400">Add your first access code using the form</p>
          </div>
        ) : (
          <div className="space-y-4">
            {accessCodes.map((accessCode) => (
              <Card key={accessCode.id}>
                <CardContent className="p-4">
                  <div className="flex flex-wrap justify-between items-center gap-4">
                    <div>
                      <h3 className="font-semibold font-mono text-lg">{accessCode.code}</h3>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          accessCode.is_active 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {accessCode.is_active ? 'Active' : 'Inactive'}
                        </span>
                        <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-800">
                          Created {new Date(accessCode.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id={`access-toggle-${accessCode.id}`}
                          checked={accessCode.is_active}
                          onCheckedChange={() => handleToggleAccessCode(accessCode)}
                        />
                        <Label htmlFor={`access-toggle-${accessCode.id}`} className="text-sm">
                          {accessCode.is_active ? 'Enabled' : 'Disabled'}
                        </Label>
                      </div>
                      
                      <Button 
                        onClick={() => handleRemoveAccessCode(accessCode.id)} 
                        variant="destructive" 
                        size="sm"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoAccessTab;
