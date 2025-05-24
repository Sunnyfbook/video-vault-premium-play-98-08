
import React, { useState, useEffect, useRef } from 'react';
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
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const { toast } = useToast();
  const processingRef = useRef<Set<string>>(new Set());

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
    
    setLoading(prev => ({ ...prev, add: true }));
    
    try {
      const result = await addAccessCode(newAccessCode.trim());
      
      if (result) {
        setNewAccessCode('');
        toast({
          title: "Success",
          description: "The access code has been added successfully.",
        });
      }
    } catch (error) {
      console.error("Error adding access code:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add access code.",
        variant: "destructive",
      });
    } finally {
      setLoading(prev => ({ ...prev, add: false }));
    }
  };

  const handleToggleAccessCode = async (accessCode: VideoAccessCode) => {
    // Prevent multiple operations on the same record
    if (processingRef.current.has(accessCode.id) || loading[accessCode.id]) {
      return;
    }

    // Check if the access code still exists in the current list
    const currentCode = accessCodes.find(code => code.id === accessCode.id);
    if (!currentCode) {
      toast({
        title: "Error",
        description: "Access code no longer exists.",
        variant: "destructive",
      });
      return;
    }

    processingRef.current.add(accessCode.id);
    setLoading(prev => ({ ...prev, [accessCode.id]: true }));
    
    try {
      const updatedCode = { ...currentCode, is_active: !currentCode.is_active };
      const result = await updateAccessCode(updatedCode);
      
      if (result) {
        toast({
          title: "Success",
          description: `Access code ${currentCode.is_active ? 'disabled' : 'enabled'} successfully.`,
        });
      }
    } catch (error) {
      console.error("Error toggling access code:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update access code.",
        variant: "destructive",
      });
    } finally {
      processingRef.current.delete(accessCode.id);
      setLoading(prev => ({ ...prev, [accessCode.id]: false }));
    }
  };

  const handleRemoveAccessCode = async (id: string) => {
    // Prevent multiple operations on the same record
    if (processingRef.current.has(id) || loading[id]) {
      return;
    }

    // Check if the access code still exists in the current list
    const currentCode = accessCodes.find(code => code.id === id);
    if (!currentCode) {
      toast({
        title: "Error",
        description: "Access code no longer exists.",
        variant: "destructive",
      });
      return;
    }

    processingRef.current.add(id);
    setLoading(prev => ({ ...prev, [id]: true }));
    
    try {
      const success = await deleteAccessCode(id);
      
      if (success) {
        toast({
          title: "Success",
          description: "The access code has been removed successfully.",
        });
      }
    } catch (error) {
      console.error("Error removing access code:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to remove access code.",
        variant: "destructive",
      });
    } finally {
      processingRef.current.delete(id);
      setLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  // Clean up processing refs when access codes change
  useEffect(() => {
    const currentIds = new Set(accessCodes.map(code => code.id));
    processingRef.current.forEach(id => {
      if (!currentIds.has(id)) {
        processingRef.current.delete(id);
      }
    });
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
                  disabled={loading.add}
                />
                <p className="text-xs text-gray-500">
                  This code will be required to access the videos page
                </p>
              </div>
              
              <Button type="submit" className="w-full" disabled={loading.add}>
                {loading.add ? "Adding..." : "Add Access Code"}
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
                          disabled={loading[accessCode.id]}
                        />
                        <Label htmlFor={`access-toggle-${accessCode.id}`} className="text-sm">
                          {accessCode.is_active ? 'Enabled' : 'Disabled'}
                        </Label>
                      </div>
                      
                      <Button 
                        onClick={() => handleRemoveAccessCode(accessCode.id)} 
                        variant="destructive" 
                        size="sm"
                        disabled={loading[accessCode.id]}
                      >
                        {loading[accessCode.id] ? "..." : "Delete"}
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
