import React from 'react';
import { useNavigate } from 'react-router-dom';
import QRimg from "../assets/QRQuery.jpg"; 

const socialLinks = [
    {
  label: "WhatsApp",
  url: "https://wa.me/917579631509",
  icon: (
    <svg
      width="28"
      height="28"
      viewBox="0 0 256 256"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
    >
      <rect width="256" height="256" rx="60" fill="#25D366" />
      <path
        fill="#fff"
        d="M128.001 44C82.79 44 45 81.791 45 127.001c0 17.001 4.459 33.406 12.932 47.931l-8.483 30.972 31.713-8.328c13.9 7.581 29.644 11.623 46.838 11.623 45.211 0 83.001-37.79 83.001-83.001 0-45.21-37.79-83-83.001-83zm0 151.591c-15.061 0-29.139-4.392-41.117-11.922l-2.943-1.841-18.825 4.94 5.012-18.331-1.917-2.98c-7.242-11.251-11.076-24.26-11.076-37.456 0-38.735 31.548-70.282 70.282-70.282 18.777 0 36.412 7.313 49.707 20.608 13.295 13.295 20.608 30.931 20.608 49.708 0 38.734-31.547 70.282-70.281 70.282zm39.828-52.934c-2.18-1.09-12.902-6.368-14.9-7.09-1.998-.727-3.455-1.09-4.912 1.09-1.455 2.18-5.633 7.09-6.906 8.545-1.272 1.453-2.545 1.635-4.725.545-2.18-1.09-9.202-3.39-17.529-10.81-6.486-5.782-10.875-12.915-12.157-15.095-1.272-2.18-.136-3.345.954-4.435.98-.98 2.18-2.545 3.27-3.818 1.09-1.272 1.453-2.18 2.18-3.635.727-1.453.364-2.727-.182-3.818-.545-1.09-4.912-11.836-6.727-16.218-1.78-4.292-3.617-3.715-4.912-3.783-1.272-.068-2.727-.09-4.181-.09s-3.818.545-5.817 2.727c-1.999 2.18-7.64 7.456-7.64 18.181 0 10.726 7.828 21.08 8.917 22.562 1.09 1.453 15.407 23.59 37.39 33.036 5.225 2.254 9.288 3.604 12.462 4.615 5.24 1.667 10.01 1.432 13.79.87 4.204-.625 12.902-5.27 14.745-10.362 1.842-5.09 1.842-9.446 1.29-10.362-.545-.91-1.982-1.453-4.163-2.543z"
      />
    </svg>
  ),
},
  {
    label: "Telegram",
    url: "https://t.me/+lpRQaDIeKJ5jMzU1",
    icon: (
      <svg
        aria-hidden="true"
        focusable="false"
        width="28"
        height="28"
        viewBox="0 0 240 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="240" height="240" rx="48" fill="white" />
        <path
          d="M53.029 118.382L180.753 71.615c6.933-2.79 13.309 1.69 10.816 12.282l-27.03 127.202c-2.56 11.637-9.287 14.998-18.798 9.334l-51.967-38.991-25.063 24.154c-2.77 2.77-5.105 5.106-10.772 5.106L89.823 148.94l98.496-78.411c4.284-3.362-.933-5.254-6.631-1.892L53.03 118.382z"
          fill="#229ED9"
        />
      </svg>
    ),
  },
  {
    label: "YouTube",
    url: "https://www.youtube.com/@LadliLaxmi-d6r6t",
    icon: (
      <svg
        aria-hidden="true"
        focusable="false"
        width="28"
        height="28"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="48" height="48" rx="10" fill="white" />
        <circle cx="24" cy="24" r="16" fill="#FF0000" />
        <polygon points="20,16 34,24 20,32" fill="white" />
      </svg>
    ),
  },
  {
  label: "WhatsApp",
  url: "https://chat.whatsapp.com/LSjtlL6yIdMGb7SeDWKz33",
  icon: (
    <svg
      width="28"
      height="28"
      viewBox="0 0 256 256"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
    >
      <rect width="256" height="256" rx="60" fill="#25D366" />
      <path
        fill="#fff"
        d="M128.001 44C82.79 44 45 81.791 45 127.001c0 17.001 4.459 33.406 12.932 47.931l-8.483 30.972 31.713-8.328c13.9 7.581 29.644 11.623 46.838 11.623 45.211 0 83.001-37.79 83.001-83.001 0-45.21-37.79-83-83.001-83zm0 151.591c-15.061 0-29.139-4.392-41.117-11.922l-2.943-1.841-18.825 4.94 5.012-18.331-1.917-2.98c-7.242-11.251-11.076-24.26-11.076-37.456 0-38.735 31.548-70.282 70.282-70.282 18.777 0 36.412 7.313 49.707 20.608 13.295 13.295 20.608 30.931 20.608 49.708 0 38.734-31.547 70.282-70.281 70.282zm39.828-52.934c-2.18-1.09-12.902-6.368-14.9-7.09-1.998-.727-3.455-1.09-4.912 1.09-1.455 2.18-5.633 7.09-6.906 8.545-1.272 1.453-2.545 1.635-4.725.545-2.18-1.09-9.202-3.39-17.529-10.81-6.486-5.782-10.875-12.915-12.157-15.095-1.272-2.18-.136-3.345.954-4.435.98-.98 2.18-2.545 3.27-3.818 1.09-1.272 1.453-2.18 2.18-3.635.727-1.453.364-2.727-.182-3.818-.545-1.09-4.912-11.836-6.727-16.218-1.78-4.292-3.617-3.715-4.912-3.783-1.272-.068-2.727-.09-4.181-.09s-3.818.545-5.817 2.727c-1.999 2.18-7.64 7.456-7.64 18.181 0 10.726 7.828 21.08 8.917 22.562 1.09 1.453 15.407 23.59 37.39 33.036 5.225 2.254 9.288 3.604 12.462 4.615 5.24 1.667 10.01 1.432 13.79.87 4.204-.625 12.902-5.27 14.745-10.362 1.842-5.09 1.842-9.446 1.29-10.362-.545-.91-1.982-1.453-4.163-2.543z"
      />
    </svg>
  ),
},



];

