'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/check');
        const data = await res.json();

        if (data.authenticated) {
          router.push('/chat');
        } else {
          router.push('/login');
        }
      } catch (error) {
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string
  title: string
  description: string
}) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-purple-100">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

const features = [
  {
    emoji: '🧠',
    title: 'Smart Learning Helper',
    description: "Get fun and easy explanations for any topic you're studying!",
    gradientFrom: '#4F46E5',
    gradientTo: '#7C3AED',
  },
  {
    emoji: '⏰',
    title: 'Study Time Planner',
    description: 'Create your perfect study schedule with fun breaks and rewards!',
    gradientFrom: '#2563EB',
    gradientTo: '#3B82F6',
  },
  {
    emoji: '🎴',
    title: 'Fun Flashcards',
    description: 'Learn with colorful and interactive memory cards!',
    gradientFrom: '#7C3AED',
    gradientTo: '#9333EA',
  },
  {
    emoji: '🤔',
    title: 'Always Here to Help',
    description: "Got questions? I'm here 24/7 to help you learn!",
    gradientFrom: '#9333EA',
    gradientTo: '#C026D3',
  },
  {
    emoji: '📚',
    title: 'Cool Learning Resources',
    description: 'Discover amazing videos, games, and books to learn from!',
    gradientFrom: '#3B82F6',
    gradientTo: '#2563EB',
  },
  {
    emoji: '📝',
    title: 'Magic Notes',
    description: 'Turn boring notes into fun and colorful summaries!',
    gradientFrom: '#C026D3',
    gradientTo: '#4F46E5',
  },
];

const funFacts = [
  {
    emoji: '🌟',
    text: 'Did you know? Your brain can process images 60,000 times faster than text!',
  },
  {
    emoji: '🎵',
    text: 'Learning while listening to music can improve your memory by up to 40%!',
  },
  {
    emoji: '🌈',
    text: 'Using different colors in your notes can increase memory retention by 50-80%!',
  },
];
