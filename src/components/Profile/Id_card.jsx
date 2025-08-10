import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import logo from "../../assets/Logo.png" // Commented out: Local file paths are not accessible to html2canvas

const Id_card = ({ user }) => {
  // Create a ref to attach to the ID card element that we want to capture
  const idCardRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Function to handle the image download
  const handleDownloadImage = async () => {
    if (!idCardRef.current) {
      console.error("ID card element not found for capture.");
      return;
    }

    setIsDownloading(true); // Set loading state

    try {
      // Use html2canvas to capture the content of the div referenced by idCardRef
      const canvas = await html2canvas(idCardRef.current, {
        useCORS: true, // Important if you have images from different origins
        scale: 2, // Increase scale for better resolution of the downloaded image
        logging: true, // Enable logging for debugging
      });

      // Convert the canvas to a data URL (PNG format by default)
      const image = canvas.toDataURL('image/png');

      // Create a temporary link element
      const link = document.createElement('a');
      link.href = image; // Set the image data as the link's href
      link.download = `${user?.name || 'user'}_id_card.png`; // Set the download filename

      // Append the link to the document body and programmatically click it
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link); // Clean up the temporary link

    } catch (error) {
      console.error("Error generating or downloading ID card:", error);
      alert("Failed to download ID card. Please try again."); // Using alert as a fallback for user feedback
    } finally {
      setIsDownloading(false); // Reset loading state
    }
  };

  // Render a message if user data is not available
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white p-4">
        <div className="bg-[#141628] p-6 rounded-lg shadow-lg text-center">
          <p className="text-lg">No user data provided to display the ID card.</p>
          <p className="text-sm text-gray-400 mt-2">Please ensure user information is passed as props.</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={idCardRef} className="flex flex-col items-center justify-center min-h-screen p-4 font-inter">
      {/* ID Card Container - This is what will be captured */}
      <div
        
        className="relative w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 hover:scale-105"
        style={{
          aspectRatio: '1.586 / 1',
          minHeight: '550px', // Increased minHeight significantly for new layout
          background: '#1d4ed8', // Solid blue color (approximates blue-700)
          padding: '24px' // Added padding to the main card for better spacing
        }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10 ">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <pattern id="pattern-circles" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="rgba(255,255,255,0.2)" />
            </pattern>
            <rect x="0" y="0" width="100%" height="100%" fill="url(#pattern-circles)" />
          </svg>
        </div>

        {/* Card Content */}
        <div className="relative flex flex-col h-full justify-between">
          {/* Header */}
          <div className="flex justify-between items-start mb-6"> {/* Increased margin-bottom */}
            <div className="text-white">
              <h1 className="text-2xl font-extrabold tracking-wide">MEMBER ID</h1>
              <p className="text-xs  mt-1">Ladli Laxmi Janhit Trust</p> {/* Added trust name */}
            </div>
            {/* Company Logo - Using a placeholder image URL for html2canvas compatibility */}
            <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-md" style={{ backgroundColor: '#ffffff' }}>
              <img
                src={logo}// Placeholder for logo
                alt="Company Logo"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/48x48/ffffff/000000?text=LOGO"; }}
              />
            </div>
          </div>

          {/* User Info & Photo Area */}
          <div className="flex flex-col items-center justify-center mb-4"> {/* Changed to flex-col for stacked layout */}
            {/* Physical Photo Placeholder */}
            <div
              className="flex items-center justify-center shadow-lg border-2 border-white mb-4"
              style={{
                width: '132px', // Approx 3.5cm at 300dpi (137px for 3.5cm)
                height: '170px', // Approx 4.5cm at 300dpi (177px for 4.5cm)
                backgroundColor: '#e0e0e0', // Light gray for the blank photo area
                color: '#666',
                fontSize: '0.8rem',
                textAlign: 'center',
                lineHeight: '1.2',
                borderRadius: '8px', // Slightly rounded corners for the photo box
                padding: '8px'
              }}
            >
              <span className="block">Paste Passport Size Photo Here</span>
            </div>

            <div className='text-white flex flex-col text-center mb-2'>
               <p className="font-semibold text-2xl">{user.name}</p>
               <p className="font-semibold text-base">{user.email|| 'N/A'}</p>
             </div>
          </div>

          {/* Details Grid - Adjusted margin-top to create space */}
          <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-white text-base mt-auto"> {/* Adjusted gap and font size */}
            <div>
              <p className="font-semibold opacity-80">Referral ID:</p>
              <p className="font-bold">{user.referralCode || 'N/A'}</p>
            </div>
            <div>
              <p className="font-semibold opacity-80">Current Level:</p>
              <p className="font-bold">L {user.currentLevel || 0}</p>
            </div>
            <div >
              <p className="font-semibold opacity-80">Member ID:</p>
              <p className="font-bold">Laxmi {user._id ? user._id.substring(0, 5) : 'N/A'}</p>
            </div>
            <div>
              <p className="font-semibold opacity-80">Phone:</p>
              <p className="font-bold">{user?.phone || 'N/A'}</p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-white text-xs opacity-70 mt-6"> {/* Increased margin-top */}
            <p>&copy; 2025 Ladli Laxmi Janhit Trust. All Rights Reserved.</p> {/* Added trust name */}
          </div>
        </div>
      </div>

      {/* Download Button */}
      <button
        onClick={handleDownloadImage}
        className="mt-8 px-8 py-3 text-white font-bold rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-opacity-50 flex items-center gap-2"
        style={{ backgroundColor: '#16a34a', '--tw-ring-color': '#22c55e' }} // bg-green-600, hover:bg-green-700, focus:ring-green-500
        disabled={isDownloading}
      >
        {isDownloading ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Downloading...
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l3-3m-3 3l-3-3m2.81 7.263A9.916 9.916 0 0112 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10c0 2.1-.65 4.05-1.737 5.793M12 20h9" />
            </svg>
            Download ID Card
          </>
        )}
      </button>
    </div>
  );
};

export default Id_card;
