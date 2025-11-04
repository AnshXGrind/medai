import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Newspaper, Calendar, ExternalLink, TrendingUp } from "lucide-react";

interface NewsItem {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  source: string;
  url: string;
  image?: string;
}

// Mock healthcare news data - In production, replace with API call
const mockHealthcareNews: NewsItem[] = [
  {
    id: "1",
    title: "New Guidelines for Diabetes Prevention Released by Health Ministry",
    description: "The Ministry of Health has released updated guidelines focusing on lifestyle modifications, early screening, and dietary recommendations to prevent Type 2 diabetes in India.",
    category: "Prevention",
    date: "2025-10-30",
    source: "Ministry of Health",
    url: "#",
    image: "/api/placeholder/400/200"
  },
  {
    id: "2",
    title: "Ayushman Bharat Expands Coverage to 50 Crore Beneficiaries",
    description: "Government's flagship healthcare scheme now covers additional services including preventive health checkups and mental health consultations across all empaneled hospitals.",
    category: "Policy",
    date: "2025-10-28",
    source: "National Health Authority",
    url: "#"
  },
  {
    id: "3",
    title: "Monsoon Health Alert: Prevention Tips for Waterborne Diseases",
    description: "Health experts warn about increased risk of dengue, malaria, and cholera during monsoon season. Simple preventive measures can reduce infection risk by 70%.",
    category: "Alert",
    date: "2025-10-25",
    source: "ICMR",
    url: "#"
  },
  {
    id: "4",
    title: "AI-Powered Early Detection of Tuberculosis Shows 95% Accuracy",
    description: "New AI-based chest X-ray analysis tool developed by Indian researchers shows promising results in early TB detection, potentially saving thousands of lives.",
    category: "Innovation",
    date: "2025-10-22",
    source: "Medical Research",
    url: "#"
  },
  {
    id: "5",
    title: "Mental Health Awareness: Breaking the Stigma in Rural India",
    description: "Government launches nationwide campaign to increase mental health awareness and accessibility to counseling services in rural areas through telemedicine.",
    category: "Mental Health",
    date: "2025-10-20",
    source: "NIMHANS",
    url: "#"
  },
  {
    id: "6",
    title: "COVID-19 Booster Dose Recommended for High-Risk Groups",
    description: "Health authorities recommend additional booster doses for elderly, immunocompromised individuals, and healthcare workers as new variants emerge.",
    category: "Vaccination",
    date: "2025-10-18",
    source: "WHO India",
    url: "#"
  }
];

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    Prevention: "bg-green-500/10 text-green-700 border-green-500/20",
    Policy: "bg-blue-500/10 text-blue-700 border-blue-500/20",
    Alert: "bg-red-500/10 text-red-700 border-red-500/20",
    Innovation: "bg-purple-500/10 text-purple-700 border-purple-500/20",
    "Mental Health": "bg-indigo-500/10 text-indigo-700 border-indigo-500/20",
    Vaccination: "bg-amber-500/10 text-amber-700 border-amber-500/20"
  };
  return colors[category] || "bg-gray-500/10 text-gray-700 border-gray-500/20";
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
};

interface HealthNewsProps {
  limit?: number;
  showHeader?: boolean;
  compact?: boolean;
}

export const HealthNews = ({ limit, showHeader = true, compact = false }: HealthNewsProps) => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setNews(mockHealthcareNews);
      setLoading(false);
    }, 500);
  }, []);

  const categories = ["All", ...Array.from(new Set(news.map(item => item.category)))];
  
  const filteredNews = selectedCategory === "All" 
    ? news 
    : news.filter(item => item.category === selectedCategory);
    
  const displayedNews = limit ? filteredNews.slice(0, limit) : filteredNews;

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-1/3"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-md border-primary/10 touch-manipulation">
      {showHeader && (
        <CardHeader className="p-4 md:p-6">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="p-1.5 md:p-2 bg-primary/10 rounded-lg">
                <Newspaper className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base md:text-lg">Healthcare News & Updates</CardTitle>
                <CardDescription className="text-xs md:text-sm hidden sm:block">Latest prevention tips and health alerts</CardDescription>
              </div>
            </div>
            <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-primary" />
          </div>
        </CardHeader>
      )}
      
      <CardContent className="space-y-3 md:space-y-4 p-4 md:p-6">
        {/* Category Filter */}
        {!compact && (
          <div className="flex flex-wrap gap-1.5 md:gap-2">
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="text-xs h-8 md:h-9 touch-manipulation active:scale-95"
              >
                {category}
              </Button>
            ))}
          </div>
        )}

        {/* News Items */}
        <div className="space-y-3 md:space-y-4">
          {displayedNews.map((item, index) => (
            <div 
              key={item.id}
              className={`p-3 md:p-4 border rounded-lg hover:shadow-md transition-smooth cursor-pointer animate-slide-up touch-manipulation active:scale-[0.99] ${
                compact ? 'hover:bg-muted/50' : 'hover:border-primary/30'
              }`}
              onClick={() => window.open(item.url, '_blank')}
            >
              <div className="flex items-start justify-between gap-2 md:gap-4">
                <div className="flex-1 space-y-1.5 md:space-y-2 min-w-0">
                  <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
                    <Badge variant="outline" className={`${getCategoryColor(item.category)} text-xs`}>
                      {item.category}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span className="hidden sm:inline">{formatDate(item.date)}</span>
                      <span className="sm:hidden">{formatDate(item.date).split(' ')[0]}</span>
                    </div>
                  </div>
                  
                  <h4 className={`font-semibold ${compact ? 'text-xs md:text-sm' : 'text-sm md:text-base'} leading-tight line-clamp-2`}>
                    {item.title}
                  </h4>
                  
                  {!compact && (
                    <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">
                      {item.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-2 md:gap-4 text-xs flex-wrap">
                    <span className="font-medium text-muted-foreground truncate">{item.source}</span>
                    <Button variant="link" size="sm" className="h-auto p-0 text-xs gap-1 touch-manipulation active:scale-95">
                      Read more <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {limit && filteredNews.length > limit && (
          <Button variant="outline" className="w-full h-10 md:h-11 text-sm md:text-base touch-manipulation active:scale-95">
            View All News ({filteredNews.length} articles)
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default HealthNews;
