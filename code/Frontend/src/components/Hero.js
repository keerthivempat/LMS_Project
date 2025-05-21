import React from 'react';
import { GraduationCap, ArrowRight } from 'lucide-react';

export function Hero({ isLoggedIn }) {
  return (
    <div className="relative min-h-screen w-full flex items-center">
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1727473704473-e4fe94b45b96?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8ZWR1Y2F0aW9uJTIwZm9yJTIwYWxsfGVufDB8fDB8fHww?q=80&w=2970&auto=format&fit=crop')",
        }}
      />

      {/* Gradient overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50 z-10" />

      {/* Navigation Bar */}
      <nav className="absolute top-0 w-full z-30 px-6 py-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-10 w-10 text-white" />
            <span className="text-white font-bold text-2xl">Eklavya Foundation</span>
          </div>

          {!isLoggedIn && (
            <div className="flex space-x-4">
              <button
                className="px-6 py-2.5 flex rounded font-semibold text-white bg-white/10 hover:bg-white/20 items-center gap-2 transition-all duration-300"
                onClick={() => {
                  window.location.href = "/auth";
                }}
              >
                Login
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                className="px-6 py-2.5 rounded font-semibold text-brown bg-yellow hover:bg-yellow-600 transition-all duration-300 flex items-center gap-2 group"
                onClick={() => {
                  window.location.href = "/auth";
                }}
              >
                Register
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-6 relative z-20">
        <div className="max-w-4xl">
          <div className="space-y-8">
            <div className="space-y-4">
              <p className="text-gray-300 text-xl md:text-2xl max-w-2xl animate-fade-in">
                Empowering minds through accessible, quality education for everyone, everywhere.
              </p>
            </div>
            {! isLoggedIn && (                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 
            <div className="flex flex-wrap gap-4">
              <button className="px-8 py-3 rounded font-semibold text-brown bg-yellow hover:bg-yellow-700 transition-all duration-300 flex items-center gap-2 group" onClick={()=>{window.location.href = "/auth"}}>
                Get Started
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-8 py-3 rounded font-semibold text-white bg-white/10 hover:bg-white/20 transition-all duration-300" onClick={()=>{window.location.href = "https://www.eklavya.in/"}}>
                Learn More
              </button>
            </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
