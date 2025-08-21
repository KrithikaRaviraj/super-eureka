import React from 'react';

export default function Testimonials({ testimonials }) {
  if (testimonials.length === 0) return null;

  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-serif text-4xl sm:text-5xl font-light text-stone-800 mb-4">What Our Clients Say</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-rose-400 to-pink-400 mx-auto mb-6"></div>
          <p className="font-sans text-lg text-stone-600 max-w-2xl mx-auto">Read what our valued clients have to say about their experience at Lavish Ladies.</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-stone-200/50">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full flex items-center justify-center mr-4">
                  <span className="font-serif text-lg font-medium text-stone-800">
                    {testimonial.userName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h4 className="font-serif text-lg font-medium text-stone-800">{testimonial.userName}</h4>
                  <p className="text-stone-600 text-sm">{testimonial.service}</p>
                </div>
              </div>
              
              <div className="flex items-center mb-3">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className={`w-4 h-4 ${i < testimonial.overallRating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                ))}
              </div>
              
              <p className="font-sans text-stone-700 text-sm leading-relaxed italic">
                "{testimonial.comments}"
              </p>
              
              <div className="mt-4 text-xs text-stone-500">
                {new Date(testimonial.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <a 
            href="https://g.page/r/CX75qAudJSuXEAI/review" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-sans font-semibold py-3 px-6 rounded-xl transition-all duration-300 text-sm uppercase tracking-wider shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            Leave a Google Review
          </a>
        </div>
      </div>
    </section>
  );
}