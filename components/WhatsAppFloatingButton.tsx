'use client';

import React from 'react';
import { MessageSquare } from 'lucide-react';
import { cleanPhoneNumber } from '@/lib/format';

interface WhatsAppFloatingButtonProps {
  whatsappNumber: string;
}

export default function WhatsAppFloatingButton({
  whatsappNumber,
}: WhatsAppFloatingButtonProps) {
  const phone = cleanPhoneNumber(whatsappNumber || '2348039284712');

  return (
    <aside aria-label="WhatsApp Support" className="fixed bottom-6 right-5 z-40">
      <a
        href={`https://wa.me/${phone}?text=${encodeURIComponent(
          "Hello Kenny's Premium Palm Oil, I'd like to place an order or inquire about available palm oil sizes."
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Kenny's Palm Oil on WhatsApp"
        className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 active:bg-red-800 text-white flex items-center justify-center shadow-xl shadow-red-600/35 hover:scale-110 active:scale-95 transition-all group"
      >
        {/* WhatsApp Icon */}
        <svg
          viewBox="0 0 24 24"
          className="w-8 h-8 fill-current transition-transform"
        >
          <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm.01 18.15c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.1 8.1 0 0 1-1.25-4.38c0-4.48 3.65-8.13 8.13-8.13 2.17 0 4.21.85 5.75 2.38a8.07 8.07 0 0 1 2.38 5.75c0 4.48-3.65 8.13-8.13 8.13zm4.46-6.09c-.24-.12-1.45-.71-1.67-.8-.23-.08-.39-.12-.56.12-.17.24-.65.8-.8 1-.15.15-.3.17-.54.05-.24-.12-1.03-.38-1.96-1.21-.72-.65-1.21-1.45-1.35-1.69-.15-.24-.02-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42s-.56-1.35-.77-1.85c-.2-.49-.41-.42-.56-.43h-.48c-.16 0-.42.06-.65.31-.22.25-.85.83-.85 2.03s.87 2.35.99 2.52c.12.16 1.71 2.62 4.14 3.67.58.25 1.03.4 1.38.51.58.18 1.11.16 1.53.1.47-.07 1.45-.59 1.65-1.16.2-.58.2-1.07.14-1.17-.06-.1-.22-.16-.46-.28z" />
        </svg>
      </a>
    </aside>
  );
}
