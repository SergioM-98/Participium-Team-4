import * as React from "react";
import Link from "next/link";
import { Github, Mail, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full py-6 border-t border-gray-200 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Main Content */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
          {/* Left: Brand */}
          <div className="flex items-center gap-3 md:flex-1">
            <img src="/logo/participium.svg" alt="Participium" className="h-12 w-12" />
            <span className="font-bold text-xl text-gray-900 tracking-tight">Participium</span>
          </div>

          {/* Center: Links */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm md:flex-1">
            <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
              Home
            </Link>
            <Link href="/login" className="text-gray-600 hover:text-gray-900 transition-colors">
              Login
            </Link>
            <Link href="/register" className="text-gray-600 hover:text-gray-900 transition-colors">
              Register
            </Link>
            <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
              About Us
            </a>
          </div>

          {/* Right: Social Icons */}
          <div className="flex items-center gap-4 md:flex-1 md:justify-end">
            <a
              href="https://github.com/SergioM-98/Participium-Team-4"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-900 transition-colors"
              aria-label="GitHub"
            >
              <Github className="h-6 w-6" />
            </a>
            <a
              href="mailto:info@participium.it"
              className="text-gray-600 hover:text-gray-900 transition-colors"
              aria-label="Email"
            >
              <Mail className="h-6 w-6" />
            </a>
          </div>
        </div>

        {/* Bottom: Copyright - با خط کوچیکتر */}
        <div className="text-center text-xs text-gray-500 border-t border-gray-100 pt-3">
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
            <span>&copy; {new Date().getFullYear()} Participium</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              Made with <Heart className="h-3 w-3 text-red-500 fill-red-500" /> in Turin
            </span>
            <span>•</span>
            <span>Politecnico di Torino</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
