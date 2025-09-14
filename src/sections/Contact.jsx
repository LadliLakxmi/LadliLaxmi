import React from "react";
import QRimg from "../assets/QRQuery.jpg"; // Adjust image path as needed

const Contact = () => {
  return (
    <section
      className="relative w-full min-h-screen bg-gray-100 flex items-center justify-center font-sans antialiased"
      style={{ minHeight: "100vh" }}
    >
      <div className="max-w-5xl w-full mx-auto bg-white rounded-3xl shadow-2xl p-10 md:p-16 flex flex-col items-center">
        <h2 className="text-4xl md:text-4xl font-extrabold text-gray-900 text-center mb-8">
          Contact & ID Update Information
        </h2>

        <p className="text-lg font-semibold text-gray-800 mb-3">
          📞 Contact Number: <span className="text-amber-600">7579631509</span>
        </p>
        <p className="text-base text-gray-800 mb-8 text-center max-w-xl">
          अपनी आईडी में किसी भी प्रकार की अपडेट के लिए{" "}
          <span className="font-semibold text-amber-600">₹100</span> QR पर भेजें और स्क्रीनशॉट ऊपर दिए नंबर पर Whatsapp करें।
        </p>

        <img
          src={QRimg}
          alt="QR code for ID update payment"
          className="w-56 h-56 md:w-64 md:h-64 object-cover border-2 border-amber-500 rounded-lg shadow mb-8"
        />

        <p className="text-sm text-gray-600 mb-8 text-center font-medium max-w-sm">
          भुगतान का स्क्रीनशॉट <span className="font-bold text-amber-600">7579631509</span> पर भेजें।
        </p>

        <h3 className="text-2xl font-bold text-amber-600 mb-4 text-center">
          Important Links & Announcements
        </h3>

        <ul className="space-y-8 text-base text-gray-700 w-full max-w-3xl px-4 md:px-0">
          <li>
            <p className="text-amber-600 mb-2 font-semibold">
              स्पेशल टेलीग्राम मीटिंग 𝐋𝐚𝐝𝐥𝐢 𝐋𝐚𝐤𝐬𝐡𝐦𝐢 𝐉𝐚𝐧𝐡𝐢𝐭 𝐓𝐫𝐮𝐬𝐭 का पूरा प्लान जानकारी
            </p>
            <p className="mb-3 leading-relaxed whitespace-pre-line">
              𝐏𝐥𝐚𝐧 𝐂𝐚𝐥𝐜𝐮𝐥𝐚𝐭𝐢𝐨𝐧 – कैसे मिलेगा ज्यादा लाभ, कम समय में
              <br />
              𝐃𝐨𝐧𝐚𝐭𝐢𝐨𝐧 𝐎𝐧𝐥𝐲 𝐎𝐧𝐞 𝐓𝐢𝐦𝐞 𝟒𝟎𝟎 रूपये
              <br />
              टोटल इनकम 𝟕𝟎 करोड़ और साथ में 2 करोड़ का रिवार्ड मिलेगा
              <br />
              🌹 बदलाव लाने की चाह रखने वाले ज़रूर जुड़ें
              <br />
              🌹 नए लोग ज़रूर जुड़ें – आपके सवालों के मिलेंगे जवाब
              <br />
              <strong className="text-amber-600">टेलीग्राम मीटिंग लिंक:</strong>{" "}
              <a
                href="https://t.me/+lpRQaDIeKJ5jMzU1"
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-blue-700 break-words"
              >
                https://t.me/+lpRQaDIeKJ5jMzU1
              </a>
              <br />
              मीटिंग टाइम 𝟎𝟗:𝟎𝟎 𝐏𝐌
              <br />
              समय पर जुड़ें, क्योंकि मौके इंतजार नहीं करते!
              <br />
              <strong>🙏 कृपया सभी सीनियर्स अपनी पूरी टीम के समय से मीटिंग में शामिल हों</strong>
            </p>
          </li>

          <li>
            <p className="font-semibold mb-1">YouTube Shorts लिंक:</p>
            <a
              href="https://youtube.com/shorts/Ukw--W4lH2U?si=eh2hN1SFQK8OutIJ"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-blue-700 break-words"
            >
              https://youtube.com/shorts/Ukw--W4lH2U?si=eh2hN1SFQK8OutIJ
            </a>
          </li>

          <li>
            <p className="font-semibold mb-1">Official YouTube Channel:</p>
            <a
              href="https://www.youtube.com/@LadliLaxmi-d6r6t"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-blue-700 break-words"
            >
              https://www.youtube.com/@LadliLaxmi-d6r6t
            </a>
          </li>

          <li>
            <p className="font-semibold mb-1">Official Whatsapp Channel:</p>
            <a
              href="https://chat.whatsapp.com/LSjtlL6yIdMGb7SeDWKz33"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-blue-700 break-words"
            >
              https://chat.whatsapp.com/LSjtlL6yIdMGb7SeDWKz33
            </a>
          </li>
        </ul>
          
          <p className="text-lg mt-4 text-gray-700">
            हमारी टीम आपके हर सवाल और सुझाव के लिए उपलब्ध है। कृपया ऊपर दिए गए साधनों का ही प्रयोग करें।
          </p>

      </div>
    </section>
  );
};

export default Contact;
