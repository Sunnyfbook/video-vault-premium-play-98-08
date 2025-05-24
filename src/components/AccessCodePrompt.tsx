
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { getAccessCodeButtonConfig, AccessCodeButtonConfig } from '@/models/AccessCodeButton';

interface AccessCodePromptProps {
  onCodeVerified: (code: string) => Promise<boolean>;
}

const AccessCodePrompt: React.FC<AccessCodePromptProps> = ({ onCodeVerified }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [buttonConfig, setButtonConfig] = useState<AccessCodeButtonConfig | null>(null);
  const { toast } = useToast();

  // Load button configuration on component mount
  useEffect(() => {
    const loadButtonConfig = async () => {
      try {
        console.log('Loading access code button configuration...');
        const config = await getAccessCodeButtonConfig();
        console.log('Loaded config:', config);
        setButtonConfig(config);
      } catch (error) {
        console.error('Error loading button configuration:', error);
      }
    };

    loadButtonConfig();

    // Listen for configuration changes from localStorage
    const handleConfigChange = (event: CustomEvent) => {
      console.log('Button configuration changed via localStorage:', event.detail);
      setButtonConfig(event.detail);
    };

    window.addEventListener('accessCodeButtonConfigChanged', handleConfigChange as EventListener);
    
    return () => {
      window.removeEventListener('accessCodeButtonConfigChanged', handleConfigChange as EventListener);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code.trim()) {
      toast({
        title: "Error",
        description: "Please enter an access code.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const isValid = await onCodeVerified(code.trim());
      
      if (!isValid) {
        toast({
          title: "Invalid Code",
          description: "The access code you entered is invalid or inactive.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error verifying access code:", error);
      toast({
        title: "Error",
        description: "An error occurred while verifying the access code.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGetAccessCode = () => {
    if (buttonConfig?.button_url) {
      console.log('Opening URL:', buttonConfig.button_url);
      window.open(buttonConfig.button_url, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-100 to-slate-200 dark:from-slate-900 dark:via-gray-950 dark:to-slate-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Access Required</CardTitle>
          <CardDescription>
            Please enter a valid access code to view the videos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="accessCode">Access Code</Label>
              <Input
                id="accessCode"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter your access code"
                required
                disabled={loading}
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Verifying..." : "Access Videos"}
            </Button>
          </form>
          
          {/* Get Access Code Button */}
          {buttonConfig && buttonConfig.is_enabled && (
            <div className="pt-4 border-t">
              <p className="mb-2 text-sm text-center text-muted-foreground">
                Need an access code?
              </p>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={handleGetAccessCode}
                type="button"
              >
                {buttonConfig.button_text}
              </Button>
              <p className="mt-1 text-xs text-center text-muted-foreground opacity-70">
                URL: {buttonConfig.button_url}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AccessCodePrompt;
