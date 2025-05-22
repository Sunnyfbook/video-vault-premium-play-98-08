
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const Index = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-brand mb-2">Video Player Pro</h1>
          <p className="text-gray-500">Watch high-quality videos</p>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center py-16">
        <Card className="max-w-lg w-full">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-semibold mb-4 text-center">Welcome to Video Player Pro</h2>
            <p className="text-gray-500 mb-6 text-center">
              Videos are only accessible via direct links.
            </p>
            <p className="text-sm text-gray-400 text-center">
              Contact the administrator for video links.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
