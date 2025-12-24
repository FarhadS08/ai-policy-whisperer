import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Loader2, Volume2 } from 'lucide-react';
import { VoiceAgentStatus } from '@/hooks/useVoiceAgent';
import { AnimatedOrb } from '@/components/AnimatedOrb';
import { cn } from '@/lib/utils';

interface VoiceOrbButtonProps {
  status: VoiceAgentStatus;
  isSessionActive: boolean;
  onClick?: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const statusConfig: Record<VoiceAgentStatus, { label: string; hue: number }> = {
  idle: { label: 'Start Voice Session', hue: 270 }, // Purple
  connecting: { label: 'Connecting...', hue: 35 }, // Amber/Orange
  connected: { label: 'Ready to Listen', hue: 145 }, // Green
  speaking: { label: 'Agent Speaking', hue: 200 }, // Blue/Cyan
  listening: { label: 'Listening...', hue: 330 }, // Pink/Rose
  error: { label: 'Error - Try Again', hue: 0 }, // Red
};

const sizeConfig = {
  sm: { container: 'w-24 h-24', icon: 'w-5 h-5' },
  md: { container: 'w-32 h-32', icon: 'w-6 h-6' },
  lg: { container: 'w-40 h-40', icon: 'w-7 h-7' },
};

export function VoiceOrbButton({ status, isSessionActive, onClick, disabled, size = 'lg' }: VoiceOrbButtonProps) {
  const config = statusConfig[status];
  const sizeClass = sizeConfig[size];

  // Determine if the orb should be animated
  const isOrbActive = isSessionActive && (status === 'listening' || status === 'connected' || status === 'speaking');

  return (
    <div className="flex flex-col items-center gap-4">
      <motion.button
        onClick={onClick}
        disabled={disabled || status === 'connecting'}
        className={cn(
          'relative rounded-full flex items-center justify-center transition-all duration-300',
          'focus:outline-none focus:ring-4 focus:ring-purple-400/50',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          sizeClass.container
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Animated Orb Background */}
        <AnimatedOrb
          hue={config.hue}
          isActive={isOrbActive}
          className="absolute inset-0"
        />

        {/* Center icon overlay */}
        <motion.div
          className="absolute z-10 flex items-center justify-center w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm border border-white/30"
          animate={status === 'listening' ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.5, repeat: status === 'listening' ? Infinity : 0 }}
        >
          {status === 'connecting' ? (
            <Loader2 className={cn(sizeClass.icon, 'text-white animate-spin')} />
          ) : status === 'speaking' ? (
            <Volume2 className={cn(sizeClass.icon, 'text-white')} />
          ) : status === 'error' ? (
            <MicOff className={cn(sizeClass.icon, 'text-white')} />
          ) : (
            <Mic className={cn(sizeClass.icon, 'text-white')} />
          )}
        </motion.div>

        {/* Status indicator dot */}
        <AnimatePresence>
          {isSessionActive && (
            <motion.div
              className={cn(
                'absolute top-2 right-2 w-3 h-3 rounded-full',
                status === 'listening' ? 'bg-pink-500' :
                status === 'speaking' ? 'bg-cyan-500' :
                status === 'connected' ? 'bg-green-500' :
                'bg-purple-500'
              )}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
            >
              <motion.div
                className="absolute inset-0 rounded-full bg-inherit"
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Status label */}
      <motion.p
        key={status}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-sm font-medium text-muted-foreground"
      >
        {config.label}
      </motion.p>

      {/* Session toggle hint */}
      <p className="text-xs text-muted-foreground/60">
        {isSessionActive ? 'Press to end session' : 'Press to start voice session'}
      </p>
    </div>
  );
}
