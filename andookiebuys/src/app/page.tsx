import Link from 'next/link';
import { Camera, Shield, Zap, ArrowRight, Star, TrendingUp } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-purple-500/5 to-transparent"></div>
      
      {/* Animated background dots */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-blue-400 rounded-full animate-ping"></div>
        <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-purple-300 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/3 right-1/4 w-1 h-1 bg-blue-300 rounded-full animate-ping delay-500"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-black/30 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            AndookieCards
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 py-16">
        {/* Hero Section */}
        <div className="text-center mb-24">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Sell Your
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Pokémon Cards
            </span>
          </h2>
          
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            Submit photos of your collection and connect with trusted buyers. 
            Turn your cards into cash with our secure platform.
          </p>
          
          {/* CTA Button */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/submit" 
              className="group relative bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-4 px-8 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25 flex items-center gap-2"
            >
              <Camera className="w-5 h-5" />
              Submit Your Collection
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <button className="text-gray-300 hover:text-white font-medium py-4 px-8 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300 backdrop-blur-sm">
              Learn More
            </button>
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">How It Works</h3>
            <p className="text-gray-300 text-lg">Simple steps to turn your cards into cash</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="group relative">
              <div className="text-center p-8 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-purple-400/30 transition-all duration-300 hover:transform hover:scale-105">
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg group-hover:shadow-purple-500/25 transition-all duration-300">
                  <Camera className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-semibold mb-4 text-white">Upload Photos</h4>
                <p className="text-gray-300 leading-relaxed">
                  Take clear photos of your Pokémon cards and upload them to our secure platform
                </p>
              </div>
              
              {/* Connecting line */}
              <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-purple-600 to-blue-600 transform -translate-y-1/2"></div>
            </div>
            
            <div className="group relative">
              <div className="text-center p-8 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-blue-400/30 transition-all duration-300 hover:transform hover:scale-105">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg group-hover:shadow-blue-500/25 transition-all duration-300">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-semibold mb-4 text-white">Get Reviewed</h4>
                <p className="text-gray-300 leading-relaxed">
                  Our team reviews your collection and assesses the value of your cards
                </p>
              </div>
              
              {/* Connecting line */}
              <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 transform -translate-y-1/2"></div>
            </div>
            
            <div className="group">
              <div className="text-center p-8 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-pink-400/30 transition-all duration-300 hover:transform hover:scale-105">
                <div className="bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg group-hover:shadow-pink-500/25 transition-all duration-300">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-semibold mb-4 text-white">Receive Offers</h4>
                <p className="text-gray-300 leading-relaxed">
                  Get competitive offers and choose the best deal for your collection
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Section */}
        <div className="text-center p-10 bg-gradient-to-r from-purple-900/20 to-blue-900/20 backdrop-blur-sm rounded-3xl border border-white/10">
          <h3 className="text-2xl font-bold mb-4">Why Choose Us?</h3>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            A trusted platform for selling Pokémon cards with secure transactions and expert evaluations.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3 justify-center">
              <Shield className="w-5 h-5 text-green-400" />
              <span className="text-gray-300">Secure & Safe</span>
            </div>
            <div className="flex items-center gap-3 justify-center">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span className="text-gray-300">Fast Processing</span>
            </div>
            <div className="flex items-center gap-3 justify-center">
              <Star className="w-5 h-5 text-purple-400" />
              <span className="text-gray-300">Expert Reviews</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}