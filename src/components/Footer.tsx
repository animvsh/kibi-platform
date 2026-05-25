import { Link } from 'react-router-dom';
import Logo from './Logo';
import { Facebook, Twitter, Instagram, Linkedin, Github, Youtube } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="relative z-10 w-full py-10 px-6 bg-dark-400 backdrop-blur-md border-t border-kibi-600">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Logo and About */}
          <div className="flex flex-col items-center md:items-start">
            <Link to="/" className="flex items-center gap-3 mb-4 hover-pop">
              <Logo size="md" variant="glow" />
              <span className="text-xl font-bold text-white cartoon-text">Kibi</span>
            </Link>
            <p className="text-gray-300 text-sm text-center md:text-left">
              Kibi is an AI-powered learning platform that helps you master any topic with personalized courses.
            </p>
            <div className="flex gap-4 mt-6">
              <a href="#" className="text-gray-400 hover:text-kibi-400 transition-colors">
                <Facebook size={18} />
              </a>
              <a href="#" className="text-gray-400 hover:text-kibi-400 transition-colors">
                <Twitter size={18} />
              </a>
              <a href="#" className="text-gray-400 hover:text-kibi-400 transition-colors">
                <Instagram size={18} />
              </a>
              <a href="#" className="text-gray-400 hover:text-kibi-400 transition-colors">
                <Linkedin size={18} />
              </a>
              <a href="#" className="text-gray-400 hover:text-kibi-400 transition-colors">
                <Github size={18} />
              </a>
              <a href="#" className="text-gray-400 hover:text-kibi-400 transition-colors">
                <Youtube size={18} />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4 cartoon-text">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/courses" className="text-gray-300 hover:text-kibi-400 transition-colors">All Courses</Link></li>
              <li><Link to="/pricing" className="text-gray-300 hover:text-kibi-400 transition-colors">Pricing</Link></li>
              <li><Link to="/blog" className="text-gray-300 hover:text-kibi-400 transition-colors">Blog</Link></li>
              <li><Link to="/auth" className="text-gray-300 hover:text-kibi-400 transition-colors">Sign Up</Link></li>
            </ul>
          </div>
          
          {/* Categories */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4 cartoon-text">Categories</h3>
            <ul className="space-y-2">
              <li><Link to="/category/programming" className="text-gray-300 hover:text-kibi-400 transition-colors">Programming</Link></li>
              <li><Link to="/category/data-science" className="text-gray-300 hover:text-kibi-400 transition-colors">Data Science</Link></li>
              <li><Link to="/category/design" className="text-gray-300 hover:text-kibi-400 transition-colors">Design</Link></li>
              <li><Link to="/category/business" className="text-gray-300 hover:text-kibi-400 transition-colors">Business</Link></li>
              <li><Link to="/category/ai" className="text-gray-300 hover:text-kibi-400 transition-colors">Artificial Intelligence</Link></li>
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4 cartoon-text">Contact</h3>
            <address className="not-italic text-gray-300">
              <p className="mb-2">1234 Learning Street</p>
              <p className="mb-2">Knowledge City, KC 98765</p>
              <p className="mb-2">Email: <a href="mailto:hello@kibi.app" className="text-kibi-400">hello@kibi.app</a></p>
              <p>Phone: <a href="tel:+12345678901" className="text-kibi-400">+1 (234) 567-8901</a></p>
            </address>
          </div>
        </div>
        
        {/* Bottom section */}
        <div className="mt-10 pt-8 border-t border-dark-300 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-400 mb-4 md:mb-0">
            © {currentYear} Kibi Learning. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link to="/privacy" className="text-sm text-gray-400 hover:text-kibi-400 transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="text-sm text-gray-400 hover:text-kibi-400 transition-colors">Terms of Service</Link>
            <Link to="/cookie-policy" className="text-sm text-gray-400 hover:text-kibi-400 transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
