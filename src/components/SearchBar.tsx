import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Search, 
  X, 
  Loader2, 
  TrendingUp,
  Stethoscope,
  Hospital,
  Pill,
  FileText,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const PYTHON_SEARCH_API = "http://localhost:5000";

interface SearchResult {
  id: number;
  name: string;
  category?: string;
  specialty?: string;
  location?: string;
  type?: string;
  relevance_score: number;
  matched_field: string;
}

interface SearchResponse {
  success: boolean;
  query: string;
  category: string;
  total_results: number;
  results: {
    symptoms?: SearchResult[];
    doctors?: SearchResult[];
    hospitals?: SearchResult[];
    medicines?: SearchResult[];
    health_records?: SearchResult[];
  };
}

interface Suggestion {
  text: string;
  category: string;
  icon: string;
}

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const searchRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch suggestions as user types
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        const response = await fetch(`${PYTHON_SEARCH_API}/api/search/suggestions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, limit: 5 })
        });

        if (response.ok) {
          const data = await response.json();
          setSuggestions(data.suggestions || []);
          setShowSuggestions(true);
        }
      } catch (error) {
        // Silently fail for suggestions
        console.log("Suggestions unavailable");
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleSearch = async () => {
    if (!query.trim()) {
      toast.error("Please enter a search query");
      return;
    }

    setIsSearching(true);
    setShowSuggestions(false);

    try {
      const response = await fetch(`${PYTHON_SEARCH_API}/api/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: query.trim(), 
          category: selectedCategory,
          limit: 10 
        })
      });

      if (!response.ok) {
        throw new Error('Search service unavailable');
      }

      const data: SearchResponse = await response.json();
      setResults(data);
      setShowResults(true);
      
      if (data.total_results === 0) {
        toast.info("No results found", {
          description: "Try different keywords or check spelling"
        });
      } else {
        toast.success(`Found ${data.total_results} results`);
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Search service unavailable", {
        description: "Please make sure Python backend is running on port 5000"
      });
      
      // Show offline message
      setResults({
        success: false,
        query: query,
        category: selectedCategory,
        total_results: 0,
        results: {}
      });
      setShowResults(true);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setQuery("");
    setResults(null);
    setShowResults(false);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'symptom': return '🩺';
      case 'doctor': return '👨‍⚕️';
      case 'hospital': return '🏥';
      case 'medicine': return '💊';
      case 'record': return '📄';
      default: return '🔍';
    }
  };

  const renderResultSection = (title: string, items: SearchResult[], icon: React.ReactNode) => {
    if (!items || items.length === 0) return null;

    return (
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2 px-2">
          {icon}
          <h3 className="font-semibold text-sm">{title}</h3>
          <Badge variant="secondary" className="text-xs">{items.length}</Badge>
        </div>
        <div className="space-y-2">
          {items.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.name}</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {item.category && (
                        <Badge variant="outline" className="text-xs">
                          {item.category}
                        </Badge>
                      )}
                      {item.specialty && (
                        <Badge variant="outline" className="text-xs">
                          {item.specialty}
                        </Badge>
                      )}
                      {item.location && (
                        <Badge variant="outline" className="text-xs">
                          📍 {item.location}
                        </Badge>
                      )}
                      {item.type && (
                        <Badge variant="outline" className="text-xs">
                          {item.type}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="ml-2">
                    <Badge 
                      variant={item.relevance_score > 70 ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {Math.round(item.relevance_score)}%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-3xl">
      {/* Search Input */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search symptoms, doctors, hospitals, medicines..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={() => query.length >= 2 && setShowSuggestions(true)}
              className="pl-10 pr-10 h-11"
            />
            {query && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
                title="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button 
            onClick={handleSearch} 
            disabled={isSearching || !query.trim()}
            className="h-11"
          >
            {isSearching ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Search
              </>
            )}
          </Button>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 mt-2 overflow-x-auto">
          {['all', 'symptoms', 'doctors', 'hospitals', 'medicines', 'records'].map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
              className="text-xs capitalize whitespace-nowrap"
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <Card className="absolute top-full mt-2 w-full z-50 shadow-lg">
          <CardContent className="p-2">
            <div className="space-y-1">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setQuery(suggestion.text);
                    setShowSuggestions(false);
                    setTimeout(handleSearch, 100);
                  }}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-secondary transition-colors flex items-center gap-2"
                >
                  <span className="text-lg">{suggestion.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{suggestion.text}</p>
                    <p className="text-xs text-muted-foreground">{suggestion.category}</p>
                  </div>
                  <TrendingUp className="h-3 w-3 text-muted-foreground" />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      {showResults && results && (
        <Card className="absolute top-full mt-2 w-full z-50 shadow-lg max-h-[600px] overflow-hidden">
          <CardContent className="p-4">
            {results.success ? (
              <>
                <div className="mb-4 pb-3 border-b">
                  <h2 className="text-lg font-semibold">
                    Search Results for "{results.query}"
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Found {results.total_results} result{results.total_results !== 1 ? 's' : ''} in {results.category}
                  </p>
                </div>

                <ScrollArea className="h-[500px]">
                  {renderResultSection(
                    "Symptoms",
                    results.results.symptoms || [],
                    <Stethoscope className="h-4 w-4 text-purple-600" />
                  )}
                  {renderResultSection(
                    "Doctors",
                    results.results.doctors || [],
                    <Stethoscope className="h-4 w-4 text-green-600" />
                  )}
                  {renderResultSection(
                    "Hospitals",
                    results.results.hospitals || [],
                    <Hospital className="h-4 w-4 text-red-600" />
                  )}
                  {renderResultSection(
                    "Medicines",
                    results.results.medicines || [],
                    <Pill className="h-4 w-4 text-blue-600" />
                  )}
                  {renderResultSection(
                    "Health Records",
                    results.results.health_records || [],
                    <FileText className="h-4 w-4 text-orange-600" />
                  )}

                  {results.total_results === 0 && (
                    <div className="text-center py-8">
                      <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <h3 className="font-semibold mb-2">No Results Found</h3>
                      <p className="text-sm text-muted-foreground">
                        Try different keywords or check your spelling
                      </p>
                    </div>
                  )}
                </ScrollArea>
              </>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Search Service Offline</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Python backend is not running. Start it with:
                </p>
                <code className="bg-secondary px-3 py-2 rounded text-xs block">
                  cd backend-modules && python search_service.py
                </code>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SearchBar;
