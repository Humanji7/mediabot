import HeroSection from "@/components/HeroSection";

const Index = () => {
  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: "#FDF8F6",
        backgroundImage: `
        radial-gradient(circle at 10% 20%, rgba(233, 213, 255, 0.4) 0%, transparent 40%),
        radial-gradient(circle at 80% 90%, rgba(251, 219, 246, 0.4) 0%, transparent 40%)
      `,
      }}
    >
      <HeroSection />
    </div>
  );
};

export default Index;
