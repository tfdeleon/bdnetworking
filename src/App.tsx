import React, { useState } from 'react';
import {Instagram, Mail, Shield, Phone, Building2, Bell, Lock, Radio, Settings2, MessageSquare, ChevronRight, Calendar, Camera } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';

function BookingForm() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    date: '',
    time: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/create-booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create booking');
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to schedule consultation');
      }

      toast.success('Consultation booked successfully! Check your email for confirmation.');
      setFormData({
        name: '',
        phone: '',
        email: '',
        date: '',
        time: '',
        message: ''
      });
    } catch (error) {
      console.error('Booking error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to book consultation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.id]: e.target.value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent"
            placeholder="John Doe"
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent"
            placeholder="(123) 456-7890"
          />
        </div>
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email Address
        </label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent"
          placeholder="john@example.com"
        />
      </div>
      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
          Preferred Date
        </label>
        <input
          type="date"
          id="date"
          value={formData.date}
          onChange={handleChange}
          required
          min={new Date().toISOString().split('T')[0]}
          className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>
      <div>
        <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
          Preferred Time
        </label>
        <select
          id="time"
          value={formData.time}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent"
        >
          <option value="">Select a time</option>
          <option value="morning">Morning (9AM - 12PM)</option>
          <option value="afternoon">Afternoon (12PM - 4PM)</option>
          <option value="evening">Evening (4PM - 7PM)</option>
        </select>
      </div>
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
          Additional Notes
        </label>
        <textarea
          id="message"
          value={formData.message}
          onChange={handleChange}
          rows={4}
          className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent"
          placeholder="Tell us about your security needs..."
        ></textarea>
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full bg-accent text-primary px-6 py-3 rounded-md transition-all duration-200 ${
          isSubmitting ? 'bg-accent/70 cursor-not-allowed' : 'hover:bg-accent-dark hover:scale-105'
        }`}
      >
        {isSubmitting ? 'Scheduling...' : 'Schedule Consultation'}
      </button>
    </form>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-white">
      <Toaster position="top-right" />
      {/* Hero Section */}
      <header className="relative bg-primary min-h-screen">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&q=80")',
            backgroundBlendMode: 'multiply',
            backgroundColor: 'rgba(0, 0, 0, 0.85)'
          }}
        />
        <nav className="absolute top-0 left-0 right-0 bg-primary/95 backdrop-blur-sm z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center">
                <img 
                  src="https://i.ibb.co/hBSZWcj/bdnetworkinglogo.jpg" 
                  alt="BD Networking" 
                  className="h-16"
                />
              </div>
              <div className="hidden md:flex items-center space-x-8">
                <a href="#services" className="text-accent hover:text-accent-dark transition-colors duration-200 font-medium">Services</a>
                <a href="#portfolio" className="text-accent hover:text-accent-dark transition-colors duration-200 font-medium">Portfolio</a>
                <a href="#booking" className="text-accent hover:text-accent-dark transition-colors duration-200 font-medium">Book Consultation</a>
                <a href="#contact" className="text-accent hover:text-accent-dark transition-colors duration-200 font-medium">Contact</a>
                <button className="bg-accent text-primary px-6 py-2.5 rounded-md hover:bg-accent-dark transition-all duration-200 font-semibold transform hover:scale-105">
                  Get a Quote
                </button>
              </div>
            </div>
          </div>
        </nav>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 min-h-screen flex items-center">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
              Professional Security Installation Services
            </h1>
            <p className="text-xl text-accent mb-8 leading-relaxed">
              Protecting your property with state-of-the-art security solutions.
            </p>
            <div className="flex flex-wrap gap-4">
              <a 
                href="#contact"
                className="bg-accent text-primary px-6 py-3 rounded-md hover:bg-accent-dark flex items-center transition-all duration-200 font-semibold transform hover:scale-105 shadow-lg"
              >
                Contact Us <ChevronRight className="ml-2 h-5 w-5" />
              </a>
              <a 
                href="#services"
                className="border-2 border-accent text-accent px-6 py-3 rounded-md hover:bg-accent hover:text-primary transition-all duration-200 font-semibold transform hover:scale-105"
              >
                Our Services
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Free Estimates Banner */}
      <div className="bg-accent py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-primary mb-4">
            FREE Security System Estimates
          </h2>
          <p className="text-lg text-primary/90 mb-6">
            Get a comprehensive security assessment at no cost to you
          </p>
          <a 
            href="#booking" 
            className="inline-block bg-primary text-accent px-8 py-4 rounded-md hover:bg-gray-900 transition-all duration-200 font-semibold text-lg hover:scale-105 shadow-lg"
          >
            Schedule Your Free Consultation
          </a>
        </div>
      </div>

      {/* Services Section */}
      <section id="services" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-primary mb-4">Our Services</h2>
            <p className="text-lg text-gray-600">Comprehensive security solutions for your peace of mind</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Building2 className="h-8 w-8 text-accent" />,
                title: "Intercom Installation",
                description: "Modern intercom systems for residential and commercial properties"
              },
              {
                icon: <Bell className="h-8 w-8 text-accent" />,
                title: "Alarm Systems",
                description: "Advanced alarm systems with 24/7 monitoring capabilities"
              },
              {
                icon: <Lock className="h-8 w-8 text-accent" />,
                title: "Access Control",
                description: "Secure access control systems for enhanced property protection"
              },
              {
                icon: <Radio className="h-8 w-8 text-accent" />,
                title: "Video Intercom",
                description: "High-definition video intercom solutions with remote access"
              },
              {
                icon: <Settings2 className="h-8 w-8 text-accent" />,
                title: "Repair Services",
                description: "Expert repair and maintenance of security systems"
              },
              {
                icon: <MessageSquare className="h-8 w-8 text-accent" />,
                title: "Consultation",
                description: "Professional security consultation and system design"
              }
            ].map((service, index) => (
              <div 
                key={index} 
                className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 hover:scale-105"
              >
                <div className="mb-4">{service.icon}</div>
                <h3 className="text-xl font-semibold mb-2 text-primary">{service.title}</h3>
                <p className="text-gray-600">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section id="portfolio" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-primary mb-4">Our Recent Projects</h2>
            <p className="text-lg text-gray-600">Take a look at some of our successful installations</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                image: "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80",
                title: "Commercial Access Control",
                description: "High-security access control system for a corporate office building",
                location: "Downtown Business District"
              },
              {
                image: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?auto=format&fit=crop&q=80",
                title: "Residential Security",
                description: "Comprehensive home security system with video surveillance",
                location: "Luxury Residential Complex"
              },
              {
                image: "https://images.unsplash.com/photo-1580894894513-541e068a3e2b?auto=format&fit=crop&q=80",
                title: "Smart Intercom System",
                description: "Modern video intercom installation for an apartment complex",
                location: "Urban Apartments"
              },
              {
                image: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&q=80",
                title: "Retail Security",
                description: "Advanced security system for a retail chain",
                location: "Shopping District"
              },
              {
                image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80",
                title: "Industrial Security",
                description: "Heavy-duty security solutions for manufacturing facility",
                location: "Industrial Park"
              },
              {
                image: "https://images.unsplash.com/photo-1590856029826-c7a73142bbf1?auto=format&fit=crop&q=80",
                title: "Network Infrastructure",
                description: "Complete security infrastructure for educational institution",
                location: "Local School District"
              }
            ].map((project, index) => (
              <div 
                key={index} 
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 hover:scale-105"
              >
                <div className="relative h-64">
                  <img 
                    src={project.image} 
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-20 hover:bg-opacity-10 transition-opacity duration-300" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2 text-primary">{project.title}</h3>
                  <p className="text-gray-600 mb-2">{project.description}</p>
                  <div className="flex items-center text-sm text-accent">
                    <Camera className="h-4 w-4 mr-1" />
                    {project.location}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Section */}
      <section id="booking" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-primary mb-4">Book a Consultation</h2>
            <p className="text-lg text-gray-600">Schedule a free consultation to discuss your security needs</p>
          </div>

          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8 border border-gray-100">
            <div className="flex items-center justify-center mb-8">
              <Calendar className="h-12 w-12 text-accent" />
            </div>
            <div className="text-center mb-8">
              <h3 className="text-xl font-semibold mb-2 text-primary">Free Security Consultation</h3>
              <p className="text-gray-600">
                Book a time slot for a detailed discussion about your security requirements. 
                Our expert will contact you to confirm the appointment.
              </p>
            </div>
            <BookingForm />
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-primary mb-4">Trusted Brands We Work With</h2>
            <p className="text-lg text-gray-600">We partner with industry-leading security brands to provide the best solutions</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {[
              {
                name: "AIPHONE",
                image: "https://i.ibb.co/mynZFtR/aiphonelogo.webp",
                description: "Professional surveillance solutions"
              },
              {
                name: "ButterflyMX",
                image: "https://i.ibb.co/88Z6nvT/Butterflymxlogo.jpg",
                description: "Advanced security systems"
              },
              {
                name: "2N",
                image: "https://i.ibb.co/jHmd2X4/2-N-Logo-png.webp",
                description: "Network video solutions"
              },
              {
                name: "DoorBird",
                image: "https://i.ibb.co/8Db7LBC/idc3d-XIWk.webp",
                description: "Integrated security systems"
              },
              {
                name: "Akuvox",
                image: "https://i.ibb.co/LJVDDzH/image.webp",
                description: "Security and safety systems"
              },
              {
                name: "InVid",
                image: "https://i.ibb.co/TYmZbRs/invid.webp",
                description: "IP intercoms and access systems"
              },
              {
                name: "HIKVISION",
                image: "https://i.ibb.co/W0TkY0T/HIKVISONLOGO.webp",
                description: "Smart video intercoms"
              },
              {
                name: "Eagle Eye Networks",
                image: "https://i.ibb.co/BZ9vLyR/Eagle-Eye-New-Logo-Light-Blue-SVG.webp",
                description: "Video intercom systems"
              }
            ].map((brand, index) => (
              <div 
                key={index} 
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
              >
                <div className="relative h-48">
                  <img 
                    src={brand.image} 
                    alt={brand.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 duration-300">
                    <p className="text-white text-center px-4">
                      {brand.description}
                    </p>
                  </div>
                </div>
                <div className="p-4 text-center">
                  <h3 className="text-lg font-semibold text-primary">{brand.name}</h3>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <div className="inline-flex flex-col md:flex-row items-center justify-center gap-4">
              <div className="flex items-center space-x-2">
                <Phone className="h-6 w-6 text-accent" />
                <span className="text-gray-700">718-669-2234</span>
              </div>
              <div className="flex items-center space-x-2">
                <Instagram className="h-6 w-6 text-accent" />
                <a href="https://instagram.com/bdnetworking/" className="text-gray-700 hover:text-accent transition-colors">
                  bdnetworking
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-6 w-6 text-accent" />
                <a href="mailto:bdlvsolutions@gmail.com" className="text-gray-700 hover:text-accent transition-colors">
                  bdlvsolutions@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <img 
                src="https://i.ibb.co/hBSZWcj/bdnetworkinglogo.jpg" 
                alt="BD Networking" 
                className="h-12"
              />
            </div>
            <div className="text-center md:text-right">
              <p className="text-accent">© 2024 BD Networking. All rights reserved.</p>
              <p className="text-gray-400">Professional Security Installation Services</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;