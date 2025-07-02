import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import{ BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './Navbar';
import Services from './Services';
import Gallery from './Gallery';
import About from './About';  
import ContactUs from './ContactUs';

function Head(){
  return(
    <div>
 <h1 style={{color: "purple", textAlign: "center", }}>Lavish ladies beauty Salon and Spa</h1>
 </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
  <Head/>
  </React.StrictMode>
);


reportWebVitals();
