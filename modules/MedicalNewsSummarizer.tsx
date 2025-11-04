import { useState, useEffect } from 'react';
import { Newspaper, ExternalLink, Calendar, Users, BookOpen, Search, RefreshCw } from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

interface NewsArticle {
  _id: string;
  title: string;
  summary: string;
  fullText?: string;
  source: string;
  authors: string[];
  publicationDate: string;
  doi?: string;
  url: string;
  keywords: string[];
  category: string;
  fetchedAt: string;
}

export default function MedicalNewsSummarizer() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [filteredNews, setFilteredNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchNews();
  }, []);

  useEffect(() => {
    filterNews();
  }, [news, searchTerm, selectedCategory]);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/medical-news/latest?limit=10`);
      setNews(response.data.data);
      setFilteredNews(response.data.data);
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshNews = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/medical-news/refresh`);
      setNews(response.data.data);
      setFilteredNews(response.data.data);
    } catch (error) {
      console.error('Error refreshing news:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterNews = () => {
    let filtered = [...news];

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(article => article.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredNews(filtered);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'research':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'clinical-trial':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'review':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'case-study':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'PubMed':
        return '🔬';
      case 'arXiv':
        return '📚';
      case 'medRxiv':
        return '🏥';
      default:
        return '📰';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-xl">
                <Newspaper className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Medical News & Research</h1>
                <p className="text-gray-600 mt-1">Latest healthcare research with AI summaries</p>
              </div>
            </div>
            <button
              onClick={refreshNews}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              Refresh News
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search articles, keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {['all', 'research', 'clinical-trial', 'review', 'case-study', 'general'].map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category === 'all' ? 'All' : category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <p>Showing {filteredNews.length} of {news.length} articles</p>
            <p>Last updated: {news.length > 0 ? new Date(news[0].fetchedAt).toLocaleString('en-IN') : 'N/A'}</p>
          </div>
        </div>

        {/* News Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <RefreshCw className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading latest research...</p>
            </div>
          </div>
        ) : filteredNews.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredNews.map((article) => (
              <div
                key={article._id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-indigo-500 to-blue-500 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{getSourceIcon(article.source)}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(article.category)}`}>
                      {article.category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2">
                    {article.title}
                  </h2>

                  {/* AI Summary */}
                  <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 mb-4 rounded">
                    <p className="text-sm font-semibold text-indigo-900 mb-2">🤖 AI Summary</p>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {article.summary}
                    </p>
                  </div>

                  {/* Authors */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      <p className="text-sm font-semibold text-gray-700">Authors</p>
                    </div>
                    <p className="text-sm text-gray-600 ml-6">
                      {article.authors.join(', ')}
                    </p>
                  </div>

                  {/* Publication Date */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <p className="text-sm font-semibold text-gray-700">Published</p>
                    </div>
                    <p className="text-sm text-gray-600 ml-6">
                      {new Date(article.publicationDate).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>

                  {/* Keywords */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="w-4 h-4 text-gray-500" />
                      <p className="text-sm font-semibold text-gray-700">Keywords</p>
                    </div>
                    <div className="flex flex-wrap gap-2 ml-6">
                      {article.keywords.map((keyword, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Source Info */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div>
                      <p className="text-xs text-gray-500">Source</p>
                      <p className="text-sm font-semibold text-gray-700">{article.source}</p>
                    </div>
                    {article.doi && (
                      <div>
                        <p className="text-xs text-gray-500">DOI</p>
                        <p className="text-sm font-mono text-gray-700">{article.doi}</p>
                      </div>
                    )}
                  </div>

                  {/* Read Full Paper Button */}
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <ExternalLink className="w-5 h-5" />
                    Read Full Paper
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Newspaper className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">No articles found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedCategory !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Click "Refresh News" to load the latest research'}
            </p>
            {!loading && news.length === 0 && (
              <button
                onClick={refreshNews}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Load Articles
              </button>
            )}
          </div>
        )}

        {/* Info Panel */}
        <div className="mt-6 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl shadow-xl p-6 text-white">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <Newspaper className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">AI-Powered Research Summaries</h3>
              <p className="text-indigo-100 mb-3">
                Stay updated with the latest medical research from trusted sources:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🔬</span>
                  <span>PubMed - National Library of Medicine</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">📚</span>
                  <span>arXiv - Cornell University</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🏥</span>
                  <span>medRxiv - Preprint Server</span>
                </div>
              </div>
              <p className="text-indigo-100 text-sm mt-4">
                All summaries are generated using advanced AI to provide concise, accurate overviews of complex research papers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
