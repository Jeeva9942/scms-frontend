import React, { useState } from "react";
import { Bell, Power } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Mobsms() {
  const [isOpen, setIsOpen] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [messages, setMessages] = useState([
    "Irrigation system running normally.",
    "Moisture level is optimal.",
    "Temperature stable at 29°C.",
  ]);

  const toggleEnable = () => {
    setIsEnabled((prev) => !prev);
  };


  /* Hook up your backend SMS endpoint here with fetch when notifications are enabled */

  return (
    <div className="fixed  top-40 right-10 z-[9999] flex flex-col items-end font-poppins">
      {/* Floating Notification Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-green-600 via-emerald-500 to-green-400 shadow-2xl hover:scale-110 transition-all duration-300 border-2 border-green-200 ${
          isEnabled ? "ring-4 ring-green-300 animate-pulse" : ""
        }`}
        animate={{
          y: [0, -6, 0],
          transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
        }}
      >
        <Bell className="w-7 h-7 text-white drop-shadow-md" />
        {messages.length > 0 && (
          <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full shadow-sm animate-ping"></span>
        )}
      </motion.button>

      {/* Toggle Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="mt-3 bg-white/95 backdrop-blur-xl border border-green-200 rounded-2xl shadow-2xl p-5 w-80 flex flex-col items-center gap-5 ring-1 ring-green-100"
          >
            <h3 className="text-2xl font-extrabold text-green-700 tracking-wide drop-shadow-sm">
              Notification Control
            </h3>

            {/* Enable/Disable Button */}
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={toggleEnable}
              className={`relative flex items-center justify-center w-full h-16 px-8 rounded-full text-lg font-semibold tracking-wide transition-all duration-500 ${
                isEnabled
                  ? "bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 text-white shadow-lg shadow-green-200 hover:shadow-green-300"
                  : "bg-gradient-to-r from-slate-600 via-slate-700 to-slate-800 text-slate-200 shadow-inner hover:shadow-lg hover:shadow-slate-400/20"
              }`}
              style={{
                boxShadow: isEnabled
                  ? "0 0 20px 4px rgba(34,197,94,0.3)"
                  : "inset 0 2px 8px rgba(0,0,0,0.3)",
              }}
            >
              <div className="relative flex items-center gap-3 select-none">
                <motion.div
                  animate={
                    isEnabled
                      ? { scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }
                      : { scale: 1, opacity: 1 }
                  }
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <Power
                    className={`w-7 h-7 transition-colors ${
                      isEnabled
                        ? "text-white drop-shadow-[0_0_10px_#22c55e]"
                        : "text-slate-300"
                    }`}
                  />
                </motion.div>
                <span className="tracking-wide">
                  {isEnabled ? "Enabled" : "Disabled"}
                </span>
              </div>
            </motion.button>

            {/* 👇 Added instruction text */}
            <p className="text-sm text-gray-500 italic font-medium tracking-wide -mt-2">
              Click to {isEnabled ? "disable" : "enable"} notifications
            </p>

            {/* Messages Section */}
            <div className="w-full bg-green-50 rounded-xl p-4 border border-green-100 shadow-inner max-h-64 overflow-y-auto">
              <p className="text-base text-green-800 font-medium mb-3">
                Messages:{" "}
                <span className="font-semibold text-green-600">
                  {messages.length}
                </span>
              </p>

              <div className="flex flex-col gap-3">
                {messages.map((msg, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-3 bg-white rounded-xl shadow-md text-sm text-slate-700 border border-green-100 hover:bg-green-50 transition"
                  >
                    {msg}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
