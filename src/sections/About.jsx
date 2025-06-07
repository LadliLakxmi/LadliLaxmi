import React from 'react';
import image1 from '../assets/image1.png'; // Import your image
const About = () => {
    return (
        <section  className="bg-gray-100 py-16 px-4 sm:px-6 lg:px-8 font-sans antialiased">
            <div id="about" className="max-w-7xl mx-auto">
                <h2 className="text-4xl font-extrabold text-gray-900 text-center mb-12">
                    About Trust
                </h2>

                {/* Benefits Section */}
                <div className="bg-white rounded-lg shadow-xl p-8 ">
                    
                    <div className="flex flex-col lg:flex-row items-start lg:space-x-12">
                        {/* Image for Benefits */}
                        <div className="lg:w-1/3 mb-8 lg:mb-0">
                            <img
                                // src="https://placehold.co/400x300/A0AEC0/FFFFFF?text=Benefits+Image"
                                src={image1}
                                alt="Benefits"
                                className="rounded-lg shadow-md w-full object-cover"
                                onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/400x300/A0AEC0/FFFFFF?text=Image+Not+Found"; }}
                            />
                        </div>
                        <div className="lg:w-2/3 text-gray-700">
                            <ul className="list-disc list-inside space-y-3 text-lg leading-relaxed">
                                <li>Cooperation in Kanyadaan (daughter's marriage).</li>
                                <li>Financial assistance in road accidents.</li>
                                <li>Financial assistance in case of accidental death.</li>
                                <li>Working for tree plantation.</li>
                                <li>Promoting cow protection.</li>
                                <li>Cooperation for the education of poor children.</li>
                                <li>Arrangement of blanket distribution and bonfires in winters.</li>
                                <li>Arrangement of cold water in summers.</li>
                                <li>Kanyadaan for marriages of poor daughters.</li>
                            </ul>
                        </div>
                    </div>
                    
                </div>
            </div>
        </section>
    );
};

export default About;
