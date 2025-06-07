import React from 'react';

const FAQ = () => {
    // Array of FAQ items, extracted from the provided images
    const faqItems = [
        {
            question: "What is the donation required to become a Volunteer in the Trust?",
            answer: "A donation of ₹400 is mandatory to become a Volunteer in the Ladli Lakshmi Janhit Trust. This donation grants you the position of a Volunteer (स्वयंसेवक)."
        },
        {
            question: "What are the responsibilities after becoming a volunteer?",
            answer: "Upon becoming a volunteer, you will be expected to participate in the Trust's social programs, which are designed to help you and the community."
        },
        {
            question: "Is Ladli Lakshmi Janhit Trust a for-profit organization?",
            answer: "No, this is a non-profit trust. The Trust does not take any money from individuals; any help provided by a person is done so voluntarily."
        },
        {
            question: "How can one receive rewards from the Trust?",
            answer: "To receive rewards, you will need to complete specific levels within the Trust's programs."
        },
        {
            question: "What is the minimum and maximum financial help one can receive?",
            answer: "You can receive financial assistance starting from a minimum of ₹100, or multiples such as ₹100×2, ₹100×3, and so on, from the help provided by the Trust."
        },
        {
            question: "What happens to the money received from the Trust?",
            answer: "From the help received from the Trust, ₹20 will be deducted from your wallet every month and deposited into a 'helping wallet'."
        },
        {
            question: "Can you explain the crowdfunding model?",
            answer: "The crowdfunding model involves a structure where, for example, 'YOU' bring in 2 direct members. These direct members then expand the network further, creating a cascading structure of 'AUTO' placements (3 AUTO, 4 AUTO, 5 AUTO, 6 AUTO, etc.), which contributes to the collective fund."
        }
    ];

    return (
        <section  className="bg-gray-100 py-16 px-4 sm:px-6 lg:px-8 font-sans antialiased">
            <div id="faq" className="max-w-4xl mx-auto">
                <h2 className="text-4xl font-extrabold text-gray-900 text-center mb-12">
                    Frequently Asked Questions
                </h2>

                <div className="space-y-6">
                    {faqItems.map((item, index) => (
                        <div key={index} className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-xl font-semibold text-gray-800 mb-3">
                                {item.question}
                            </h3>
                            <p className="text-gray-700 leading-relaxed">
                                {item.answer}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <p className="text-gray-600 text-lg">
                        For more details, please visit our official website:
                    </p>
                    
                </div>
            </div>
        </section>
    );
};

export default FAQ;
