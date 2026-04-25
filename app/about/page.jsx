export const metadata = {
  title: 'About | NepAI',
  description: 'Learn more about NepAI and our mission.',
}

export default function AboutPage() {
  return (
    <section className="mx-auto w-full max-w-3xl px-6 py-12 text-gray-800">
      <h1 className="text-3xl font-bold text-gray-900">About NepAI</h1>
      <p className="mt-4 text-base leading-7 text-gray-700">
        NepAI is built to make AI chat simple, reliable, and useful for everyday
        tasks. We focus on a clean experience and practical responses.
      </p>
    </section>
  )
}
