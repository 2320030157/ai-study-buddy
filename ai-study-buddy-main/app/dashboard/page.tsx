'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

interface StudyStats {
  totalStudyTime: number;
  flashcardsReviewed: number;
  topicsLearned: number;
  streakDays: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<StudyStats>({
    totalStudyTime: 0,
    flashcardsReviewed: 0,
    topicsLearned: 0,
    streakDays: 0,
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));

    // TODO: Fetch real stats from API
    setStats({
      totalStudyTime: 120, // minutes
      flashcardsReviewed: 50,
      topicsLearned: 8,
      streakDays: 3,
    });
  }, [router]);

  const quickActions = [
    {
      title: 'Create Flashcards',
      description: 'Make new flashcards for your topics',
      icon: '🎴',
      link: '/flashcards/create',
      color: 'from-blue-500 to-purple-500',
    },
    {
      title: 'Study Plan',
      description: 'View or update your study schedule',
      icon: '📅',
      link: '/study-plan',
      color: 'from-purple-500 to-pink-500',
    },
    {
      title: 'Practice Quiz',
      description: 'Test your knowledge',
      icon: '✍️',
      link: '/quiz',
      color: 'from-green-500 to-teal-500',
    },
    {
      title: 'Ask AI Tutor',
      description: 'Get help with difficult topics',
      icon: '🤖',
      link: '/chat',
      color: 'from-orange-500 to-red-500',
    },
  ];

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 py-8">
      <div className="container mx-auto px-4">
        {/* Welcome Section */}
        <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-purple-100 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center text-2xl">
              {user.name[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user.name}! 👋</h1>
              <p className="text-gray-600">Ready to continue your learning journey?</p>
            </div>
          </div>

          {/* Study Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4">
              <div className="text-2xl mb-1">⏱️</div>
              <div className="text-sm text-gray-600">Study Time</div>
              <div className="text-xl font-bold text-gray-900">{stats.totalStudyTime} mins</div>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4">
              <div className="text-2xl mb-1">🎴</div>
              <div className="text-sm text-gray-600">Flashcards</div>
              <div className="text-xl font-bold text-gray-900">{stats.flashcardsReviewed} reviewed</div>
            </div>
            <div className="bg-gradient-to-r from-pink-50 to-pink-100 rounded-xl p-4">
              <div className="text-2xl mb-1">📚</div>
              <div className="text-sm text-gray-600">Topics</div>
              <div className="text-xl font-bold text-gray-900">{stats.topicsLearned} learned</div>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4">
              <div className="text-2xl mb-1">🔥</div>
              <div className="text-sm text-gray-600">Streak</div>
              <div className="text-xl font-bold text-gray-900">{stats.streakDays} days</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Actions 🚀</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {quickActions.map((action) => (
            <Link href={action.link} key={action.title}>
              <div className={`bg-gradient-to-r ${action.color} text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1`}>
                <div className="text-3xl mb-4">{action.icon}</div>
                <h3 className="text-lg font-bold mb-2">{action.title}</h3>
                <p className="text-sm opacity-90">{action.description}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent Activity */}
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Activity 📝</h2>
        <div className="bg-white rounded-2xl p-6 shadow-xl border-2 border-purple-100">
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <span className="text-2xl">🎯</span>
              <div>
                <h4 className="font-medium text-gray-900">Completed Daily Goal</h4>
                <p className="text-sm text-gray-600">30 minutes of focused study</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <span className="text-2xl">🎴</span>
              <div>
                <h4 className="font-medium text-gray-900">Created New Flashcards</h4>
                <p className="text-sm text-gray-600">Added 10 cards to Mathematics</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <span className="text-2xl">📚</span>
              <div>
                <h4 className="font-medium text-gray-900">Started New Topic</h4>
                <p className="text-sm text-gray-600">Began learning about Photosynthesis</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 