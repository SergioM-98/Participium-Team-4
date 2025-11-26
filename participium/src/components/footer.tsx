import * as React from "react";

export function Footer() {
  return (
    <footer className="w-full py-6 text-center border-t bg-white/80 backdrop-blur">
      <div className="font-semibold text-lg text-gray-800">Participium</div>
      <div className="mt-1 text-sm text-gray-500">
        &copy; {new Date().getFullYear()} &middot; Made with <span className="text-red-500">❤️</span> in Turin
      </div>
    </footer>
  );
}
