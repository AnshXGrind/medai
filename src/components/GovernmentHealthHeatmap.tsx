import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  Activity,
  Info,
  ExternalLink,
  Shield
} from "lucide-react";
import { toast } from "sonner";

interface HealthAlert {
  state: string;
  disease: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  cases: number;
  trend: 'rising' | 'stable' | 'declining';
  lastUpdated: string;
}

interface HealthStats {
  region: string;
  totalCases: number;
  vaccinated: number;
  hospitals: number;
  doctors: number;
}

export const GovernmentHealthHeatmap = () => {
  const [selectedState, setSelectedState] = useState<string | null>(null);

  const healthAlerts: HealthAlert[] = [
    {
      state: "Delhi",
      disease: "Dengue Outbreak",
      severity: 'high',
      cases: 1250,
      trend: 'rising',
      lastUpdated: '2 hours ago'
    },
    {
      state: "Maharashtra",
      disease: "Seasonal Flu",
      severity: 'medium',
      cases: 3400,
      trend: 'stable',
      lastUpdated: '5 hours ago'
    },
    {
      state: "Kerala",
      disease: "Water-borne Diseases",
      severity: 'medium',
      cases: 890,
      trend: 'declining',
      lastUpdated: '1 day ago'
    },
    {
      state: "West Bengal",
      disease: "Malaria Cases",
      severity: 'low',
      cases: 450,
      trend: 'declining',
      lastUpdated: '6 hours ago'
    },
    {
      state: "Uttar Pradesh",
      disease: "Vector-borne Diseases",
      severity: 'medium',
      cases: 2100,
      trend: 'stable',
      lastUpdated: '3 hours ago'
    }
  ];

  const regionalStats: HealthStats = {
    region: selectedState || "National",
    totalCases: 125340,
    vaccinated: 85,
    hospitals: 1245,
    doctors: 8920
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rising': return '📈';
      case 'declining': return '📉';
      case 'stable': return '➡️';
      default: return '➡️';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'rising': return 'text-red-600 dark:text-red-400';
      case 'declining': return 'text-green-600 dark:text-green-400';
      case 'stable': return 'text-blue-600 dark:text-blue-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const viewFullHeatmap = () => {
    toast.info("Opening government health portal...");
    // TODO: Integrate with actual government health data API
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="p-4 md:p-6">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg">
              <MapPin className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-base md:text-lg">Government Health Heatmap</CardTitle>
              <CardDescription className="text-xs md:text-sm">
                Real-time disease surveillance & health statistics
              </CardDescription>
            </div>
          </div>
          <Button 
            size="sm" 
            variant="outline"
            onClick={viewFullHeatmap}
            className="h-8 md:h-9 text-xs"
          >
            <ExternalLink className="h-3 w-3 md:h-4 md:w-4 mr-1" />
            Full Map
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4 md:p-6 space-y-4">
        {/* Regional Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-xs text-muted-foreground">Active Cases</span>
            </div>
            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {regionalStats.totalCases.toLocaleString()}
            </p>
          </div>

          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-xs text-muted-foreground">Vaccinated</span>
            </div>
            <p className="text-lg font-bold text-green-600 dark:text-green-400">
              {regionalStats.vaccinated}%
            </p>
          </div>

          <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span className="text-xs text-muted-foreground">Hospitals</span>
            </div>
            <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
              {regionalStats.hospitals}
            </p>
          </div>

          <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              <span className="text-xs text-muted-foreground">Doctors</span>
            </div>
            <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
              {regionalStats.doctors}
            </p>
          </div>
        </div>

        {/* Active Health Alerts */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <h3 className="font-semibold text-sm">Active Health Alerts</h3>
          </div>

          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {healthAlerts.map((alert, index) => (
              <div 
                key={index}
                className="p-3 border border-border rounded-lg hover:shadow-md transition-smooth cursor-pointer"
                onClick={() => setSelectedState(alert.state)}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-sm">{alert.disease}</h4>
                      <Badge className={`text-xs ${getSeverityColor(alert.severity)}`}>
                        {alert.severity}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {alert.state}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">{alert.cases.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">cases</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium ${getTrendColor(alert.trend)}`}>
                      {getTrendIcon(alert.trend)} {alert.trend}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Updated {alert.lastUpdated}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Information Banner */}
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-blue-800 dark:text-blue-200">
              <p className="font-medium mb-1">Data Source: Ministry of Health & Family Welfare</p>
              <p className="text-blue-700 dark:text-blue-300">
                Real-time data updated every 6 hours. For emergencies, call 108 or visit nearest hospital.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            className="flex-1 h-9 text-xs"
            onClick={() => toast.info("Showing prevention guidelines...")}
          >
            <Shield className="h-4 w-4 mr-1" />
            Prevention Tips
          </Button>
          <Button 
            variant="outline" 
            className="flex-1 h-9 text-xs"
            onClick={() => toast.info("Downloading health advisory...")}
          >
            <TrendingUp className="h-4 w-4 mr-1" />
            Health Advisory
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default GovernmentHealthHeatmap;
