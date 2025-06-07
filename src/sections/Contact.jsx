import React, { useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";

const Contact = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // success | error

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setStatus(null);

      const response = await axios.post(`${import.meta.env.VITE_APP_BACKEND_URL}/api/v1/auth/mail`, data);

      if (response.data.success) {
        setStatus("success");
        reset(); // clear form
      } else {
        setStatus("error");
      }
    } catch (err) {
      console.error("Mail error:", err);
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full bg-gray-100 py-16 px-4 sm:px-6 lg:px-8 font-sans antialiased">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 grid-cols-1 gap-12 items-center">
        {/* Form */}
        <div className="bg-white rounded-2xl p-8 md:p-12 lg:p-16 flex flex-col justify-center items-center shadow-xl">
          <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-8">
            Send us a message today
          </h2>

          <form className="w-full space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <input
              type="text"
              placeholder="Enter your full name"
              {...register("fullname", { required: "Full name is required" })}
              className="text-black w-full px-6 py-3 rounded-lg border-2 border-gray-200 focus:outline-none focus:border-amber-500"
            />
            {errors.fullname && <p className="text-red-500 text-sm">{errors.fullname.message}</p>}

            <input
              type="email"
              placeholder="Enter your valid Email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Invalid email format",
                },
              })}
              className="text-black w-full px-6 py-3 rounded-lg border-2 border-gray-200 focus:outline-none focus:border-amber-500"
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}

            <input
              type="tel"
              placeholder="Enter your mobile number"
              {...register("phoneNo", {
                required: "Phone number is required",
                pattern: {
                  value: /^[0-9]{10,15}$/,
                  message: "Enter a valid number",
                },
              })}
              className="text-black w-full px-6 py-3 rounded-lg border-2 border-gray-200 focus:outline-none focus:border-amber-500"
            />
            {errors.phoneNo && <p className="text-red-500 text-sm">{errors.phoneNo.message}</p>}

            <textarea
              placeholder="Enter your message here..."
              rows="5"
              {...register("message", {
                required: "Message is required",
                minLength: { value: 10, message: "At least 10 characters" },
              })}
              className="text-black w-full px-6 py-3 rounded-lg border-2 border-gray-200 focus:outline-none focus:border-amber-500"
            />
            {errors.message && <p className="text-red-500 text-sm">{errors.message.message}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50"
            >
              {loading ? "Sending..." : "SEND MESSAGE"}
            </button>

            {/* Status messages */}
            {status === "success" && (
              <p className="text-green-600 text-center font-semibold mt-2">
                ✅ Message sent successfully!
              </p>
            )}
            {status === "error" && (
              <p className="text-red-600 text-center font-semibold mt-2">
                ❌ Failed to send message. Please try again.
              </p>
            )}
          </form>
        </div>

        {/* Info Section (unchanged) */}
        <div className="flex flex-col justify-center items-start lg:p-12 p-6 text-gray-700">
          <h3 className="text-xl font-semibold text-amber-600 mb-4">REACH US</h3>
          <h2 className="text-4xl md:text-5xl font-extrabold leading-tight text-gray-900 mb-8">
            Get in touch with us for any inquiries or support.
          </h2>
          <p className="text-lg leading-relaxed mb-8">
            We are here to help and answer any question you might have. We look
            forward to hearing from you.
          </p>
          {/* Contact details (same as before) */}
        </div>
      </div>
    </section>
  );
};

export default Contact;
