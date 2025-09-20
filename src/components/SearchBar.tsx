'use client'

import { useState, useEffect } from 'react'
import { Search, X, History } from 'lucide-react'

interface SearchBarProps {
  onSearch?: (query: string) => void
  onTagSelect?: (tag: string) => void
  placeholder?: string
}

export default function SearchBar({ 
  onSearch, 
  // onTagSelect, // 暂时未使用
  placeholder = "搜索视频标题、描述或日期..." 
}: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [showHistory, setShowHistory] = useState(false)
  const [searchHistory, setSearchHistory] = useState<string[]>([])

  // 从 localStorage 加载搜索历史
  useEffect(() => {
    const savedHistory = localStorage.getItem('video-search-history')
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory))
      } catch (error) {
        console.error('解析搜索历史失败:', error)
      }
    }
  }, [])

  // 保存搜索历史到 localStorage
  const saveSearchHistory = (newHistory: string[]) => {
    localStorage.setItem('video-search-history', JSON.stringify(newHistory))
    setSearchHistory(newHistory)
  }

  // 添加搜索记录
  const addToHistory = (searchQuery: string) => {
    if (!searchQuery.trim()) return
    
    const newHistory = [searchQuery, ...searchHistory.filter(item => item !== searchQuery)]
      .slice(0, 8) // 最多保存8条历史记录
    
    saveSearchHistory(newHistory)
  }

  // 清空搜索历史
  const clearHistory = () => {
    localStorage.removeItem('video-search-history')
    setSearchHistory([])
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (onSearch && query.trim()) {
      addToHistory(query.trim())
      onSearch(query.trim())
    }
  }

  const handleHistoryClick = (historyItem: string) => {
    setQuery(historyItem)
    if (onSearch) {
      onSearch(historyItem)
    }
    setShowHistory(false)
  }

  const clearSearch = () => {
    setQuery('')
    if (onSearch) {
      onSearch('')
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-2">
      {/* Search Input */}
      <form onSubmit={handleSearch} className="relative">
        <div className="relative">
          <Search className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-10 md:pl-12 pr-16 md:pr-20 py-3 md:py-4 text-base md:text-lg border border-gray-300 dark:border-gray-600 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 shadow-lg"
          />
          <div className="absolute right-1 md:right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1 md:space-x-2">
            {query && (
              <button
                type="button"
                onClick={clearSearch}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                aria-label="清空搜索"
              >
                <X className="w-3 h-3 md:w-4 md:h-4 text-gray-400" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowHistory(!showHistory)}
              className="p-1.5 md:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              title="搜索历史"
            >
              <History className="w-3 h-3 md:w-4 md:h-4 text-gray-400" />
            </button>
            <button
              type="submit"
              className="px-3 md:px-4 py-1.5 md:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg md:rounded-xl transition-colors font-medium text-sm md:text-base"
            >
              搜索
            </button>
          </div>
        </div>
      </form>

      {/* Search History Panel */}
      {showHistory && (
        <div className="mt-3 md:mt-4 p-3 md:p-4 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2 md:mb-3">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              搜索历史
            </h3>
            {searchHistory.length > 0 && (
              <button
                onClick={clearHistory}
                className="text-xs text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              >
                清空
              </button>
            )}
          </div>
          
          {searchHistory.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 md:gap-2">
              {searchHistory.map((historyItem, index) => (
                <button
                  key={index}
                  onClick={() => handleHistoryClick(historyItem)}
                  className="px-2.5 md:px-3 py-1 md:py-1.5 text-xs md:text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-700 dark:hover:text-blue-300 transition-colors active:scale-95 flex items-center space-x-1"
                >
                  <History className="w-2.5 h-2.5" />
                  <span className="truncate max-w-20 sm:max-w-none">{historyItem}</span>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 text-center py-2">
              暂无搜索历史
            </p>
          )}
        </div>
      )}
    </div>
  )
}