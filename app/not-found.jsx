export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-gray-50 px-6 text-center">
      
      <h1 className="text-6xl font-bold text-gray-800">404</h1>
      
      <h2 className="mt-4 text-xl font-semibold text-gray-700">
        Page not found
      </h2>

      <p className="mt-2 text-sm text-gray-500 max-w-md">
        The page you're looking for doesn’t exist or has been moved.
      </p>

      <a
        href="/"
        className="mt-6 inline-block rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
      >
        Go back home
      </a>

    </div>
  )
}