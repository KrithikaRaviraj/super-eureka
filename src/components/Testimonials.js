import React, { useState, useEffect } from 'react';

export default function Testimonials({ testimonials }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Real Google Reviews from your business page
  const googleReviews = [
    {
      userName: "Shamesh Ramesh",
      service: "Haircut & Eyebrow Shaping",
      overallRating: 5,
      comments: "I had an excellent experience at Lavish Ladies Beauty Salon. The staff were courteous and skilled, ensuring that my haircut and eyebrow shaping were done with great precision. The salon maintained a clean and pleasant environment, and the service was prompt and professional. I would highly recommend Lavish Ladies Beauty Salon for anyone seeking quality beauty care and customer satisfaction.",
      createdAt: "2024-08-15"
    },
    {
      userName: "Nathania Joylyn Pais",
      service: "Beauty Services",
      overallRating: 5,
      comments: "The salon is well-maintained, clean, and run by a friendly lady who offers neat and professional work. 10/10 recommend.",
      createdAt: "2024-09-20"
    },
    {
      userName: "Jyothi Amarnath",
      service: "Beauty Care",
      overallRating: 5,
      comments: "It was a great experience at a reasonable price. I'd definitely recommend Lavish Ladies Beauty Salon to anyone looking for professional beauty care and a little self-care time.",
      createdAt: "2024-09-10"
    },
    {
      userName: "Deepthi Bangera",
      service: "Beauty Services",
      overallRating: 5,
      comments: "Excellent service, best parlour & best service ❤️",
      createdAt: "2024-09-05"
    },
    {
      userName: "Shravya Kotian",
      service: "Hair Treatment",
      overallRating: 5,
      comments: "Thank you for giving me a good treatment. Amazing hair and beauty service. Staff is very friendly. I am literally happy for choosing this ladies beauty salon thank you mam.",
      createdAt: "2024-07-15"
    },
    {
      userName: "Preethi Srinivasan",
      service: "Multiple Services",
      overallRating: 5,
      comments: "One stop solution for all your beauty needs. I have been visiting many a times for hair cut, facials, threading and other services. Staff is really good, very polite and friendly and reasonable price. Good ambience. Overall good service. Thank you.",
      createdAt: "2024-07-14"
    },
    {
      userName: "Shreya Kotian",
      service: "Hair & Beauty Services",
      overallRating: 5,
      comments: "Amazing hair and beauty services😍 Staff is very friendly. Prices are reasonable. Definitely recommend it!",
      createdAt: "2024-07-14"
    },
    {
      userName: "Amrutha Suvarna",
      service: "Haircut",
      overallRating: 5,
      comments: "I'm so satisfied with the service. Mam had done very good haircut maintaining my hair length. I am literally happy for choosing this ladies beauty saloon thankyou mam.",
      createdAt: "2024-07-13"
    },
    {
      userName: "Amrutha Reddy",
      service: "Beauty Services",
      overallRating: 5,
      comments: "I was on vacation from Bangalore, and I came across this saloon. The friendly person was so comfortable and the interior was so good. It was a very clean n tidy place at a very affordable price.",
      createdAt: "2023-10-07"
    },
    {
      userName: "Apoorva Rao",
      service: "Beauty Services",
      overallRating: 5,
      comments: "This parlour is well maintained and clean. Beautician was very professional and nice.",
      createdAt: "2022-02-26"
    },
    {
      userName: "Shiyal B",
      service: "Regular Services",
      overallRating: 5,
      comments: "Everytime I go here, the experience is very good. I have been going to this salon since the past 2 years and will continue to do so😍",
      createdAt: "2021-07-15"
    },
    {
      userName: "Nalini Uk",
      service: "Makeup & Hairdo",
      overallRating: 5,
      comments: "Best ever makeover. Everyone appreciated the makeup and hairdo. Very punctual and good service. I would recommend this always.",
      createdAt: "2019-05-21"
    },
    {
      userName: "Harini UK",
      service: "Event Makeup & Styling",
      overallRating: 5,
      comments: "Very professional and adaptable staff. Make up, hairstyle and saree was done with utmost care and the final look got a lot of appreciation from everyone. Worth the price!! Happy to have chosen for a big event!",
      createdAt: "2019-05-20"
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
          <h2 className="font-serif text-4xl sm:text-5xl font-light text-stone-800 mb-4">{"What Our Clients Say"}</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-rose-400 to-pink-400 mx-auto mb-6"></div>
          <p className="font-sans text-lg text-stone-600 max-w-2xl mx-auto">{"Read what our valued clients have to say about their experience at Lavish Ladies."}</p>
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
                              {testimonial.isAnonymous ? "Anonymous Customer" : testimonial.userName}
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
                            {"Google Review"}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {displayTestimonials.length > 3 && (
            <>
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
            </>
          )}
        </div>
        
        <div className="text-center mt-12">
          <a 
            href={process.env.REACT_APP_GOOGLE_REVIEWS_URL || 'https://www.google.com/maps/place/Lavish+Ladies+Beauty+Salon/@13.188771,74.7537917,17z/data=!4m8!3m7!1s0x3bbcb1e842429ab7:0x972b259d0ba8f97e!8m2!3d13.188771!4d74.7537917!9m1!1b1!16s%2Fg%2F11g_z1zyhg'} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-sans font-semibold py-3 px-6 rounded-xl transition-all duration-300 text-sm uppercase tracking-wider shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            {"Leave a Google Review"}
          </a>
        </div>
      </div>
    </section>
  );
}
