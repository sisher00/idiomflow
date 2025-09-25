import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Heart, 
  Copy, 
  Share2, 
  Filter, 
  Sun, 
  Moon, 
  Menu, 
  X, 
  ChevronDown,
  Star,
  BookOpen,
  Award,
  Mail,
  Phone,
  MapPin,
  Send,
  HelpCircle,
  Plus,
  Minus,
  ExternalLink,
  Sparkles,
  Zap,
  TrendingUp,
  Brain,
  Target
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function App() {
  // State management
  const [idioms, setIdioms] = useState([]);
  const [filteredIdioms, setFilteredIdioms] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [sortBy, setSortBy] = useState('alphabetical');
  const [favorites, setFavorites] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [selectedIdiom, setSelectedIdiom] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [difficulties, setDifficulties] = useState([]);
  const [stats, setStats] = useState({});
  const [activeSection, setActiveSection] = useState('idioms');
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(true);

  // FAQ data
  const faqData = [
    {
      question: "What is IdiomFlow?",
      answer: "IdiomFlow is an interactive educational platform designed to help you learn and master English idioms. Created by Sisher Pant, CEO of LinkFlow IT Tech Company, this application features over 1000 carefully curated idioms with detailed explanations, examples, and origins."
    },
    {
      question: "How do I search for idioms?",
      answer: "Use the search bar to find idioms by their name or meaning. The search feature highlights matching keywords and provides instant results with smooth animations."
    },
    {
      question: "Can I save my favorite idioms?",
      answer: "Yes! Click the heart icon on any idiom card to add it to your favorites. Your favorites are saved locally and will persist across sessions."
    },
    {
      question: "What are the difficulty levels?",
      answer: "Idioms are categorized into Easy, Medium, and Hard levels based on their complexity and common usage in English."
    },
    {
      question: "How can I share idioms?",
      answer: "Each idiom has share and copy buttons. You can copy the idiom text to your clipboard or share it using your device's sharing options."
    }
  ];

  const [expandedFaq, setExpandedFaq] = useState(null);

  // Load data on component mount
  useEffect(() => {
    loadInitialData();
    loadFavorites();
    loadTheme();
  }, []);

  // Load initial data from API
  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [idiomsRes, categoriesRes, difficultiesRes, statsRes] = await Promise.all([
        axios.get(`${API}/idioms`),
        axios.get(`${API}/categories`),
        axios.get(`${API}/difficulties`),
        axios.get(`${API}/stats`)
      ]);

      setIdioms(idiomsRes.data);
      setFilteredIdioms(idiomsRes.data);
      setCategories(categoriesRes.data.categories);
      setDifficulties(difficultiesRes.data.difficulties);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load idioms data');
    } finally {
      setLoading(false);
    }
  };

  // Load favorites from localStorage
  const loadFavorites = () => {
    const savedFavorites = localStorage.getItem('idiomflow-favorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  };

  // Load theme from localStorage
  const loadTheme = () => {
    const savedTheme = localStorage.getItem('idiomflow-theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  };

  // Filter and sort idioms
  useEffect(() => {
    let filtered = [...idioms];

    console.log('Filtering idioms:', { 
      totalIdioms: idioms.length, 
      searchQuery, 
      selectedCategory, 
      selectedDifficulty, 
      sortBy 
    });

    // Search filter
    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(idiom => 
        idiom.idiom.toLowerCase().includes(query) || 
        idiom.meaning.toLowerCase().includes(query) ||
        idiom.example.toLowerCase().includes(query)
      );
      console.log(`After search filter: ${filtered.length} idioms`);
    }

    // Category filter
    if (selectedCategory && selectedCategory !== '') {
      filtered = filtered.filter(idiom => idiom.category === selectedCategory);
      console.log(`After category filter: ${filtered.length} idioms`);
    }

    // Difficulty filter
    if (selectedDifficulty && selectedDifficulty !== '') {
      filtered = filtered.filter(idiom => idiom.difficulty_level === selectedDifficulty);
      console.log(`After difficulty filter: ${filtered.length} idioms`);
    }

    // Sorting
    switch (sortBy) {
      case 'alphabetical':
        filtered.sort((a, b) => a.idiom.localeCompare(b.idiom));
        break;
      case 'difficulty':
        const difficultyOrder = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };
        filtered.sort((a, b) => difficultyOrder[a.difficulty_level] - difficultyOrder[b.difficulty_level]);
        break;
      case 'random':
        filtered = filtered.sort(() => Math.random() - 0.5);
        break;
      default:
        break;
    }

    console.log(`Final filtered result: ${filtered.length} idioms`);
    setFilteredIdioms(filtered);
  }, [idioms, searchQuery, selectedCategory, selectedDifficulty, sortBy]);

  // Toggle favorite
  const toggleFavorite = (idiom) => {
    const newFavorites = favorites.includes(idiom.id)
      ? favorites.filter(id => id !== idiom.id)
      : [...favorites, idiom.id];
    
    setFavorites(newFavorites);
    localStorage.setItem('idiomflow-favorites', JSON.stringify(newFavorites));
    
    toast.success(
      favorites.includes(idiom.id) 
        ? 'Removed from favorites!' 
        : 'Added to favorites!',
      { position: 'top-right', autoClose: 2000 }
    );
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('idiomflow-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('idiomflow-theme', 'light');
    }
  };

  // Copy to clipboard
  const copyToClipboard = async (text) => {
    try {
      // Try modern clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard!', { position: 'top-right', autoClose: 2000 });
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
          document.execCommand('copy');
          toast.success('Copied to clipboard!', { position: 'top-right', autoClose: 2000 });
        } catch (err) {
          toast.error('Copy not supported', { position: 'top-right', autoClose: 2000 });
        } finally {
          textArea.remove();
        }
      }
    } catch (err) {
      console.error('Copy failed:', err);
      // Final fallback - just show the text in an alert
      alert(`Copy this text:\n\n${text}`);
      toast.info('Text ready to copy manually', { position: 'top-right', autoClose: 3000 });
    }
  };

  // Share idiom
  const shareIdiom = (idiom) => {
    const text = `"${idiom.idiom}" - ${idiom.meaning}\n\nExample: ${idiom.example}\n\nLearn more at IdiomFlow!`;
    
    if (navigator.share) {
      navigator.share({
        title: idiom.idiom,
        text: text,
      });
    } else {
      copyToClipboard(text);
    }
  };

  // Handle contact form submission
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await fetch('https://formspree.io/f/myzdyara', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactForm)
      });
      
      toast.success('Message sent successfully!', { position: 'top-right' });
      setContactForm({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      toast.error('Failed to send message. Please try again.', { position: 'top-right' });
    }
  };

  // Highlight search text
  const highlightText = (text, query) => {
    if (!query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} className="bg-yellow-200 dark:bg-yellow-600 px-1 rounded">
          {part}
        </span>
      ) : part
    );
  };

  // Get favorite idioms
  const favoriteIdioms = useMemo(() => {
    return idioms.filter(idiom => favorites.includes(idiom.id));
  }, [idioms, favorites]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Loading IdiomFlow...</h2>
          <p className="text-gray-600 dark:text-gray-300">Preparing your magical learning experience</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode 
        ? 'dark bg-gray-900 text-white' 
        : 'bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 text-gray-900'
    }`}>
      
      {/* Header */}
      <motion.header 
        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <motion.div 
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <motion.div 
              className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <BookOpen className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                IdiomFlow
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">By Sisher Pant • LinkFlow IT Tech</p>
            </div>
          </motion.div>

          <div className="flex items-center space-x-4">
            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              {[
                { id: 'idioms', label: 'Idioms', icon: BookOpen },
                { id: 'about', label: 'About', icon: Star },
                { id: 'support', label: 'Support', icon: HelpCircle }
              ].map(({ id, label, icon: Icon }) => (
                <motion.button
                  key={id}
                  onClick={() => setActiveSection(id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                    activeSection === id 
                      ? 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </motion.button>
              ))}
            </nav>

            {/* Theme Toggle */}
            <motion.button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <motion.div
                key={darkMode ? 'moon' : 'sun'}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </motion.div>
            </motion.button>

            {/* Mobile Menu */}
            <motion.button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 rounded-lg bg-gray-100 dark:bg-gray-700"
              whileTap={{ scale: 0.9 }}
            >
              <Menu className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </motion.header>

      <div className="flex">
        {/* Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              className="fixed md:sticky top-16 left-0 w-80 h-screen bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-r border-gray-200 dark:border-gray-700 overflow-y-auto z-40"
              initial={{ x: -320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -320, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="p-6 space-y-6">
                {/* Stats Cards */}
                <motion.div 
                  className="grid grid-cols-2 gap-4"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg p-4 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm opacity-90">Total Idioms</p>
                        <p className="text-2xl font-bold">{stats.total_idioms || 0}</p>
                      </div>
                      <Brain className="w-8 h-8 opacity-70" />
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg p-4 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm opacity-90">Favorites</p>
                        <p className="text-2xl font-bold">{favorites.length}</p>
                      </div>
                      <Heart className="w-8 h-8 opacity-70" />
                    </div>
                  </div>
                </motion.div>

                {/* Search */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Search Idioms
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by idiom or meaning..."
                      className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    {searchQuery && (
                      <motion.button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-3 w-5 h-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <X className="w-4 h-4" />
                      </motion.button>
                    )}
                  </div>
                </motion.div>

                {/* Filters */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </motion.div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Difficulty
                  </label>
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">All Levels</option>
                    {difficulties.map(difficulty => (
                      <option key={difficulty} value={difficulty}>{difficulty}</option>
                    ))}
                  </select>
                </motion.div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="alphabetical">Alphabetical</option>
                    <option value="difficulty">Difficulty</option>
                    <option value="random">Random</option>
                  </select>
                </motion.div>

                {/* Reset Filters */}
                {(searchQuery || selectedCategory || selectedDifficulty || sortBy !== 'alphabetical') && (
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    <motion.button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('');
                        setSelectedDifficulty('');
                        setSortBy('alphabetical');
                        toast.info('Filters cleared!', { position: 'top-right', autoClose: 2000 });
                      }}
                      className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center space-x-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <X className="w-4 h-4" />
                      <span>Clear Filters</span>
                    </motion.button>
                  </motion.div>
                )}

                {/* Favorites */}
                {favoriteIdioms.length > 0 && (
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3 flex items-center">
                      <Heart className="w-5 h-5 mr-2 text-red-500" />
                      Favorites
                    </h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {favoriteIdioms.slice(0, 5).map(idiom => (
                        <motion.div
                          key={idiom.id}
                          className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                          onClick={() => {
                            setSelectedIdiom(idiom);
                            setModalOpen(true);
                          }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                            {idiom.idiom}
                          </p>
                        </motion.div>
                      ))}
                      {favoriteIdioms.length > 5 && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          +{favoriteIdioms.length - 5} more favorites
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {activeSection === 'idioms' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-6">
                <motion.h2 
                  className="text-3xl font-bold text-gray-800 dark:text-white mb-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Discover Amazing Idioms
                </motion.h2>
                <motion.p 
                  className="text-gray-600 dark:text-gray-300"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  Showing {filteredIdioms.length} of {idioms.length} idioms
                </motion.p>
              </div>

              {/* Idioms Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {filteredIdioms.map((idiom, index) => (
                    <motion.div
                      key={idiom.id}
                      className="group bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700"
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                      whileHover={{ 
                        y: -8,
                        transition: { type: "spring", stiffness: 300 }
                      }}
                      layout
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <motion.div 
                            className="flex-1"
                            whileHover={{ scale: 1.02 }}
                          >
                            <h3 className="text-lg font-bold text-purple-600 dark:text-purple-400 mb-2 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">
                              {highlightText(idiom.idiom, searchQuery)}
                            </h3>
                            <div className="flex items-center space-x-2 mb-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                idiom.difficulty_level === 'Easy' 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  : idiom.difficulty_level === 'Medium'
                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              }`}>
                                {idiom.difficulty_level}
                              </span>
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                                {idiom.category}
                              </span>
                            </div>
                          </motion.div>
                          
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(idiom);
                            }}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Heart 
                              className={`w-5 h-5 transition-colors ${
                                favorites.includes(idiom.id)
                                  ? 'text-red-500 fill-current'
                                  : 'text-gray-400'
                              }`}
                            />
                          </motion.button>
                        </div>

                        <p className="text-gray-700 dark:text-gray-300 mb-3 text-sm leading-relaxed">
                          {highlightText(idiom.meaning, searchQuery)}
                        </p>

                        <p className="text-gray-600 dark:text-gray-400 text-sm italic mb-4">
                          "{idiom.example}"
                        </p>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                          <motion.button
                            onClick={() => {
                              setSelectedIdiom(idiom);
                              setModalOpen(true);
                            }}
                            className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium text-sm"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            Learn More
                          </motion.button>
                          
                          <div className="flex space-x-2">
                            <motion.button
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(`"${idiom.idiom}" - ${idiom.meaning}`);
                              }}
                              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Copy className="w-4 h-4" />
                            </motion.button>
                            
                            <motion.button
                              onClick={(e) => {
                                e.stopPropagation();
                                shareIdiom(idiom);
                              }}
                              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Share2 className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {filteredIdioms.length === 0 && (
                <motion.div 
                  className="text-center py-16"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                    No idioms found
                  </h3>
                  <p className="text-gray-500 dark:text-gray-500">
                    Try adjusting your search or filter criteria
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}

          {activeSection === 'about' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-4xl mx-auto"
            >
              <motion.div 
                className="text-center mb-12"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <motion.div
                  className="w-24 h-24 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full mx-auto mb-6 flex items-center justify-center"
                  whileHover={{ scale: 1.1, rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <Sparkles className="w-12 h-12 text-white" />
                </motion.div>
                
                <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
                  About IdiomFlow
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                  A magical, interactive platform designed to revolutionize how you learn and master English idioms.
                </p>
              </motion.div>

              <div className="grid md:grid-cols-2 gap-8 mb-12">
                <motion.div
                  className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-100 dark:border-gray-700"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  whileHover={{ y: -5 }}
                >
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
                    <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3">Our Mission</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    To make learning English idioms engaging, interactive, and accessible for students worldwide. 
                    IdiomFlow combines cutting-edge technology with educational excellence to create an 
                    unforgettable learning experience.
                  </p>
                </motion.div>

                <motion.div
                  className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-100 dark:border-gray-700"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  whileHover={{ y: -5 }}
                >
                  <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mb-4">
                    <Zap className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3">Innovation</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Built with modern web technologies including React, Framer Motion, and Tailwind CSS, 
                    IdiomFlow delivers smooth animations, responsive design, and an intuitive user experience 
                    across all devices.
                  </p>
                </motion.div>
              </div>

              <motion.div
                className="bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl p-8 text-white mb-12"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="text-center">
                  <Award className="w-16 h-16 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-3">Created by Sisher Pant</h3>
                  <p className="text-lg opacity-90 mb-4">
                    Founder & CEO of LinkFlow IT Tech Company
                  </p>
                  <p className="opacity-80 max-w-2xl mx-auto">
                    This application represents the dedication to educational excellence and innovation in technology. 
                    Designed specifically for scholarship applications, IdiomFlow showcases the power of 
                    combining education with cutting-edge web development.
                  </p>
                </div>
              </motion.div>

              <motion.div
                className="text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                  LinkFlow IT Tech Company
                </h3>
                <div className="grid md:grid-cols-3 gap-6">
                  {[
                    { 
                      icon: TrendingUp, 
                      title: "Innovation", 
                      desc: "Leading the way in educational technology solutions" 
                    },
                    { 
                      icon: Brain, 
                      title: "Excellence", 
                      desc: "Committed to delivering high-quality learning experiences" 
                    },
                    { 
                      icon: Target, 
                      title: "Impact", 
                      desc: "Empowering students worldwide through technology" 
                    }
                  ].map(({ icon: Icon, title, desc }, index) => (
                    <motion.div
                      key={title}
                      className="text-center"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                    >
                      <motion.div
                        className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center"
                        whileHover={{ scale: 1.1, rotate: 360 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Icon className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                      </motion.div>
                      <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">{title}</h4>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">{desc}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}

          {activeSection === 'support' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-4xl mx-auto"
            >
              <motion.div 
                className="text-center mb-12"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
                  Support & FAQ
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-300">
                  Get help and find answers to common questions
                </p>
              </motion.div>

              <div className="grid lg:grid-cols-2 gap-8">
                {/* FAQ Section */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                    Frequently Asked Questions
                  </h3>
                  
                  <div className="space-y-4">
                    {faqData.map((faq, index) => (
                      <motion.div
                        key={index}
                        className="bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 overflow-hidden"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                      >
                        <motion.button
                          onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                          className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          whileHover={{ scale: 1.01 }}
                        >
                          <span className="font-medium text-gray-800 dark:text-white">
                            {faq.question}
                          </span>
                          <motion.div
                            animate={{ rotate: expandedFaq === index ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          </motion.div>
                        </motion.button>
                        
                        <AnimatePresence>
                          {expandedFaq === index && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <div className="px-6 pb-4 text-gray-600 dark:text-gray-300">
                                {faq.answer}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Contact Form */}
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-100 dark:border-gray-700">
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                      Contact Us
                    </h3>
                    
                    <form onSubmit={handleContactSubmit} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Name
                          </label>
                          <input
                            type="text"
                            value={contactForm.name}
                            onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                            required
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Email
                          </label>
                          <input
                            type="email"
                            value={contactForm.email}
                            onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                            required
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Subject
                        </label>
                        <input
                          type="text"
                          value={contactForm.subject}
                          onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                          required
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Message
                        </label>
                        <textarea
                          value={contactForm.message}
                          onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                          required
                          rows="4"
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      
                      <motion.button
                        type="submit"
                        className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white py-3 px-6 rounded-lg font-medium hover:from-purple-600 hover:to-indigo-600 transition-colors flex items-center justify-center space-x-2"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Send className="w-5 h-5" />
                        <span>Send Message</span>
                      </motion.button>
                    </form>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </main>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && selectedIdiom && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h3 className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                    {selectedIdiom.idiom}
                  </h3>
                  <div className="flex items-center space-x-2 mb-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      selectedIdiom.difficulty_level === 'Easy' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : selectedIdiom.difficulty_level === 'Medium'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {selectedIdiom.difficulty_level}
                    </span>
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                      {selectedIdiom.category}
                    </span>
                  </div>
                </div>
                
                <motion.button
                  onClick={() => setModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-6 h-6" />
                </motion.button>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Meaning</h4>
                  <p className="text-gray-700 dark:text-gray-300">{selectedIdiom.meaning}</p>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Example</h4>
                  <p className="text-gray-700 dark:text-gray-300 italic">"{selectedIdiom.example}"</p>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Related Idiom</h4>
                  <p className="text-purple-600 dark:text-purple-400 font-medium">{selectedIdiom.related_idiom}</p>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Origin</h4>
                  <p className="text-gray-700 dark:text-gray-300">{selectedIdiom.origin}</p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <motion.button
                  onClick={() => toggleFavorite(selectedIdiom)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Heart 
                    className={`w-5 h-5 ${
                      favorites.includes(selectedIdiom.id)
                        ? 'text-red-500 fill-current'
                        : 'text-gray-400'
                    }`}
                  />
                  <span className="text-gray-700 dark:text-gray-300">
                    {favorites.includes(selectedIdiom.id) ? 'Remove from Favorites' : 'Add to Favorites'}
                  </span>
                </motion.button>

                <div className="flex space-x-2">
                  <motion.button
                    onClick={() => copyToClipboard(`"${selectedIdiom.idiom}" - ${selectedIdiom.meaning}\n\nExample: ${selectedIdiom.example}`)}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </motion.button>
                  
                  <motion.button
                    onClick={() => shareIdiom(selectedIdiom)}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <motion.footer 
        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 py-8"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <div className="container mx-auto px-4 text-center">
          <motion.div 
            className="flex items-center justify-center space-x-2 mb-4"
            whileHover={{ scale: 1.05 }}
          >
            <span className="text-gray-600 dark:text-gray-300">©</span>
            <span className="font-medium text-gray-800 dark:text-white">IdiomFlow 2025. All Rights Reserved.</span>
          </motion.div>
          <motion.p 
            className="text-gray-500 dark:text-gray-400 text-sm"
            whileHover={{ scale: 1.02 }}
          >
            Powered By LinkFlow IT Tech Company
          </motion.p>
        </div>
      </motion.footer>

      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={darkMode ? "dark" : "light"}
      />
    </div>
  );
}

export default App;