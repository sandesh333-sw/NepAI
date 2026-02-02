import Link from 'next/link'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="w-full bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-8">
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Left: Brand */}
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900">NepAI</span>
            <span className="text-gray-500">·</span>
            <span className="text-sm text-gray-600">AI-powered solutions</span>
          </div>

          {/* Center: Links */}
          <div className="flex items-center gap-6 text-sm">
            <Link href="/about" className="text-gray-600 hover:text-gray-900 transition-colors">
              About
            </Link>
            <Link href="/privacy" className="text-gray-600 hover:text-gray-900 transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-gray-600 hover:text-gray-900 transition-colors">
              Terms
            </Link>
            <Link href="/contact" className="text-gray-600 hover:text-gray-900 transition-colors">
              Contact
            </Link>
          </div>

          {/* Right: Copyright */}
          <div className="text-sm text-gray-600">
            © {currentYear} NepAI. All rights reserved.
          </div>

        </div>

      </div>
    </footer>
  )
}

export default Footer