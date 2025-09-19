'use client'

import { useState } from 'react'
import VideoGrid from '@/components/VideoGrid';
import Header from '@/components/Header';
import SearchBar from '@/components/SearchBar';
import Footer from '@/components/Footer';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState('')

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setSelectedTag('') // 清空标签筛选
  }

  const handleTagSelect = (tag: string) => {
    setSelectedTag(tag)
    setSearchQuery('') // 清空搜索查询
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-6 md:py-8">
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 md:mb-4 drop-shadow-lg px-2">
            视频资源分享站
          </h1>
          <p className="text-base md:text-lg text-white/90 mb-6 md:mb-8 drop-shadow px-2">
            分享视频内的资源链接
          </p>
          <SearchBar onSearch={handleSearch} onTagSelect={handleTagSelect} />
        </div>
        <VideoGrid searchQuery={searchQuery} selectedTag={selectedTag} />
      </main>
      <Footer />
    </div>
  );
}
