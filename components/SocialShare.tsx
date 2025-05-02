// components/SocialShare.tsx
import { motion } from 'framer-motion'
import { useState } from 'react'
import { playSound } from '@/lib/soundManager'

interface SocialShareProps {
  score?: number;
  customMessage?: string;
  showTitle?: boolean;
  compact?: boolean;
  platforms?: ('twitter' | 'facebook' | 'whatsapp' | 'copy')[];
}

export default function SocialShare({ 
  score = 0, 
  customMessage,
  showTitle = true,
  compact = false,
  platforms = ['twitter', 'facebook', 'whatsapp', 'copy']
}: SocialShareProps) {
  const [copied, setCopied] = useState(false)
  const [shareFailed, setShareFailed] = useState(false)
  
  // Default share message
  const defaultMessage = `I just scored ${score} points in Escape from Diddy! 🧠🔥 Can you beat me?`
  
  // Use custom message if provided, otherwise use default
  const shareText = encodeURIComponent(customMessage || defaultMessage)
  const shareUrl = encodeURIComponent('https://diddysgonemath.com')
  
  // Generate platform URLs
  const platformUrls = {
    twitter: `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&quote=${shareText}`,
    whatsapp: `https://wa.me/?text=${shareText}%20${shareUrl}`
  }
  
  // Handle share action with error handling
  const handleShare = (platform: 'twitter' | 'facebook' | 'whatsapp' | 'copy') => {
    playSound('click')
    
    try {
      // For copy to clipboard platform
      if (platform === 'copy') {
        const textToCopy = decodeURIComponent(shareText) + ' ' + decodeURIComponent(shareUrl)
        navigator.clipboard.writeText(textToCopy)
          .then(() => {
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
          })
          .catch(err => {
            console.error('Failed to copy text:', err)
            setShareFailed(true)
            setTimeout(() => setShareFailed(false), 2000)
          })
        return
      }
      
      // For social platforms
      const url = platformUrls[platform]
      
      // Try to use the Web Share API first if available
      if (platform === 'whatsapp' && navigator.share) {
        navigator.share({
          title: 'Escape from Diddy',
          text: decodeURIComponent(shareText),
          url: decodeURIComponent(shareUrl)
        }).catch(err => {
          console.error('Error sharing:', err)
          // Fallback to opening URL
          window.open(url, '_blank')
        })
      } else {
        // Open platform-specific share URL
        window.open(url, '_blank', 'noopener,noreferrer')
      }
    } catch (error) {
      console.error(`Error sharing to ${platform}:`, error)
      setShareFailed(true)
      setTimeout(() => setShareFailed(false), 2000)
    }
  }
  
  // Platform icons and colors
  const platformConfig = {
    twitter: {
      icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>,
      text: compact ? '' : 'Twitter',
      bgColor: 'bg-blue-400 hover:bg-blue-500',
      ariaLabel: 'Share on Twitter'
    },
    facebook: {
      icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>,
      text: compact ? '' : 'Facebook',
      bgColor: 'bg-blue-600 hover:bg-blue-700',
      ariaLabel: 'Share on Facebook'
    },
    whatsapp: {
      icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>,
      text: compact ? '' : 'WhatsApp',
      bgColor: 'bg-green-500 hover:bg-green-600',
      ariaLabel: 'Share on WhatsApp'
    },
    copy: {
      icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" /></svg>,
      text: compact ? '' : 'Copy Link',
      bgColor: 'bg-gray-600 hover:bg-gray-700',
      ariaLabel: 'Copy to clipboard'
    }
  }

  // Define container and button animations
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }
  
  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 }
  }

  return (
    <motion.div 
      className="flex flex-col items-center gap-4 mt-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      aria-label="Share your score"
    >
      {showTitle && (
        <motion.h2 
          className="text-xl font-bold text-mathGreen flex items-center gap-2"
          variants={buttonVariants}
        >
          <span className="animate-pulse">📢</span> Share Your Score!
        </motion.h2>
      )}
      
      <div className={`flex ${compact ? 'gap-3' : 'gap-4 flex-wrap justify-center'}`}>
        {platforms.map(platform => (
          <motion.button
            key={platform}
            className={`${platformConfig[platform].bgColor} text-white ${
              compact ? 'p-2 rounded-full' : 'px-4 py-2 rounded-lg shadow-md'
            } flex items-center gap-2 relative`}
            onClick={() => handleShare(platform)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            variants={buttonVariants}
            aria-label={platformConfig[platform].ariaLabel}
          >
            <span className="flex items-center justify-center">
              {platformConfig[platform].icon}
            </span>
            {platformConfig[platform].text && (
              <span className="font-medium">{platformConfig[platform].text}</span>
            )}
            
            {/* Special indicator for copy button */}
            {platform === 'copy' && copied && (
              <motion.div
                className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-80 text-white text-xs py-1 px-2 rounded"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                Copied!
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>
      
      {/* Error message */}
      {shareFailed && (
        <motion.div
          className="text-red-400 text-sm mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          Failed to share. Please try again.
        </motion.div>
      )}
    </motion.div>
  )
}