import React from 'react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-stone-50 to-rose-50 px-4 py-16">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="font-serif text-4xl sm:text-5xl font-light text-stone-800 mb-4">About Us</h1>
          <div className="w-24 h-1 bg-gradient-to-r from-rose-400 to-pink-400 mx-auto mb-6" />
          <p className="font-sans text-lg text-stone-600 max-w-3xl mx-auto">
            Lavish Ladies Beauty Salon in Uchila has been dedicated to personalized beauty care in a warm and inviting atmosphere since 2018.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <div className="flex items-center space-x-4 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full flex items-center justify-center">
                <span className="font-serif text-xl font-bold text-stone-800">7+</span>
              </div>
              <div>
                <h2 className="font-serif text-2xl font-medium text-stone-800">Years in Business</h2>
                <p className="text-stone-600">Since March 2018</p>
              </div>
            </div>

            <p className="font-sans text-lg text-stone-600 leading-relaxed">
              We offer a complete range of services, including stylish haircuts, vibrant hair coloring, rejuvenating facials, and manicure and pedicure care.
            </p>
            <p className="font-sans text-lg text-stone-600 leading-relaxed">
              Every client receives tailored attention from our team, with a focus on quality, hygiene, and comfort.
            </p>
            <p className="font-sans text-lg text-stone-600 leading-relaxed">
              Visit us in Uchila, Udupi District, and experience premium salon care designed to make you look and feel your best.
            </p>
          </div>

          <div className="relative">
            <div className="aspect-[4/3] bg-gradient-to-br from-rose-100 to-pink-100 rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                alt="Lavish Ladies Beauty Salon interior and styling"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
