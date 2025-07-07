
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { WeightedAnalysis } from '@/types/summaryAnalysis';
import { 
  Target, 
  Brain, 
  TrendingUp, 
  Building, 
  BarChart3,
  Users,
  Zap,
  PieChart
} from 'lucide-react';

export interface SelectedMethods {
  warrenBuffett: boolean;
  charlieMunger: boolean;
  peterLynch: boolean;
  billAckman: boolean;
  quantitative: boolean;
}

interface AnalysisMethodSelectorProps {
  selectedMethods: SelectedMethods;
  onMethodToggle: (method: keyof SelectedMethods) => void;
  onApplyPreset: (preset: string) => void;
  onAutoDistribute: () => void;
}

const methodInfo = {
  warrenBuffett: {
    icon: Target,
    name: 'Warren Buffett',
    description: 'Value investing & business moats',
    color: 'text-blue-600'
  },
  charlieMunger: {
    icon: Brain,
    name: 'Charlie Munger',
    description: 'Business quality & mental models',
    color: 'text-purple-600'
  },
  peterLynch: {
    icon: TrendingUp,
    name: 'Peter Lynch',
    description: 'Growth at reasonable price',
    color: 'text-green-600'
  },
  billAckman: {
    icon: Building,
    name: 'Bill Ackman',
    description: 'Quality businesses & activism',
    color: 'text-orange-600'
  },
  quantitative: {
    icon: BarChart3,
    name: 'Quantitative',
    description: 'Technical & fundamental metrics',
    color: 'text-cyan-600'
  }
};

const presetStrategies = [
  {
    name: 'Value Investor',
    icon: Target,
    description: 'Focus on Buffett & Munger approaches',
    methods: ['warrenBuffett', 'charlieMunger', 'quantitative']
  },
  {
    name: 'Growth Focused',
    icon: TrendingUp,
    description: 'Emphasize growth and momentum',
    methods: ['peterLynch', 'quantitative', 'billAckman']
  },
  {
    name: 'Comprehensive',
    icon: Users,
    description: 'Use all available analysis methods',
    methods: ['warrenBuffett', 'charlieMunger', 'peterLynch', 'billAckman', 'quantitative']
  }
];

export const AnalysisMethodSelector: React.FC<AnalysisMethodSelectorProps> = ({
  selectedMethods,
  onMethodToggle,
  onApplyPreset,
  onAutoDistribute
}) => {
  const selectedCount = Object.values(selectedMethods).filter(Boolean).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Analysis Method Selection
          </span>
          <Badge variant="outline">
            {selectedCount}/5 Selected
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Presets */}
        <div>
          <h4 className="font-medium mb-3">Quick Presets</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {presetStrategies.map((preset) => {
              const IconComponent = preset.icon;
              return (
                <Button
                  key={preset.name}
                  variant="outline"
                  size="sm"
                  onClick={() => onApplyPreset(preset.name)}
                  className="justify-start h-auto p-3"
                >
                  <div className="flex flex-col items-start gap-1 w-full">
                    <div className="flex items-center gap-2">
                      <IconComponent className="h-4 w-4" />
                      <span className="font-medium">{preset.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {preset.description}
                    </span>
                  </div>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Individual Method Selection */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium">Individual Methods</h4>
            <Button
              variant="outline"
              size="sm"
              onClick={onAutoDistribute}
              disabled={selectedCount === 0}
            >
              <Zap className="h-3 w-3 mr-1" />
              Auto Distribute Weights
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(Object.entries(methodInfo) as [keyof SelectedMethods, typeof methodInfo[keyof typeof methodInfo]][]).map(([key, info]) => {
              const IconComponent = info.icon;
              const isSelected = selectedMethods[key];
              
              return (
                <div
                  key={key}
                  className={`border rounded-lg p-3 transition-all ${
                    isSelected 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2 flex-1">
                      <IconComponent className={`h-4 w-4 mt-0.5 ${info.color}`} />
                      <div className="flex-1 min-w-0">
                        <Label 
                          htmlFor={key}
                          className="text-sm font-medium cursor-pointer"
                        >
                          {info.name}
                        </Label>
                        <p className="text-xs text-muted-foreground mt-1">
                          {info.description}
                        </p>
                      </div>
                    </div>
                    <Switch
                      id={key}
                      checked={isSelected}
                      onCheckedChange={() => onMethodToggle(key)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {selectedCount === 0 && (
          <div className="text-center py-4 text-muted-foreground">
            <PieChart className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Select at least one analysis method to proceed</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const presetConfigurations = {
  'Value Investor': {
    methods: {
      warrenBuffett: true,
      charlieMunger: true,
      peterLynch: false,
      billAckman: false,
      quantitative: true
    } as SelectedMethods,
    weights: {
      warrenBuffett: 40,
      charlieMunger: 35,
      peterLynch: 0,
      billAckman: 0,
      quantitative: 25
    } as WeightedAnalysis
  },
  'Growth Focused': {
    methods: {
      warrenBuffett: false,
      charlieMunger: false,
      peterLynch: true,
      billAckman: true,
      quantitative: true
    } as SelectedMethods,
    weights: {
      warrenBuffett: 0,
      charlieMunger: 0,
      peterLynch: 40,
      billAckman: 30,
      quantitative: 30
    } as WeightedAnalysis
  },
  'Comprehensive': {
    methods: {
      warrenBuffett: true,
      charlieMunger: true,
      peterLynch: true,
      billAckman: true,
      quantitative: true
    } as SelectedMethods,
    weights: {
      warrenBuffett: 25,
      charlieMunger: 20,
      peterLynch: 20,
      billAckman: 15,
      quantitative: 20
    } as WeightedAnalysis
  }
};
