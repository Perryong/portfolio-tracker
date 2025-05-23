import React, { useState } from 'react';
import { Navbar } from "@/components/layout/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SP500HeatmapWidget } from "@/components/markets/SP500HeatmapWidget";
import { HangSengHeatmapWidget } from "@/components/markets/HangSengHeatmapWidget";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EconomicsCalendarWidget } from '@/components/markets/EconomicsCalendarWidget';
import { TopStoriesWidget } from '@/components/markets/TopStoriesWidget';
import { TickerTapeWidget } from '@/components/markets/TickerTapeWidget';

const Markets = () => {
  const [activeTab, setActiveTab] = useState("sp500");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Global Markets</h1>
          <p className="text-muted-foreground">
            View heatmaps of major global market indices and economic events
          </p>
        </div>
        <div className="mb-6">
          <TickerTapeWidget />
        </div>
        
        <Tabs
          defaultValue="sp500"
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList>
            <TabsTrigger value="sp500">S&P 500</TabsTrigger>
            <TabsTrigger value="hangseng">Hang Seng</TabsTrigger>
            <TabsTrigger value="economics">Economic Calendar</TabsTrigger>
            <TabsTrigger value="topstories">Top Stories</TabsTrigger>
          </TabsList>
          
          <TabsContent value="sp500" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>S&P 500 Market Heatmap</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[600px] w-full">
                  <SP500HeatmapWidget />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="hangseng" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Hang Seng Market Heatmap</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[600px] w-full">
                  <HangSengHeatmapWidget />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="economics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Economic Events Calendar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[600px] w-full">
                  <EconomicsCalendarWidget />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="topstories" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Market Top Stories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[600px] w-full">
                  <TopStoriesWidget />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Markets;