const SocialIconsBar = () => (
  <div className="flex gap-4 justify-center mt-6 md:justify-start items-center">
    {socialLinks.map(({ label, url, icon }) => (
      <a
        key={label}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-lg shadow-lg bg-white flex items-center justify-center w-14 h-14 hover:scale-110 transition-transform duration-200"
        aria-label={label}
        title={label}
      >
        {icon}
      </a>
    ))}
  </div>
);

const coloredIcons = {
  phone: (
    <svg
      className="mr-3 flex-shrink-0"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="#F59E0B"
      stroke="#B45309"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 16.92v3a2 2 0 01-2.18 2c-3.54-.6-7.18-2.53-10.27-5.63-3.1-3.1-5.03-6.73-5.63-10.27A2 2 0 014.11 2h3a2 2 0 012 1.72c.14.95.43 1.89.85 2.74a2 2 0 01-.45 2.11l-1.27 1.27a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.85.42 1.79.71 2.74.85A2 2 0 0122 16.92z" />
    </svg>
  ),
  mail: (
    <svg
      className="mr-3 flex-shrink-0"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="#3B82F6"
      stroke="#1E40AF"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="4" width="20" height="16" rx="2" ry="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 01-2.06 0L2 7" />
    </svg>
  ),
  "map-pin": (
    <svg
      className="mr-3 flex-shrink-0"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="#F87171"
      stroke="#B91C1C"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 18.3a2 2 0 100-4 2 2 0 000 4z" />
      <path d="M12 22s8-4 8-10a8 8 0 00-16 0c0 6 8 10 8 10z" />
    </svg>
  ),
  telegram: (
    <svg
      className="mr-3 flex-shrink-0"
      width="20"
      height="20"
      fill="#25D366"
      stroke="#128C7E"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
    >
      <path d="M22 2L2 12l7 3 3 7 10-20z" />
    </svg>
  ),
  youtube: (
    <svg
      className="mr-3 flex-shrink-0"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="#EF4444"
      stroke="#B91C1C"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 15l5-3-5-3v6z" fill="white" />
      <path d="M21.8 6.4a3 3 0 00-2.1-2.1C17.8 3.8 12 3.8 12 3.8s-5.8 0-7.7.5a3 3 0 00-2.1 2.1A31.39 31.39 0 002 12a31.39 31.39 0 00.2 5.6 3 3 0 002.1 2.1c1.8.5 7.7.5 7.7.5s5.8 0 7.7-.5a3 3 0 002.1-2.1 31.39 31.39 0 00.2-5.6 31.39 31.39 0 00-.2-5.6z" />
    </svg>
  ),
  whatsapp: (
    <svg
      className="mr-3 flex-shrink-0"
      width="20"
      height="20"
      fill="#22C55E"
      stroke="#14532D"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
    >
      <path d="M.057 24l1.687-6.163a11.92 11.92 0 01-1.64-6.044C.104 5.32 5.42 0 12.059 0c3.195 0 6.2 1.24 8.457 3.498a11.886 11.886 0 013.5 8.459c-.003 6.638-5.42 12.055-12.059 12.055a11.94 11.94 0 01-6.21-1.81L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.393 1.592 5.448 0 9.886-4.434 9.889-9.885.002-2.64-1.05-5.115-2.96-6.988a6.936 6.936 0 00-4.95-2.05c-3.7 0-6.712 3.367-6.714 3.39a.526.526 0 00-.133.294c-.01.1-.146.56-.146.568 0 .007-.01.014-.007.02a.705.705 0 00.122.31c.007.01.012.017.02.026.03.038.04.05.067.08.14.15.602.61.645.658.045.05.078.105.114.16.044.07.085.145.122.22.015.038.028.077.04.118.02.075.035.15.045.227.007.047.01.095.012.14.002.06.002.115.002.152 0 .052-.023.15-.025.178a.82.82 0 01-.05.21c-.007.03-.01.068-.02.102-.007.035-.013.057-.02.083-.007.043-.01.047-.015.062-.02.065-.11.258-.18.342-.02.026-.06.083-.1.132-.038.05-.07.092-.097.13-.016.022-.046.064-.076.107-.02.027-.038.048-.05.065a1.44 1.44 0 01-.053.073l-.012.015z" />
    </svg>
  ),
};

