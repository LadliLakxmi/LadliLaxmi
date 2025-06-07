import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-gray-800 text-white py-8 px-4 sm:px-6 lg:px-8 font-sans antialiased border-t-[1px] border-gray-600">
            <div className="max-w-7xl mx-auto flex flex-col lg:grid lg:grid-cols-3 gap-10">
                {/* Company Info */}
                <div className="hidden lg:flex flex-col items-center lg:items-start text-center lg:text-left">
                    <h3 className="text-xl sm:text-2xl font-bold mb-3">Ladli Lakshmi Janhit Trust</h3>
                    <p className="text-gray-400 text-sm sm:text-base leading-relaxed mb-3 max-w-sm">
                        Dedicated to serving our community through innovative solutions and unwavering commitment.
                    </p>
                    <p className="text-gray-400 text-xs sm:text-sm lg:hidden">&copy; {new Date().getFullYear()} Ladli Lakshmi Janhit Trust. All rights reserved.</p>
                </div>

                {/* Quick Links */}
                <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                    <h4 className="text-lg sm:text-xl font-semibold mb-3">Quick Links</h4>
                    <ul className="grid grid-cols-2 gap-2 sm:gap-3 w-full max-w-xs">
                        {["About Us", "FAQ", "Contact", "Privacy Policy"].map((link) => (
                            <li key={link}>
                                <a href="#" className="text-gray-400 hover:text-rose-500 transition text-sm sm:text-base">
                                    {link}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Contact & Social Media */}
                <div className="flex flex-col items-center lg:items-start text-center lg:text-left ">
                    <h4 className="text-lg sm:text-xl font-semibold mb-3">Connect With Us</h4>
                    <div className="space-y-2 mb-4 w-full max-w-sm">
                        <ContactItem icon="phone" text="+91 7820009103" />
                        <ContactItem icon="mail" text="ladlilaxmi22@gmail.com" />
                        <ContactItem icon="map-pin" text="H.No.28 Gali no 2 Sonda Road Devnagar Modinagar Ghaziabad Uttar Pradesh 201204" />
                    </div>
                    
                </div>
            </div>

            {/* Desktop Copyright */}
            <div className="mt-4 text-center hidden lg:block">
                <p className="text-gray-500 text-xs">&copy; {new Date().getFullYear()} Ladli Lakshmi Janhit Trust. All rights reserved.</p>
            </div>
        </footer>
    );
};

// Reusable Contact Item Component
const ContactItem = ({ icon, text }) => {
    const icons = {
        phone: (
            <svg className="lucide lucide-phone mr-2 flex-shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 01-2.18 2c-3.54-.6-7.18-2.53-10.27-5.63-3.1-3.1-5.03-6.73-5.63-10.27A2 2 0 014.11 2h3a2 2 0 012 1.72c.14.95.43 1.89.85 2.74a2 2 0 01-.45 2.11l-1.27 1.27a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.85.42 1.79.71 2.74.85A2 2 0 0122 16.92z"/>
            </svg>
        ),
        mail: (
            <svg className="lucide lucide-mail mr-2 flex-shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 01-2.06 0L2 7" />
            </svg>
        ),
        "map-pin": (
            <svg className="lucide lucide-map-pin mr-2 mt-0.5 flex-shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 18.3a2 2 0 100-4 2 2 0 000 4Z"/>
                <path d="M12 22s8-4 8-10a8 8 0 00-16 0c0 6 8 10 8 10Z"/>
            </svg>
        ),
    };

    return (
        <p className="text-gray-400 flex items-start justify-center lg:justify-start text-sm sm:text-base">
            {icons[icon]}
            <span className="break-words text-wrap">{text}</span>
        </p>
    );
};

export default Footer;
