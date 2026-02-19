import React, { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

const translations = {
  en: {
    home: "Home",
    services: "Services",
    about: "About",
    ourServices: "Our Services",
    contact: "Contact",
    bookAppointment: "Book Appointment",
    aboutUs: "About Us",
    yearsInBusiness: "Years in Business",
    sinceMarch2018: "Since March 2018",
    getInTouch: "Get In Touch",
    callUs: "Call Us",
    callNow: "Call Now",
    visitUs: "Visit Us",
    getDirections: "Get Directions",
    hours: "Hours",
    whatClientsSay: "What Our Clients Say",
    leaveGoogleReview: "Leave a Google Review"
  },
  
  kn: {
    home: "ಮುಖ್ಯ ಪುಟ",
    services: "ಸೇವೆಗಳು",
    about: "ನಮ್ಮ ಬಗ್ಗೆ",
    ourServices: "ನಮ್ಮ ಸೇವೆಗಳು",
    contact: "ಸಂಪರ್ಕ",
    bookAppointment: "ಅಪಾಯಿಂಟ್ಮೆಂಟ್ ಬುಕ್ ಮಾಡಿ",
    aboutUs: "ನಮ್ಮ ಬಗ್ಗೆ",
    yearsInBusiness: "ವರ್ಷಗಳ ಅನುಭವ",
    sinceMarch2018: "ಮಾರ್ಚ್ 2018 ರಿಂದ",
    getInTouch: "ಸಂಪರ್ಕಿಸಿ",
    callUs: "ಕರೆ ಮಾಡಿ",
    callNow: "ಈಗ ಕರೆ ಮಾಡಿ",
    visitUs: "ನಮ್ಮನ್ನು ಭೇಟಿ ಮಾಡಿ",
    getDirections: "ದಿಕ್ಕುಗಳನ್ನು ಪಡೆಯಿರಿ",
    hours: "ಸಮಯ",
    whatClientsSay: "ನಮ್ಮ ಗ್ರಾಹಕರು ಏನು ಹೇಳುತ್ತಾರೆ",
    leaveGoogleReview: "ಗೂಗಲ್ ರಿವ್ಯೂ ಬರೆಯಿರಿ"
  },
  
  hi: {
    home: "होम",
    services: "सेवाएं",
    about: "हमारे बारे में",
    ourServices: "हमारी सेवाएं",
    contact: "संपर्क",
    bookAppointment: "अपॉइंटमेंट बुक करें",
    aboutUs: "हमारे बारे में",
    yearsInBusiness: "वर्षों का अनुभव",
    sinceMarch2018: "मार्च 2018 से",
    getInTouch: "संपर्क में रहें",
    callUs: "कॉल करें",
    callNow: "अभी कॉल करें",
    visitUs: "हमसे मिलें",
    getDirections: "दिशा निर्देश प्राप्त करें",
    hours: "समय",
    whatClientsSay: "हमारे ग्राहक क्या कहते हैं",
    leaveGoogleReview: "गूगल रिव्यू लिखें"
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');
  
  const t = (key) => {
    return translations[language][key] || key;
  };
  
  const changeLanguage = (lang) => {
    setLanguage(lang);
  };
  
  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};