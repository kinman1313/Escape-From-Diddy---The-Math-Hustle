// pages/_app.tsx
import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { AuthProvider } from '@/components/AuthProvider'
import { GameProvider } from '@/components/GameProvider'
import ImageEvents from '@/components/ImageEvents'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Escape from Diddy</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Math, Memes, and Mayhem. Escape from Diddy." />
        <link rel="icon" href="/favicon.ico" />
        {/* Add the audio preload link here */}
        <link rel="preload" href="/sounds/everybyoutake.mp3" as="audio" />
      </Head>
      <AuthProvider>
        <GameProvider>
          <main className="min-h-screen bg-black text-white font-sans antialiased">
            <Component {...pageProps} />
            <ImageEvents />
          </main>
        </GameProvider>
      </AuthProvider>
    </>
  )
}