import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            PokéCard Collector
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Sell Your Pokémon Cards
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Submit photos of your collection and get quotes from trusted buyers
          </p>
          
          {/* CTA Button */}
          <Link href="/submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg text-lg transition-colors">
            Submit Your Collection
          </Link>
        </div>

        {/* How It Works */}
        <div className="mt-20">
          <h3 className="text-3xl font-bold text-center mb-12">How It Works</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h4 className="text-xl font-semibold mb-2">Upload Photos</h4>
              <p className="text-gray-600">
                Take clear photos of your Pokémon cards and upload them to our secure platform
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h4 className="text-xl font-semibold mb-2">Get Reviewed</h4>
              <p className="text-gray-600">
                Our experts review your collection and assess the value of your cards
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h4 className="text-xl font-semibold mb-2">Receive Offers</h4>
              <p className="text-gray-600">
                Get competitive offers and choose the best deal for your collection
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}