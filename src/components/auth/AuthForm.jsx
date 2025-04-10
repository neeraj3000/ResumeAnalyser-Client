import GoogleOAuth from "./GoogleOAuth";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";
import { motion } from "framer-motion";
import { useState } from "react";

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 mt-[-50px]">
      <motion.div
        className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="flex justify-between mb-6">
          <button
            className={`text-lg font-semibold flex-1 p-2 transition-all ${
              isLogin
                ? "border-b-4 border-[#0077B6] text-[#7F56D9]"
                : "text-gray-500"
            }`}
            onClick={() => setIsLogin(true)}
          >
            Sign In
          </button>
          <button
            className={`text-lg font-semibold flex-1 p-2 transition-all ${
              !isLogin
                ? "border-b-4 border-[#0077B6] text-[#7F56D9]"
                : "text-gray-500"
            }`}
            onClick={() => setIsLogin(false)}
          >
            Sign Up
          </button>
        </div>

        {isLogin ? <LoginForm /> : <SignupForm />}
        <div className="mt-4 flex flex-col items-center">
          <GoogleOAuth />
        </div>
      </motion.div>
    </div>
  );
};

export default AuthForm;


{/* <div className="w-full md:w-[700px] h-24 md:h-28 bg-blue-100 border-2 border-dashed border-gray-400 rounded-lg shadow-sm mt-5 md:mt-0"></div> */}