"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles, BookOpen, Zap, Shield, GitBranch, Play, Users, Award, TrendingUp, Brain, Clock, Target } from "lucide-react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";

const examplePrompts = [
  "Teach me React in 14 days",
  "Explain quantum computing basics",
  "Learn Spanish in 30 days",
  "Master machine learning fundamentals",
  "Understand blockchain technology",
];

const features = [
  { icon: Sparkles, title: "AI-Generated Courses", description: "Describe what you want to learn, and our AI creates a personalized course just for you.", color: "from-violet-500 to-purple-500" },
  { icon: BookOpen, title: "Mastery-Based Learning", description: "Prove you understand each concept before moving forward. No more passive clicking.", color: "from-blue-500 to-cyan-500" },
  { icon: Zap, title: "Adaptive Learning", description: "The system adjusts to your pace, identifies weak areas, and generates targeted practice.", color: "from-amber-500 to-orange-500" },
  { icon: Shield, title: "Gamification", description: "Earn XP, maintain streaks, and level up as you master new skills.", color: "from-emerald-500 to-green-500" },
];

const stats = [
  { icon: Users, value: "50K+", label: "Active Learners" },
  { icon: Award, value: "120K+", label: "Courses Created" },
  { icon: TrendingUp, value: "94%", label: "Mastery Rate" },
  { icon: Clock, value: "15M+", label: "Hours Learned" },
];

const howItWorks = [
  { step: 1, icon: Target, title: "Describe Your Goal", description: "Tell us what you want to learn and your time constraints" },
  { step: 2, icon: Brain, title: "AI Creates Your Path", description: "Our AI generates a personalized course with lessons, quizzes, and practice" },
  { step: 3, icon: Sparkles, title: "Learn & Master", description: "Progress through locked units, earn XP, and prove your mastery" },
];

