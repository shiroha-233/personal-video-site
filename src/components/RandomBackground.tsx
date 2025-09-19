'use client'

import { useEffect, useState } from 'react'

const backgroundImages = [
  '/backgrounds/1.png',
  '/backgrounds/3.png',
  '/backgrounds/5.png'
]

interface RandomBackgroundProps {
  children: React.ReactNode
}

export default function RandomBackground({ children }: RandomBackgroundProps) {
  const [backgroundImage, setBackgroundImage] = useState<string>('')

  useEffect(() => {
    // 页面加载时随机选择背景图片
    const randomIndex = Math.floor(Math.random() * backgroundImages.length)
    setBackgroundImage(backgroundImages[randomIndex])
  }, [])

  return (
    <div className="relative min-h-screen">
      {/* 背景图片层 */}
      {backgroundImage && (
        <div
          className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${backgroundImage})`,
          }}
        >
          {/* 半透明遮罩层，确保内容可读性 */}
          <div className="absolute inset-0 bg-black/20 dark:bg-black/40" />
        </div>
      )}
      
      {/* 内容层 */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}