import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();

  const goToLogin = useCallback(() => {
    navigate("/login");
  }, [navigate]);

  return (
    <>
      <style>{`
        @keyframes subtleGradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .gradient-bg {
          background: linear-gradient(-45deg, #f8fafc, #f1f5f9, #e2e8f0, #cbd5e1);
          background-size: 300% 300%;
          animation: subtleGradient 20s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      <div className="relative flex flex-col items-center justify-center min-h-screen p-6 text-center overflow-hidden">
        {/* Subtle Background */}
        <div className="absolute inset-0 gradient-bg opacity-40"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-gray-50/40 to-purple-50/30"></div>

        {/* Content */}
        <div className="relative z-10 max-w-md mx-auto animate-in fade-in duration-1000">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-500">
              Автоматизируйте SMM
            </span>{" "}
            <span className="text-gray-800">вашего бизнеса с ИИ</span>
          </h1>

          <p className="mt-6 text-lg text-gray-600 animate-in fade-in delay-300 duration-800">
            Медиабот создаст уникальный контент для ваших соцсетей, чтобы вы
            могли сосредоточиться на развитии бизнеса.
          </p>

          <button
            onClick={goToLogin}
            className="mt-8 group relative bg-gradient-to-r from-purple-500 to-pink-400 text-white font-bold py-4 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-500 animate-in fade-in delay-600 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-300 focus:ring-opacity-50"
          >
            <span className="relative z-10">Начать бесплатно</span>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </button>
        </div>
      </div>
    </>
  );
};

export default HeroSection;
