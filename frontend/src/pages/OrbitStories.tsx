import { motion } from 'framer-motion';
import { Moon, Star, Rocket } from 'lucide-react';

const storyCards = [
  {
    icon: Moon,
    title: 'Creator Launchpads',
    description:
      'Peek behind the curtain of how creators wire smart-contract powered tiers without touching a server.',
  },
  {
    icon: Rocket,
    title: 'Autonomous Billing',
    description:
      'Understand the orbit of payments as Massa’s autonomous contracts renew subscriptions every 30 days.',
  },
  {
    icon: Star,
    title: 'Community Signals',
    description:
      'Follow the “Nebula notes” feed where fans leave encrypted shout-outs directly on-chain.',
  },
];

export default function OrbitStories() {
  return (
    <div className="max-w-5xl mx-auto px-4 pt-20 pb-24 space-y-10">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
        <p className="text-sm uppercase tracking-[0.3em] text-white/50">Orbit Stories</p>
        <h1 className="text-4xl md:text-5xl font-black gradient-text">The Cartoon Logbook</h1>
        <p className="text-white/70 max-w-3xl mx-auto">
          Weekly storyboard that documents how CreatorOrbit evolves. Perfect for sharing progress during hackathons and
          investor syncs.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6">
        {storyCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass p-6 rounded-3xl border border-white/5 space-y-4"
            >
              <Icon className="w-10 h-10 text-pink-300" />
              <h3 className="text-xl font-semibold">{card.title}</h3>
              <p className="text-white/70 text-sm leading-relaxed">{card.description}</p>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-8 rounded-3xl border border-white/10 space-y-3"
      >
        <p className="text-sm uppercase text-white/40">Coming Soon</p>
        <h2 className="text-2xl font-bold">Orbit Magazine PDF Export</h2>
        <p className="text-white/70">
          Click a single button to export the latest logbook as a cartoon PDF. Great for content announcements, VC
          updates, or pinning to your Massa DeWeb site.
        </p>
      </motion.div>
    </div>
  );
}

