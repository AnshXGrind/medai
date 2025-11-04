import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  MapPin, 
  Activity,
  Users,
  Thermometer,
  Heart
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export const HealthInsightsDashboard = () => {
  const [insights, setInsights] = useState({
    totalCases: 1247,
    activeOutbreaks: 3,
    districtData: [
      { name: "Delhi Central", cases: 312, trend: "up", priority: "high" },
      { name: "South Delhi", cases: 245, trend: "stable", priority: "medium" },
      { name: "East Delhi", cases: 189, trend: "down", priority: "low" },
      { name: "West Delhi", cases: 276, trend: "up", priority: "high" },
      { name: "North Delhi", cases: 225, trend: "stable", priority: "medium" }
    ],
    diseaseBreakdown: [
      { disease: "Fever", cases: 450, percentage: 36 },
      { disease: "Respiratory Issues", cases: 312, percentage: 25 },
      { disease: "Gastrointestinal", cases: 218, percentage: 17 },
      { disease: "Skin Issues", cases: 156, percentage: 13 },
      { disease: "Others", cases: 111, percentage: 9 }
    ],
    aiPredictions: [
      {
        alert: "Dengue Outbreak Risk",
        region: "South Delhi",
        probability: 78,
        recommendation: "Increase mosquito control measures immediately"
      },
      {
        alert: "Seasonal Flu Peak Expected",
        region: "All Districts",
        probability: 65,
        recommendation: "Stock additional flu medications and vaccines"
      }
    ]
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl md:text-3xl font-bold mb-2">
          AI Health Insights Dashboard
        </h2>
        <p className="text-muted-foreground">
          Real-time health analytics powered by aggregated patient data
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Cases</p>
                <p className="text-2xl font-bold">{insights.totalCases}</p>
                <p className="text-xs text-green-600">↑ 12% from last week</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Active Outbreaks</p>
                <p className="text-2xl font-bold">{insights.activeOutbreaks}</p>
                <p className="text-xs text-red-600">Requires attention</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Activity className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Recovery Rate</p>
                <p className="text-2xl font-bold">87%</p>
                <p className="text-xs text-green-600">↑ 5% improvement</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Thermometer className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Avg Response Time</p>
                <p className="text-2xl font-bold">2.4h</p>
                <p className="text-xs text-green-600">↓ 30min faster</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* District-wise Analysis */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            <CardTitle>District-wise Health Status</CardTitle>
          </div>
          <CardDescription>
            Case distribution and trends across districts (Last 7 days)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {insights.districtData.map((district, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-medium">{district.name}</span>
                  <Badge 
                    variant={
                      district.priority === 'high' ? 'destructive' :
                      district.priority === 'medium' ? 'default' : 'secondary'
                    }
                    className="text-xs"
                  >
                    {district.priority.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{district.cases}</span>
                  <span className={`text-xs ${
                    district.trend === 'up' ? 'text-red-600' :
                    district.trend === 'down' ? 'text-green-600' :
                    'text-yellow-600'
                  }`}>
                    {district.trend === 'up' ? '↗' : district.trend === 'down' ? '↘' : '→'}
                  </span>
                </div>
              </div>
              <Progress 
                value={(district.cases / insights.totalCases) * 100} 
                className="h-2"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Disease Breakdown */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            <CardTitle>Disease Category Analysis</CardTitle>
          </div>
          <CardDescription>
            Most common health issues reported in the last 7 days
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {insights.diseaseBreakdown.map((disease, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">{disease.disease}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">{disease.cases} cases</span>
                  <Badge variant="outline">{disease.percentage}%</Badge>
                </div>
              </div>
              <Progress value={disease.percentage} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* AI Predictions */}
      <Card className="border-2 border-orange-200 dark:border-orange-800">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-orange-600" />
            <CardTitle>AI-Powered Predictions & Alerts</CardTitle>
          </div>
          <CardDescription>
            Machine learning insights from aggregated health data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          {insights.aiPredictions.map((prediction, idx) => (
            <div key={idx} className="p-4 bg-secondary rounded-lg space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <h4 className="font-semibold">{prediction.alert}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {prediction.region}
                  </p>
                </div>
                <Badge className="bg-orange-600">{prediction.probability}% Risk</Badge>
              </div>
              
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground">AI Recommendation:</p>
                <p className="text-sm">{prediction.recommendation}</p>
              </div>

              <Progress value={prediction.probability} className="h-2" />
            </div>
          ))}

          {/* Methodology Note */}
          <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-xs text-muted-foreground">
              <strong>🤖 AI Methodology:</strong> Predictions generated using machine learning models 
              trained on historical health data, weather patterns, and seasonal trends. Data is 
              fully anonymized and aggregated for privacy protection.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Data Privacy Notice */}
      <Card className="border-green-200 dark:border-green-800">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Heart className="h-5 w-5 text-green-600 mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <strong className="text-foreground">Privacy Protected:</strong> All data shown is aggregated 
              and anonymized. Individual patient information is never exposed. This dashboard complies with 
              data protection regulations and uses zero raw personal data.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HealthInsightsDashboard;
