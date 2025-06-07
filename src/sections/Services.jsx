import React from 'react';

const Services = () => {
    return (
        <section className="bg-white py-16 px-4 sm:px-6 lg:px-8 font-sans antialiased">
            <div id="services"  className="max-w-7xl mx-auto">
                <h2 className="text-4xl font-extrabold text-gray-900 text-center mb-12">
                    Our Services
                </h2>

                <div className="flex flex-col lg:flex-row items-center lg:space-x-12 mb-16">
                    {/* Image Section - You can replace this with a relevant service image */}
                    
                    {/* Content Section */}
                    <div className="flex text-gray-700">
                        <div className="mb-8">
                            <h3 className="text-3xl font-bold text-gray-800 mb-4">Community Support Programs</h3>
                            <p className="text-lg leading-relaxed">
                                We offer various programs aimed at uplifting the community, including educational support
                                for underprivileged children, financial aid for families in distress, and initiatives
                                for environmental sustainability. Our goal is to create a positive impact on society.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-3xl font-bold text-gray-800 mb-4">Health & Welfare Initiatives</h3>
                            <p className="text-lg leading-relaxed">
                                Our trust is committed to promoting health and welfare through various initiatives such
                                as providing medical assistance, organizing health camps, and distributing essential
                                supplies to those in need. We believe in ensuring basic necessities for everyone.
                            </p>
                        </div>

                       
                    </div>
                </div>

                {/* Additional Services Section (Optional - similar to Benefits in About) */}
                <div className="bg-gray-50 rounded-lg shadow-xl p-8">
                    <h3 className="text-3xl font-extrabold text-gray-900 text-center mb-8">
                        Key Service Areas
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-gray-700">
                        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out">
                            <h4 className="text-xl font-semibold text-gray-800 mb-3">Education Support</h4>
                            <p className="text-base leading-relaxed">
                                Providing scholarships, school supplies, and tutoring for underprivileged students to ensure access to quality education.
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out">
                            <h4 className="text-xl font-semibold text-gray-800 mb-3">Disaster Relief</h4>
                            <p className="text-base leading-relaxed">
                                Offering immediate aid, shelter, and rehabilitation support to communities affected by natural calamities.
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out">
                            <h4 className="text-xl font-semibold text-gray-800 mb-3">Skill Development</h4>
                            <p className="text-base leading-relaxed">
                                Organizing workshops and training programs to equip youth and adults with employable skills for a better future.
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out">
                            <h4 className="text-xl font-semibold text-gray-800 mb-3">Environmental Conservation</h4>
                            <p className="text-base leading-relaxed">
                                Initiating tree plantation drives, waste management projects, and awareness campaigns for a greener environment.
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out">
                            <h4 className="text-xl font-semibold text-gray-800 mb-3">Elderly Care</h4>
                            <p className="text-base leading-relaxed">
                                Providing support and care for the elderly, including medical assistance, companionship, and daily necessities.
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out">
                            <h4 className="text-xl font-semibold text-gray-800 mb-3">Women Empowerment</h4>
                            <p className="text-base leading-relaxed">
                                Promoting gender equality through vocational training, self-help groups, and awareness programs for women.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Services;
