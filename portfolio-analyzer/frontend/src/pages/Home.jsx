import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  TrendingUp, 
  Shield, 
  Cpu, 
  ChevronRight,
  ArrowRight,
  Zap,
  Layers,
  PieChart,
  MessageSquare
} from 'lucide-react';

const features = [
  {
    icon: TrendingUp,
    title: "Dynamic Diversification",
    description: "Real-time analysis of your portfolio's sector allocation and risk concentration.",
    color: "text-blue-500",
    bg: "bg-blue-500/10"
  },
  {
    icon: Shield,
    title: "Risk Assessment",
    description: "Industry-standard metrics like HHI Intensity and Entropy levels to safeguard your assets.",
    color: "text-purple-500",
    bg: "bg-purple-500/10"
  },
  {
    icon: Cpu,
    title: "AI Strategy Advisor",
    description: "Personalized investment strategies powered by advanced narrative-based AI models.",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10"
  }
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#050505]">
      {/* Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 pt-24 pb-32 relative z-10">
        {/* Hero Section */}
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-4"
          >
            <Sparkles size={14} />
            The Future of Portfolio Analysis
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold font-['Outfit'] text-white leading-tight tracking-tight"
          >
            Master Your Assets with <br />
            <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 bg-clip-text text-transparent">
              Nexus Intelligence
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed"
          >
            Navigate the complexities of modern finance with our state-of-the-art diversification analyzer and AI-driven strategy advisor.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8"
          >
            <button
              onClick={() => navigate('/analyzer')}
              className="w-full sm:w-auto px-8 py-4 bg-white text-black font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-200 transition-all hover:scale-105"
            >
              Start Analysis <ArrowRight size={20} />
            </button>
            <button
              onClick={() => navigate('/advisor')}
              className="w-full sm:w-auto px-8 py-4 bg-white/5 text-white border border-white/10 font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
            >
              Chat with AI <MessageSquare size={20} className="text-purple-400" />
            </button>
          </motion.div>
        </div>

        {/* Feature Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32"
        >
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="p-8 rounded-[32px] bg-[#0a0a0a] border border-white/5 hover:border-white/10 transition-all group"
            >
              <div className={`p-4 w-fit rounded-2xl ${feature.bg} ${feature.color} mb-6 group-hover:scale-110 transition-transform`}>
                <feature.icon size={28} />
              </div>
              <h3 className="text-xl font-bold text-white font-['Outfit'] mb-3">{feature.title}</h3>
              <p className="text-gray-500 leading-relaxed text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </motion.div>

        {/* Stats Preview */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-32 p-12 rounded-[40px] bg-gradient-to-br from-blue-600/5 to-purple-600/5 border border-white/5 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-12 opacity-5">
            <Layers size={200} />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: "Assets Analyzed", value: "$2.4B+" },
              { label: "Active Users", value: "150K+" },
              { label: "AI Predictions", value: "94.2%" },
              { label: "Data Integrity", value: "99.9%" }
            ].map((stat, i) => (
              <div key={i} className="space-y-2">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{stat.label}</p>
                <p className="text-3xl font-bold text-white font-['Outfit']">{stat.value}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
