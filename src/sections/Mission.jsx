import React from "react";
import image2 from "../assets/image2.png"; // Import your image


const Mission = () => {
  return (
    <section className="bg-gray-100 py-16 px-4 sm:px-6 lg:px-8 font-sans antialiased">
      <div id="missions" className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-extrabold text-gray-900 text-center mb-10">
          Mission of the Trust
        </h2>

        <div className="flex flex-col lg:flex-row items-center lg:space-x-12 mb-16">
          {/* Image Section */}
          <div className="lg:w-1/3 mb-8 lg:mb-0">
            <img
              src={image2}
              alt="Ladli Lakshmi Janhit Trust"
              className="rounded-lg shadow-xl w-full h-auto object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "https://placehold.co/600x400/D1D5DB/4B5563?text=Image+Not+Found";
              }}
            />
            
          </div>

          {/* Content Section */}
          <div className="lg:w-1/2 text-gray-700">
            <div className="mb-8">
              <h3 className="text-3xl font-bold text-gray-800 mb-4">
                Our Vision
              </h3>
              <p className="text-lg leading-relaxed">
                The vision of our Trust is to become a symbol of hope and
                progress in our community, inspiring positive change and setting
                standards of excellence. We envision a future where every member
                of our community is dedicated through our commitment to
                integrity, compassion, and continuous improvement. Our goal is
                to create a lasting legacy that transforms lives and uplifts the
                spirits of our community.
              </p>
            </div>

            <div>
              <h3 className="text-3xl font-bold text-gray-800 mb-4">
                Our Mission
              </h3>
              <p className="text-lg leading-relaxed">
                We are dedicated to serving our community through innovative
                solutions and unwavering commitment. Our mission is to promote
                development by fostering inclusivity, sustainability, and
                collaborative partnerships. We aim to empower individuals and
                enhance the quality of life. Through every effort, we strive to
                make a comprehensive impact that will affect future generations,
                securing their future.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Mission;
