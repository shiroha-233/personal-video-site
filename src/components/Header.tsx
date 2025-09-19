'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-1.5 sm:space-x-2 min-w-0">
            {/* 使用Shiroha的头像作为logo */}
            <Image 
              src="/shiroha.png" 
              alt="Shiroha Logo" 
              width={40} 
              height={40} 
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-200 flex-shrink-0"
              onError={(e) => {
                // 如果图片加载失败，显示默认logo
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = target.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
            {/* 备用logo（当图片加载失败时显示） */}
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-pink-500 to-violet-600 rounded-full flex items-center justify-center shadow-lg flex-shrink-0" style={{display: 'none'}}>
              <span className="text-white font-bold text-xs sm:text-sm">SH</span>
            </div>
            <span className="font-bold text-base sm:text-xl text-gray-900 dark:text-white truncate">
              <span className="hidden sm:inline">Shiroha的视频资源</span>
              <span className="sm:hidden">视频资源</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/" 
              className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              首页
            </Link>
            <Link 
              href="/about" 
              className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              关于
            </Link>
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="切换菜单"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-3 sm:py-4 border-t border-gray-200 dark:border-gray-700">
            <nav className="flex flex-col space-y-3 sm:space-y-4">
              <Link 
                href="/" 
                className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-1"
                onClick={() => setIsMenuOpen(false)}
              >
                首页
              </Link>
              <Link 
                href="/about" 
                className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-1"
                onClick={() => setIsMenuOpen(false)}
              >
                关于
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}