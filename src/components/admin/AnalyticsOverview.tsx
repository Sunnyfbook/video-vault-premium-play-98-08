
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { AnalyticsData, getAnalyticsData } from '@/models/Analytics';
import { supabase } from '@/integrations/supabase/client';

const AnalyticsOverview: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [timeframe, setTimeframe] = useState<'7' | '30' | '90'>('7');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
    
    // Set up realtime subscription
    const channel = supabase
      .channel('public:analytics')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'analytics' },
        () => {
          loadAnalyticsData();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [timeframe]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    const data = await getAnalyticsData(parseInt(timeframe));
    
    // Sort by date ascending for charts
    const sortedData = [...data].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    setAnalyticsData(sortedData);
    setLoading(false);
  };

  const formatChartData = () => {
    return analyticsData.map(item => ({
      date: new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      pageViews: item.page_views,
      visitors: item.unique_visitors
    }));
  };

  const calculateTotalPageViews = () => {
    return analyticsData.reduce((total, item) => total + item.page_views, 0);
  };

  const calculateTotalVisitors = () => {
    return analyticsData.reduce((total, item) => total + item.unique_visitors, 0);
  };

  const calculateAverageViewsPerDay = () => {
    if (analyticsData.length === 0) return 0;
    return Math.round(calculateTotalPageViews() / analyticsData.length);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Website Analytics</CardTitle>
        <CardDescription>Real-time overview of your site's performance</CardDescription>
        
        <TabsList className="mt-2">
          <TabsTrigger value="7" onClick={() => setTimeframe('7')}>
            Last 7 days
          </TabsTrigger>
          <TabsTrigger value="30" onClick={() => setTimeframe('30')}>
            Last 30 days
          </TabsTrigger>
          <TabsTrigger value="90" onClick={() => setTimeframe('90')}>
            Last 90 days
          </TabsTrigger>
        </TabsList>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <p>Loading analytics data...</p>
          </div>
        ) : analyticsData.length === 0 ? (
          <div className="h-64 flex items-center justify-center">
            <p>No analytics data available for this time period.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{calculateTotalPageViews()}</p>
                    <p className="text-sm text-muted-foreground">Total Page Views</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{calculateTotalVisitors()}</p>
                    <p className="text-sm text-muted-foreground">Total Visitors</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{calculateAverageViewsPerDay()}</p>
                    <p className="text-sm text-muted-foreground">Avg. Views Per Day</p>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Tabs defaultValue="views">
              <TabsList className="mb-4">
                <TabsTrigger value="views">Page Views</TabsTrigger>
                <TabsTrigger value="visitors">Unique Visitors</TabsTrigger>
              </TabsList>
              
              <TabsContent value="views">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={formatChartData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="pageViews" stroke="#3b82f6" name="Page Views" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
              
              <TabsContent value="visitors">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={formatChartData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="visitors" fill="#22c55e" name="Unique Visitors" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AnalyticsOverview;
