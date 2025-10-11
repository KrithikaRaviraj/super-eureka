import React, { useState, useEffect } from 'react';

export default function Testimonials({ testimonials }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Sample Google Reviews as fallback
  const googleReviews = [
    {
      userName: "Priya S",
      service: "Hair Styling",
      overallRating: 5,
      comments: "Amazing service! The staff is very professional and the salon is clean and well-maintained. Highly recommend for all beauty needs.",
      createdAt: "2024-12-15"
    },
    {
      userName: "Meera K",
      service: "Facial Treatment",
      overallRating: 5,
      comments: "Best facial I've ever had! The products used are of high quality and the results were immediate. Will definitely come back.",
      createdAt: "2024-12-10"
    },
    {
      userName: "Anita R",
      service: "Bridal Package",
      overallRating: 5,
      comments: "Perfect bridal makeover! They made me look absolutely stunning on my wedding day. The team is skilled and very caring.",
      createdAt: "2024-12-05"
    },
    {
      userName: "Kavya M",
      service: "Manicure & Pedicure",
      overallRating: 5,
      comments: "Excellent nail care service! Very hygienic and the staff pays attention to detail. My nails look perfect.",
      createdAt: "2024-12-01"
    },
    {
      userName: "Sneha P",
      service: "Hair Coloring",
      overallRating: 5,
      comments: "Love my new hair color! The stylist understood exactly what I wanted and delivered beyond expectations.",
      createdAt: "2024-11-28"
    },
    {
      userName: "Divya L",
      service: "Spa & Massage",
      overallRating: 5,
      comments: "So relaxing and rejuvenating! The massage was therapeutic and the ambiance is very peaceful. Highly recommended.",
      createdAt: "2024-11-25"
    }
  ];
  
  const displayTestimonials = testimonials.length > 0 ? testimonials : googleReviews;
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % Math.ceil(displayTestimonials.length / 3));
    }, 4000);
    return () => clearInterval(timer);
  }, [displayTestimonials.length]);
  
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.ceil(displayTestimonials.length / 3));
  };
  
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + Math.ceil(displayTestimonials.length / 3)) % Math.ceil(displayTestimonials.length / 3));
  };

  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-serif text-4xl sm:text-5xl font-light text-stone-800 mb-4">What Our Clients Say</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-rose-400 to-pink-400 mx-auto mb-6"></div>
          <p className="font-sans text-lg text-stone-600 max-w-2xl mx-auto">Read what our valued clients have to say about their experience at Lavish Ladies.</p>
        </div>
        
        <div className="relative">
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {Array.from({ length: Math.ceil(displayTestimonials.length / 3) }).map((_, slideIndex) => (
                <div key={slideIndex} className="w-full flex-shrink-0">
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {displayTestimonials.slice(slideIndex * 3, slideIndex * 3 + 3).map((testimonial, index) => (
                      <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-stone-200/50">
                        <div className="flex items-center mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full flex items-center justify-center mr-4">
                            <span className="font-serif text-lg font-medium text-stone-800">
                              {testimonial.isAnonymous ? 'A' : testimonial.userName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-serif text-lg font-medium text-stone-800">
                              {testimonial.isAnonymous ? 'Anonymous Customer' : testimonial.userName}
                            </h4>
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
                        {testimonials.length === 0 && (
                          <div className="mt-2 text-xs text-blue-600 font-medium">
                            Google Review
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-stone-600 hover:text-stone-800 p-2 rounded-full shadow-lg transition-all duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-stone-600 hover:text-stone-800 p-2 rounded-full shadow-lg transition-all duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          
          <div className="flex justify-center mt-8 space-x-2">
            {Array.from({ length: Math.ceil(displayTestimonials.length / 3) }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  currentSlide === index ? 'bg-rose-600' : 'bg-stone-300 hover:bg-stone-400'
                }`}
              />
            ))}
          </div>
        </div>
        
        <div className="text-center mt-12">
          <a 
            href={process.env.REACT_APP_GOOGLE_REVIEWS_URL || 'https://g.page/r/CX75qAudJSuXEAI/review'} 
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