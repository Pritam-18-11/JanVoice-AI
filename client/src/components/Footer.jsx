import React from 'react';
import { Link } from 'react-router-dom';
import { Landmark, Mail, ExternalLink, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Logo & Description */}
          <div className="col-span-1 md:col-span-1.5 space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-sky-400 to-blue-500 flex items-center justify-center shadow-lg">
                <Landmark className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg text-white tracking-tight">
                JanVoice<span className="text-sky-400">AI</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed text-slate-400">
              Transforming local governance through AI. Empowering citizens to submit multi-modal feedback and helping representatives prioritize regional development based on real-time data.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg hover:text-white transition-all" aria-label="Twitter">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="#" className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg hover:text-white transition-all" aria-label="Github">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                </svg>
              </a>
              <a href="#" className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg hover:text-white transition-all">
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">Platform</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-white transition-colors">How it Works</Link>
              </li>
              <li>
                <Link to="/citizen" className="hover:text-white transition-colors">Citizen Portal</Link>
              </li>
              <li>
                <span className="text-slate-600 cursor-not-allowed">MLA Analytics (Phase 3)</span>
              </li>
              <li>
                <span className="text-slate-600 cursor-not-allowed">Admin Console (Phase 4)</span>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-white transition-colors flex items-center gap-1">
                  Developer Docs <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">FAQ & Support</a>
              </li>
            </ul>
          </div>

          {/* Newsletter / Mock Input */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold text-sm tracking-wider uppercase">Stay Updated</h3>
            <p className="text-sm text-slate-400">Subscribe to local development and governance reports.</p>
            <form onSubmit={(e) => e.preventDefault()} className="flex gap-2">
              <input
                type="email"
                placeholder="Enter email"
                className="bg-slate-800 text-white placeholder-slate-500 text-sm px-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-sky-500 w-full border border-slate-700"
              />
              <button
                type="submit"
                className="bg-sky-500 hover:bg-sky-400 text-white font-medium text-sm px-4 py-2 rounded-xl shadow-md transition-all shrink-0"
              >
                Join
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500">
          <p>© 2026 JanVoice AI. Built for smart, responsive civic administration.</p>
          <p className="flex items-center gap-1 mt-2 md:mt-0">
            Made with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> for the Smart Governance Hackathon
          </p>
        </div>
      </div>
    </footer>
  );
}
