import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

interface NewsArticle {
  _id: string;
  title: string;
  summary: string;
  aiSummary: string;
  authors: string[];
  publicationDate: string;
  category: string;
  keywords: string[];
  externalLink: string;
}

const CATEGORIES = ['All', 'Research', 'Clinical Trial', 'Review', 'Case Study', 'General'];

export default function NewsScreen() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [filteredNews, setFilteredNews] = useState<NewsArticle[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchNews();
  }, []);

  useEffect(() => {
    filterNews();
  }, [selectedCategory, searchQuery, news]);

  const fetchNews = async () => {
    try {
      setRefreshing(true);
      const response = await axios.get(`${API_URL}/medical-news/latest`);
      setNews(response.data);
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const filterNews = () => {
    let filtered = news;

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(
        (article) => article.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (article) =>
          article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          article.keywords.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredNews(filtered);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      research: '#2196F3',
      'clinical trial': '#9C27B0',
      review: '#FF9800',
      'case study': '#4CAF50',
      general: '#607D8B',
    };
    return colors[category.toLowerCase()] || '#607D8B';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Medical News</Text>
          <Text style={styles.headerSubtitle}>Latest research & health updates</Text>
        </View>
        <TouchableOpacity onPress={fetchNews} disabled={refreshing}>
          <Ionicons
            name="refresh"
            size={24}
            color="#fff"
            style={refreshing ? styles.rotating : {}}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by keywords..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
        {CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              selectedCategory === category && styles.categoryButtonActive,
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category && styles.categoryTextActive,
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.newsList}>
        {filteredNews.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="newspaper-outline" size={80} color="#ccc" />
            <Text style={styles.emptyText}>No articles found</Text>
            <Text style={styles.emptySubtext}>Try changing your filters</Text>
          </View>
        ) : (
          filteredNews.map((article) => (
            <View key={article._id} style={styles.newsCard}>
              <View style={styles.newsHeader}>
                <View
                  style={[
                    styles.categoryBadge,
                    { backgroundColor: getCategoryColor(article.category) },
                  ]}
                >
                  <Text style={styles.categoryBadgeText}>{article.category}</Text>
                </View>
                <Text style={styles.newsDate}>
                  {new Date(article.publicationDate).toLocaleDateString()}
                </Text>
              </View>

              <Text style={styles.newsTitle}>{article.title}</Text>

              <View style={styles.authorsContainer}>
                <Ionicons name="person" size={14} color="#666" />
                <Text style={styles.authorsText}>
                  {article.authors.slice(0, 3).join(', ')}
                  {article.authors.length > 3 && ` +${article.authors.length - 3} more`}
                </Text>
              </View>

              <View style={styles.aiSummaryBox}>
                <View style={styles.aiHeader}>
                  <Ionicons name="sparkles" size={16} color="#9C27B0" />
                  <Text style={styles.aiLabel}>AI Summary</Text>
                </View>
                <Text style={styles.aiSummaryText}>{article.aiSummary}</Text>
              </View>

              <View style={styles.keywordsContainer}>
                {article.keywords.slice(0, 4).map((keyword, index) => (
                  <View key={index} style={styles.keywordTag}>
                    <Text style={styles.keywordText}>{keyword}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity style={styles.readMoreButton}>
                <Text style={styles.readMoreText}>Read Full Article</Text>
                <Ionicons name="arrow-forward" size={16} color="#2196F3" />
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2196F3',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginTop: 5,
  },
  rotating: {
    // Add animation if needed
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 15,
    marginBottom: 10,
    padding: 12,
    borderRadius: 25,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  categoriesContainer: {
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  categoryButtonActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  categoryText: {
    color: '#666',
    fontWeight: 'bold',
  },
  categoryTextActive: {
    color: '#fff',
  },
  newsList: {
    flex: 1,
    padding: 15,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 50,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#999',
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 5,
  },
  newsCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
  },
  newsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  newsDate: {
    fontSize: 12,
    color: '#999',
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  authorsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  authorsText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
  },
  aiSummaryBox: {
    backgroundColor: '#F3E5F5',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  aiLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#9C27B0',
    marginLeft: 5,
  },
  aiSummaryText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  keywordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  keywordTag: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6,
  },
  keywordText: {
    fontSize: 11,
    color: '#1976D2',
  },
  readMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  readMoreText: {
    color: '#2196F3',
    fontWeight: 'bold',
    marginRight: 5,
  },
});
