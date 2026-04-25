export const metadata = {
  title: 'Contact | NepAI',
  description: 'Contact the NepAI team.',
}

export default function ContactPage() {
  return (
    <section className="mx-auto w-full max-w-3xl px-6 py-12 text-gray-800">
      <h1 className="text-3xl font-bold text-gray-900">Contact</h1>
      <p className="mt-4 text-base leading-7 text-gray-700">
        Need help or want to share feedback? Reach us at{' '}
        <a className="text-blue-600 hover:underline" href="mailto:hello@nep.pulami.co.uk">
          hello@nep.pulami.co.uk
        </a>
        .
      </p>
    </section>
  )
}