function FloatingOrb({ className, delay = 0 }: { className: string; delay?: number }) {
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl opacity-30 ${className}`}
      animate={{
        y: [-20, 20, -20],
        x: [-10, 10, -10],
        scale: [1, 1.1, 1],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        delay,
        ease: "easeInOut",
      }}
    />
  );
}

function ParticleField() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-blue-400 rounded-full"
          initial={{
            x: Math.random() * 100 + "%",
            y: Math.random() * 100 + "%",
            opacity: 0,
          }}
          animate={{
            y: [null, `${Math.random() * -100}%`],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 5,
          }}
        />
      ))}
    </div>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.95]);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        setMousePos({
          x: ((e.clientX - rect.left) / rect.width) * 100,
          y: ((e.clientY - rect.top) / rect.height) * 100,
        });
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      router.push(`/create?prompt=${encodeURIComponent(prompt)}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <FloatingOrb className="w-96 h-96 bg-blue-600 -top-48 -left-48" delay={0} />
        <FloatingOrb className="w-80 h-80 bg-purple-600 top-1/4 -right-40" delay={1} />
        <FloatingOrb className="w-64 h-64 bg-indigo-600 bottom-0 left-1/4" delay={2} />
        <FloatingOrb className="w-72 h-72 bg-cyan-600 top-1/2 right-1/4" delay={0.5} />
        <ParticleField />

        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      {/* Header */}
      <header className="relative z-50 border-b border-white/10 backdrop-blur-xl bg-slate-900/50 sticky top-0">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
              <span className="text-white font-bold text-sm">K</span>
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">Kibi</span>
          </motion.div>
          <motion.nav
            className="hidden md:flex items-center gap-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Link href="/explore" className="text-sm text-slate-400 hover:text-white transition-colors">
              Explore
            </Link>
            <Link href="/login" className="text-sm text-slate-400 hover:text-white transition-colors">
              Sign in
            </Link>
            <Link href="/signup">
              <Button size="sm" className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg shadow-purple-500/25">
                Get Started
              </Button>
            </Link>
          </motion.nav>
        </div>
      </header>

      {/* Hero Section */}
      <motion.section
        ref={heroRef}
        className="relative py-20 md:py-40 overflow-hidden"
        style={{ opacity: heroOpacity, scale: heroScale }}
      >
        <div
          className="absolute inset-0 opacity-50 pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, rgba(99, 102, 241, 0.15) 0%, transparent 50%)`,
          }}
        />

        <div className="container mx-auto px-4 text-center relative z-10">
          <AnimatePresence>
            {isLoaded && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Badge className="mb-6 px-4 py-1.5 text-sm bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-blue-300 backdrop-blur-sm">
                    <Sparkles className="w-3.5 h-3.5 mr-2" />
                    AI-Powered Personalized Learning
                  </Badge>
                </motion.div>

                <motion.h1
                  className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                    What do you want to
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    learn today?
                  </span>
                </motion.h1>

                <motion.p
                  className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto mb-12"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  Describe any topic, and Kibi creates a personalized course with lessons,
                  <br className="hidden md:block" />
                  quizzes, and flashcards tailored to your learning style.
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Search/Prompt Input */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="max-w-3xl mx-auto mb-8"
          >
            <form onSubmit={handleSubmit} className="relative">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity" />
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Teach me React in 14 days..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="h-16 pl-6 pr-32 text-lg bg-slate-900/80 border-2 border-slate-700 focus:border-blue-500 rounded-2xl shadow-2xl backdrop-blur-xl transition-all"
                  />
                  <Button
                    type="submit"
                    size="lg"
                    className="absolute right-2 top-2 h-12 px-6 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg shadow-purple-500/30 rounded-xl"
                    disabled={!prompt.trim()}
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate
                  </Button>
                </div>
              </div>
            </form>
          </motion.div>

          {/* Example Prompts */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex flex-wrap justify-center gap-3 mb-20"
          >
            <span className="text-sm text-slate-500">Try:</span>
            {examplePrompts.map((example, i) => (
              <motion.button
                key={example}
                onClick={() => setPrompt(example)}
                className="text-sm px-3 py-1.5 rounded-full bg-slate-800/50 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700/50 hover:border-slate-600 transition-all"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                {example}
              </motion.button>
            ))}
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-4xl mx-auto mb-20"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.7 + i * 0.1 }}
                className="text-center p-4 rounded-2xl bg-slate-800/30 backdrop-blur-sm border border-slate-700/50"
              >
                <stat.icon className="w-6 h-6 mx-auto mb-2 text-blue-400" />
                <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">{stat.value}</div>
                <div className="text-xs md:text-sm text-slate-500">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Feature Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto"
          >
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.8 + i * 0.1 }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
              >
                <Card className="border-0 shadow-2xl bg-slate-800/30 backdrop-blur-xl overflow-hidden group">
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                  <CardContent className="pt-6 relative z-10">
                    <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 shadow-lg`}>
                      <feature.icon className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2 text-white">{feature.title}</h3>
                    <p className="text-sm text-slate-400">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* How It Works Section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                How It Works
              </span>
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Start learning in seconds with AI-powered personalized courses
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {howItWorks.map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="relative"
              >
                <div className="text-8xl font-bold text-slate-800 absolute -top-4 -left-2">{item.step}</div>
                <Card className="border-0 bg-slate-800/30 backdrop-blur-xl p-8 relative z-10">
                  <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${['from-blue-500 to-cyan-500', 'from-purple-500 to-pink-500', 'from-amber-500 to-orange-500'][i]} flex items-center justify-center mb-6 shadow-lg`}>
                    <item.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-white">{item.title}</h3>
                  <p className="text-slate-400">{item.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20" />
        <div className="absolute inset-0 backdrop-blur-3xl" />

        <motion.div
          className="container mx-auto px-4 text-center relative z-10"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Ready to become a
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> master?</span>
          </h2>
          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
            Join thousands of learners mastering new skills every day with AI-powered personalized courses.
          </p>
          <Link href="/signup">
            <Button size="lg" className="h-14 px-10 text-lg bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:opacity-90 shadow-2xl shadow-purple-500/30 rounded-2xl">
              <Play className="mr-3 h-5 w-5" />
              Start Learning Free
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 bg-slate-950/50 relative z-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">K</span>
              </div>
              <span className="font-bold text-xl">Kibi</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <Link href="/about" className="hover:text-white transition-colors">About</Link>
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-white">
                <GitBranch className="h-5 w-5" />
              </a>
            </div>
            <p className="text-sm text-slate-500">
              Built with AI. Powered by curiosity.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