const ContactItem = ({ icon, text }) => (
  <p className="text-gray-300 flex items-center justify-center md:justify-start text-base space-x-2">
    {coloredIcons[icon]}
    <span className="break-words">{text}</span>
  </p>
);

export default FooterWithSocial;

function FooterWithSocial() {
  const navigate = useNavigate();
  return (
    <footer className="bg-gray-900 text-white py-10 px-6 sm:px-10 lg:px-16 font-sans antialiased border-t border-gray-700">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
        {/* Company Info */}
        <div className="hidden lg:flex flex-col items-center md:items-start text-center md:text-left">
          <h3 className="text-2xl font-bold mb-4 text-amber-400">Ladli Lakshmi Janhit Trust</h3>
          <p className="text-gray-300 mb-6 max-w-sm leading-relaxed">
            Dedicated to serving our community through innovative solutions and unwavering commitment.
          </p>
          <p className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} Ladli Lakshmi Janhit Trust. All rights reserved.</p>
        </div>

        {/* Quick Links */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <h4 className="text-xl font-semibold mb-4 text-amber-400">Quick Links</h4>
          <ul className="grid grid-cols-2 gap-x-6 w-full max-w-xs">
            {["About Us", "FAQ", "Contact"].map((link) => (
              <li key={link}>
                <a
                  href={`#${link.toLowerCase().replace(/\s/g, '')}`}
                  className="text-gray-400 hover:text-amber-400 transition text-base font-medium"
                >
                  {link}
                </a>
              </li>
            ))}
            <li
              onClick={() => navigate('/privacypolicy')}
              className="cursor-pointer text-gray-400 hover:text-amber-400 transition text-base font-medium"
            >
              Privacy Policy
            </li>
          </ul>

          <p className='mt-4 text-gray-300'>अपनी आईडी में किसी भी प्रकार की अपडेट के लिए ₹100 QR code पर भेजें और स्क्रीनशॉट Whatsapp करें। </p>
          <img
                    src={QRimg}
                    alt="QR code for ID update payment"
                    className="w-36 h-36 md:w-44 md:h-44 object-cover border-2 border-amber-500 rounded-lg shadow mb-8"
                  />
        </div>

        {/* Contact & Social Media */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <h4 className="text-xl font-semibold mb-4 text-amber-400">Connect With Us</h4>
          <div className="space-y-3 w-full max-w-md">
            <ContactItem icon="phone" text="+91 7579631509" />
            <ContactItem icon="mail" text="ladlilaxmi22@gmail.com" />
            <ContactItem icon="map-pin" text="H.No.28 Gali no 2 Sonda Road Devnagar Modinagar Ghaziabad Uttar Pradesh 201204" />
            
          </div>

          <SocialIconsBar />
        </div>
      </div>
    </footer>
  );
}
