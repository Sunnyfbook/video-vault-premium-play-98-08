
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AccessCodePromptProps {
  onCodeVerified: (code: string) => Promise<boolean>;
}

const AccessCodePrompt: React.FC<AccessCodePromptProps> = ({ onCodeVerified }) => {
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const { toast } = useToast();

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

    setIsVerifying(true);
    
    try {
      const isValid = await onCodeVerified(code.trim());
      
      if (!isValid) {
        toast({
          title: "Invalid Access Code",
          description: "The access code you entered is not valid or has been deactivated.",
          variant: "destructive",
        });
        setCode('');
      }
    } catch (error) {
      console.error('Error verifying access code:', error);
      toast({
        title: "Error",
        description: "An error occurred while verifying the access code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-100 to-slate-200 dark:from-slate-900 dark:via-gray-950 dark:to-slate-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
            <Lock className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-2xl">Access Required</CardTitle>
          <CardDescription>
            Please enter your access code to view the videos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="accessCode">Access Code</Label>
              <Input
                id="accessCode"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter access code"
                disabled={isVerifying}
                autoFocus
              />
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isVerifying || !code.trim()}
            >
              {isVerifying ? 'Verifying...' : 'Access Videos'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccessCodePrompt;
