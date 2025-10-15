import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import newAttendoLogo from "@/assets/300372602_367089768961179_2671218216233570040_n.png";
import krctImage from "@/assets/krct image.jpg";

const Splash = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/login-selection");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gradient-primary relative overflow-hidden">
      {/* Animated background circles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      <div className="relative z-10 text-center space-y-8 animate-in fade-in zoom-in duration-700">
        {/* College Banner - replaced with KRCT image */}
        <div className="mb-8 rounded-2xl overflow-hidden shadow-large mx-auto max-w-2xl">
          <img 
            src={krctImage} 
            alt="KRCT College" 
            className="w-full h-48 object-cover"
          />
        </div>

        {/* App Logo - replaced with new image */}
        <div className="flex justify-center">
          <div className="bg-white p-6 rounded-3xl shadow-large transition-smooth hover:scale-105">
            <img 
              src={newAttendoLogo} 
              alt="Attendo App Logo" 
              className="w-32 h-32 object-cover"
            />
          </div>
        </div>

        {/* College Name and App Name */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white tracking-wide mb-2">
            K. RAMAKRISHNAN COLLEGE OF TECHNOLOGY
          </h2>
          <h1 className="text-6xl font-bold text-white tracking-tight">
            Attendo
          </h1>
          <p className="text-xl text-white/90 font-medium">
            Smart Attendance Management
          </p>
        </div>

        {/* Loading indicator */}
        <div className="flex justify-center pt-8">
          <div className="flex gap-2">
            <div className="w-3 h-3 bg-white rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-white rounded-full animate-bounce delay-100"></div>
            <div className="w-3 h-3 bg-white rounded-full animate-bounce delay-200"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Splash;
