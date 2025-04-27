// components/NavBar.tsx
import Link from 'next/link'

export default function NavBar() {
  return (
    <nav className="w-full flex justify-center bg-midnight text-mathGreen py-4 gap-6 text-lg font-semibold shadow-md">
      <Link href="/game">
        <a className="hover:underline">Game</a>
      </Link>
      <Link href="/closet">
        <a className="hover:underline">Closet</a>
      </Link>
    </nav>
  )
}
