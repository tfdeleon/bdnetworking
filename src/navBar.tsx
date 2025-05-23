import { useState } from "react";

function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  return (
    <nav className="absolute top-0 left-0 right-0 bg-primary backdrop-blur-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center">
            <img
              src="https://i.ibb.co/hBSZWcj/bdnetworkinglogo.jpg"
              alt="BD Networking"
              className="h-16"
            />
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            <a
              href="#services"
              className="text-accent hover:text-accent-dark transition-colors duration-200 font-medium"
            >
              Services
            </a>
            <a
              href="#portfolio"
              className="text-accent hover:text-accent-dark transition-colors duration-200 font-medium"
            >
              Portfolio
            </a>
            <a
              href="#booking"
              className="text-accent hover:text-accent-dark transition-colors duration-200 font-medium"
            >
              Book Consultation
            </a>
            <a
              href="#contact"
              className="text-accent hover:text-accent-dark transition-colors duration-200 font-medium"
            >
              Contact
            </a>
            <button className="bg-accent text-primary px-6 py-2.5 rounded-md hover:bg-accent-dark transition-all duration-200 font-semibold transform hover:scale-105">
              Get a Quote
            </button>
          </div>

          {/* Hamburger Button for Mobile */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMobileMenu}
              className="text-accent hover:text-accent-dark focus:outline-none"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        } md:hidden fixed top-0 right-0 bg-primary w-60 h-full transform transition-all duration-300 z-50`}
      >
        {/* Close Icon */}
        <button
          onClick={toggleMobileMenu}
          className="absolute top-4 right-4 text-white text-3xl"
        >
          &times;
        </button>

        <div className="flex flex-col items-start p-6 space-y-6">
          <a
            href="#services"
            className="text-white hover:text-accent-dark transition-colors duration-200 font-medium"
          >
            Services
          </a>
          <a
            href="#portfolio"
            className="text-white hover:text-accent-dark transition-colors duration-200 font-medium"
          >
            Portfolio
          </a>
          <a
            href="#booking"
            className="text-white hover:text-accent-dark transition-colors duration-200 font-medium"
          >
            Book Consultation
          </a>
          <a
            href="#contact"
            className="text-white hover:text-accent-dark transition-colors duration-200 font-medium"
          >
            Contact
          </a>
          <button className="bg-accent text-primary px-6 py-2.5 rounded-md hover:bg-accent-dark transition-all duration-200 font-semibold transform hover:scale-105">
            Get a Quote
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
