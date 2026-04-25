import { SignedOut, SignedIn, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'

const NavBar = () => {
  return (
    <nav className="w-full bg-white border-b border-gray-200">
      <div className="flex items-center justify-between max-w-6xl mx-auto px-6 py-4">

        {/* Left: Logo + Name */}
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Image 
            src="/logo.svg"
            alt="NepAI logo"
            width={40}
            height={40}
          />
          <span className="text-xl font-bold text-gray-900">NepAI</span>
        </Link>

        {/* Right: Auth */}
        <div className="flex items-center gap-3">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="rounded-md bg-gray-900 px-3 py-1.5 text-sm text-white hover:bg-gray-800 transition-colors">
                Sign Up
              </button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <UserButton/>
          </SignedIn>
        </div>

      </div>
    </nav>
  )
}

export default NavBar