import React from "react";
import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
} from "react-icons/fa";

const Footer = () => {
  const footerStyle = {
    backgroundImage: `url("https://images.unsplash.com/photo-1557683316-973673baf926?ixlib=rb-4.0.3")`,
  };

  return (
    <footer className="relative" aria-label="Site Footer">
      <div className="bg-cover bg-center bg-no-repeat" style={footerStyle}>
        <div className="absolute inset-0 bg-gray-900/90 dark:bg-gray-950/90"></div>

        <div className="relative px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-screen-xl">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
              <div>
                <div className="flex items-center">
                  <img
                    src="https://images.unsplash.com/photo-1563906267088-b029e7101114?ixlib=rb-4.0.3"
                    className="w-12 h-12 rounded-full"
                    alt="Company Logo"
                  />
                  <h2 className="ml-3 text-2xl font-bold text-white">
                    Company Name
                  </h2>
                </div>

                <p className="mt-4 max-w-xs text-gray-300">
                  Lorem ipsum dolor sit amet consectetur adipisicing elit.
                  Voluptas, accusantium.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:col-span-2">
                <div>
                  <h3 className="text-lg font-medium text-white">
                    Quick Links
                  </h3>
                  <nav className="mt-4">
                    <ul className="space-y-2 text-sm">
                      {["About", "Services", "Projects", "Blog", "Careers"].map(
                        (item) => (
                          <li key={item}>
                            <button className="text-gray-300 transition hover:text-white hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-white">
                              {item}
                            </button>
                          </li>
                        )
                      )}
                    </ul>
                  </nav>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-white">
                    Contact Info
                  </h3>
                  <ul className="mt-4 space-y-3 text-sm">
                    <li className="flex items-center text-gray-300">
                      <FaPhone className="mr-3" />
                      <span>+1 (555) 123-4567</span>
                    </li>
                    <li className="flex items-center text-gray-300">
                      <FaEnvelope className="mr-3" />
                      <span>contact@example.com</span>
                    </li>
                    <li className="flex items-center text-gray-300">
                      <FaMapMarkerAlt className="mr-3" />
                      <span>
                        123 Business Ave, Suite 100
                        <br />
                        New York, NY 10001
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-white">Follow Us</h3>
                <div className="mt-4 flex space-x-4">
                  {[
                    { Icon: FaFacebook, label: "Facebook" },
                    { Icon: FaTwitter, label: "Twitter" },
                    { Icon: FaInstagram, label: "Instagram" },
                    { Icon: FaLinkedin, label: "LinkedIn" },
                  ].map(({ Icon, label }) => (
                    <button
                      key={label}
                      className="text-gray-300 transition hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-white rounded-full p-2"
                      aria-label={label}
                    >
                      <Icon className="h-6 w-6" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-1">
                <h3 className="text-lg font-medium text-white">Stay in Loop</h3>
                <div className="mt-4">
                  <form className="flex flex-col space-y-4">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="px-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
                      required
                    />
                    <button
                      type="submit"
                      className="px-6 py-2 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-200 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900"
                    >
                      Sign Up
                    </button>
                  </form>
                </div>
              </div>
            </div>

            <div className="mt-12 border-t border-gray-800 pt-8">
              <div className="text-center text-sm text-gray-400">
                <p>
                  © {new Date().getFullYear()} Company Name. All rights
                  reserved.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
