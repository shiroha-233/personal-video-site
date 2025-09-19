'use client'

import { motion } from 'framer-motion'
import { ExternalLink, Github, Users } from 'lucide-react'

// 自定义B站logo组件 - 模仿官方设计
const BilibiliIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    {/* 主体屏幕框架 */}
    <path d="M5 7c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2H5z" fill="currentColor"/>
    {/* 屏幕显示区域 */}
    <rect x="6" y="10" width="12" height="5" rx="0.5" fill="white" opacity="0.9"/>
    {/* 左上角小耳朵（类似B站吉祥物） */}
    <circle cx="8" cy="5" r="1.2" fill="currentColor"/>
    <path d="M7.5 4.2 C7.2 3.8 7.8 3.4 8.5 4.2" stroke="currentColor" strokeWidth="0.3" fill="none"/>
    {/* 右上角小耳朵 */}
    <circle cx="16" cy="5" r="1.2" fill="currentColor"/>
    <path d="M16.5 4.2 C16.8 3.8 16.2 3.4 15.5 4.2" stroke="currentColor" strokeWidth="0.3" fill="none"/>
    {/* 屏幕上的内容线条（模拟视频内容） */}
    <line x1="7.5" y1="11.5" x2="16.5" y2="11.5" stroke="currentColor" strokeWidth="0.4" opacity="0.6"/>
    <line x1="7.5" y1="12.5" x2="14" y2="12.5" stroke="currentColor" strokeWidth="0.4" opacity="0.6"/>
    <line x1="7.5" y1="13.5" x2="15" y2="13.5" stroke="currentColor" strokeWidth="0.4" opacity="0.6"/>
  </svg>
)

export default function Footer() {
  const links = [
    {
      name: 'B站主页',
      url: 'https://space.bilibili.com/404943467',
      icon: <BilibiliIcon className="w-5 h-5" />,
      color: 'hover:text-pink-500'
    },
    {
      name: 'GitHub',
      url: 'https://github.com/shiroha-233',
      icon: <Github className="w-5 h-5" />,
      color: 'hover:text-gray-600 dark:hover:text-gray-300'
    },
    {
      name: 'MC百科',
      url: 'https://center.mcmod.cn/917050/',
      icon: <ExternalLink className="w-5 h-5" />,
      color: 'hover:text-green-500'
    },
    {
      name: 'QQ群',
      url: '#',
      icon: <Users className="w-5 h-5" />,
      color: 'hover:text-blue-500',
      onClick: (e: React.MouseEvent) => {
        e.preventDefault()
        // 复制QQ群号到剪贴板
        navigator.clipboard.writeText('1056065792').then(() => {
          alert('QQ群号已复制到剪贴板：1056065792')
        }).catch(() => {
          alert('QQ群号：1056065792')
        })
      }
    }
  ]

  return (
    <footer className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-t border-gray-200 dark:border-slate-700 mt-12 sm:mt-16">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="text-center">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
            联系我
          </h3>
          
          <div className="flex justify-center items-center flex-wrap gap-3 sm:gap-6 mb-4 sm:mb-6">
            {links.map((link, index) => (
              <motion.a
                key={link.name}
                href={link.url}
                onClick={link.onClick}
                target={link.url.startsWith('http') ? "_blank" : undefined}
                rel={link.url.startsWith('http') ? "noopener noreferrer" : undefined}
                className={`flex items-center space-x-1 sm:space-x-2 text-gray-600 dark:text-gray-400 transition-colors duration-200 ${link.color} cursor-pointer`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <span className="text-xs sm:text-sm">{link.icon}</span>
                <span className="text-xs sm:text-sm font-medium">{link.name}</span>
              </motion.a>
            ))}
          </div>

          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-slate-700 pt-3 sm:pt-4">
            <p>© 2024 视频资源分享站. All rights reserved.</p>
            <p className="mt-1"></p>
          </div>
        </div>
      </div>
    </footer>
  )
}