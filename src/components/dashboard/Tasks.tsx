'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import {
  CheckCircle,
  Clock,
  Star,
  Gift,
  Users,
  MessageSquare,
  Camera,
  Share2,
  Trophy,
  Target,
  Loader2,
  RefreshCw,
  Calendar,
  Award,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';

interface Task {
  id: string;
  title: string;
  description: string;
  points: number;
  type: 'daily' | 'weekly' | 'monthly' | 'achievement';
  icon: any;
  completed: boolean;
  progress?: {
    current: number;
    total: number;
  };
  reward?: string;
  expiresAt?: Date;
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

// Enhanced mock tasks with more variety and better structure
const generateMockTasks = (): Task[] => [
  {
    id: '1',
    title: 'Place Your First Order',
    description: 'Complete your first food delivery order to get started',
    points: 100,
    type: 'achievement',
    icon: Gift,
    completed: false,
    category: 'Getting Started',
    difficulty: 'easy',
  },
  {
    id: '2',
    title: 'Daily Check-in',
    description: 'Open the app and check your dashboard',
    points: 10,
    type: 'daily',
    icon: Calendar,
    completed: true,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    category: 'Engagement',
    difficulty: 'easy',
  },
  {
    id: '3',
    title: 'Rate a Restaurant',
    description: 'Leave a review for a restaurant you ordered from',
    points: 25,
    type: 'weekly',
    icon: Star,
    completed: false,
    progress: { current: 0, total: 1 },
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    category: 'Community',
    difficulty: 'easy',
  },
  {
    id: '4',
    title: 'Share on Social Media',
    description: 'Share your favorite meal on social media',
    points: 50,
    type: 'weekly',
    icon: Share2,
    completed: false,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    category: 'Social',
    difficulty: 'medium',
  },
  {
    id: '5',
    title: 'Complete 10 Orders',
    description: 'Place 10 successful orders this month',
    points: 500,
    type: 'monthly',
    icon: Target,
    completed: false,
    progress: { current: 3, total: 10 },
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    category: 'Loyalty',
    difficulty: 'hard',
  },
  {
    id: '6',
    title: 'Refer a Friend',
    description: 'Invite a friend to join OTW and earn bonus points',
    points: 200,
    type: 'achievement',
    icon: Users,
    completed: false,
    category: 'Referral',
    difficulty: 'medium',
  },
  {
    id: '7',
    title: 'Upload Food Photo',
    description: 'Share a photo of your delivered meal',
    points: 30,
    type: 'daily',
    icon: Camera,
    completed: false,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    category: 'Content',
    difficulty: 'easy',
  },
  {
    id: '8',
    title: 'VIP Member',
    description: 'Maintain VIP status for 3 consecutive months',
    points: 1000,
    type: 'achievement',
    icon: Trophy,
    completed: false,
    progress: { current: 1, total: 3 },
    category: 'Status',
    difficulty: 'hard',
  },
];



export default function Tasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'daily' | 'weekly' | 'monthly' | 'achievement'>('all');
  const [totalPoints, setTotalPoints] = useState(0);
  const [completedToday, setCompletedToday] = useState(0);
  const [availablePoints, setAvailablePoints] = useState(0);

  // Load tasks (simulated API call)
  const loadTasks = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate mock tasks
      const mockTasks = generateMockTasks();
      setTasks(mockTasks);
      
      // Calculate stats
      const earned = mockTasks.filter(task => task.completed).reduce((sum, task) => sum + task.points, 0);
      const available = mockTasks.filter(task => !task.completed).reduce((sum, task) => sum + task.points, 0);
      const todayCompleted = mockTasks.filter(task => 
        task.completed && 
        task.type === 'daily' && 
        task.expiresAt && 
        task.expiresAt > new Date()
      ).length;
      
      setTotalPoints(earned);
      setAvailablePoints(available);
      setCompletedToday(todayCompleted);
      
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Refresh function
  const handleRefresh = useCallback(async () => {
    await loadTasks(true);
  }, [loadTasks]);

  const filteredTasks = filter === 'all' ? tasks : tasks.filter(task => task.type === filter);

  const completeTask = useCallback((taskId: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId && !task.completed) {
        const updatedTask = { ...task, completed: true };
        // Update points immediately
        setTotalPoints(current => current + task.points);
        setAvailablePoints(current => current - task.points);
        
        // Show success feedback (could be a toast notification)
        console.log(`Task completed! +${task.points} points`);
        
        return updatedTask;
      }
      return task;
    }));
  }, []);

  const getTimeRemaining = (expiresAt?: Date) => {
    if (!expiresAt) return null;
    const now = new Date();
    const diff = expiresAt.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m remaining`;
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400 bg-green-400/10';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10';
      case 'hard': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getProgressPercentage = (progress?: { current: number; total: number }) => {
    if (!progress) return 0;
    return Math.min((progress.current / progress.total) * 100, 100);
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-otw-gold" />
        <p className="text-gray-400">Loading your tasks...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Tasks & Rewards</h2>
          <p className="text-gray-400 mt-1">Complete tasks to earn points and unlock rewards</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={cn('w-4 h-4', refreshing && 'animate-spin')} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-otw-gold/20 to-yellow-500/20 rounded-lg p-6 border border-otw-gold/30">
          <div className="flex items-center space-x-3">
            <Award className="w-8 h-8 text-otw-gold" />
            <div>
              <div className="text-2xl font-bold text-white">{totalPoints}</div>
              <div className="text-sm text-gray-300">Points Earned</div>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg p-6 border border-blue-500/30">
          <div className="flex items-center space-x-3">
            <Target className="w-8 h-8 text-blue-400" />
            <div>
              <div className="text-2xl font-bold text-white">{availablePoints}</div>
              <div className="text-sm text-gray-300">Available Points</div>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg p-6 border border-green-500/30">
          <div className="flex items-center space-x-3">
            <Calendar className="w-8 h-8 text-green-400" />
            <div>
              <div className="text-2xl font-bold text-white">{completedToday}</div>
              <div className="text-sm text-gray-300">Completed Today</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-1 bg-gray-800 rounded-lg p-1">
        {[
          { key: 'all', label: 'All Tasks' },
          { key: 'daily', label: 'Daily' },
          { key: 'weekly', label: 'Weekly' },
          { key: 'monthly', label: 'Monthly' },
          { key: 'achievement', label: 'Achievements' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as any)}
            className={cn(
              'flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors',
              filter === tab.key
                ? 'bg-otw-gold text-black'
                : 'text-gray-400 hover:text-white hover:bg-gray-700',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tasks Grid */}
      <div className="grid gap-4">
        {filteredTasks.map((task) => {
          const timeRemaining = getTimeRemaining(task.expiresAt);
          const Icon = task.icon;
          const progressPercentage = getProgressPercentage(task.progress);

          return (
            <div
              key={task.id}
              className={cn(
                'bg-gray-800 rounded-lg p-6 border transition-all duration-200 hover:shadow-lg',
                task.completed
                  ? 'border-green-500/30 bg-green-500/5'
                  : 'border-gray-700 hover:border-gray-600',
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className={cn(
                    'p-3 rounded-lg',
                    task.type === 'daily' && 'bg-blue-500/20 text-blue-400',
                    task.type === 'weekly' && 'bg-purple-500/20 text-purple-400',
                    task.type === 'monthly' && 'bg-orange-500/20 text-orange-400',
                    task.type === 'achievement' && 'bg-yellow-500/20 text-yellow-400',
                  )}>
                    <Icon className="w-6 h-6" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold text-white">{task.title}</h3>
                      <span className={cn(
                        'px-2 py-1 text-xs font-medium rounded-full capitalize',
                        task.type === 'daily' && 'bg-blue-500/20 text-blue-400',
                        task.type === 'weekly' && 'bg-purple-500/20 text-purple-400',
                        task.type === 'monthly' && 'bg-orange-500/20 text-orange-400',
                        task.type === 'achievement' && 'bg-yellow-500/20 text-yellow-400',
                      )}>
                        {task.type}
                      </span>
                      {task.difficulty && (
                        <span className={cn(
                          'px-2 py-1 text-xs font-medium rounded-full capitalize',
                          getDifficultyColor(task.difficulty)
                        )}>
                          {task.difficulty}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-400 text-sm mb-3">{task.description}</p>
                    
                    {task.progress && (
                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-400">Progress</span>
                          <span className="text-white">
                            {task.progress.current}/{task.progress.total}
                          </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-otw-gold h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progressPercentage}%` }}
                          />
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Award className="w-4 h-4 text-otw-gold" />
                          <span className="text-otw-gold font-semibold">{task.points} pts</span>
                        </div>
                        
                        {task.category && (
                          <span className="text-gray-500 text-sm">{task.category}</span>
                        )}
                        
                        {timeRemaining && (
                          <div className="flex items-center space-x-1">
                            <Clock className={cn(
                              'w-4 h-4',
                              timeRemaining === 'Expired' ? 'text-red-400' : 'text-gray-400'
                            )} />
                            <span className={cn(
                              'text-sm',
                              timeRemaining === 'Expired' ? 'text-red-400' : 'text-gray-400'
                            )}>
                              {timeRemaining}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {!task.completed && timeRemaining !== 'Expired' && (
                        <button
                          onClick={() => completeTask(task.id)}
                          className="px-4 py-2 bg-otw-gold text-black font-medium rounded-lg hover:bg-yellow-500 transition-colors focus:outline-none focus:ring-2 focus:ring-otw-gold focus:ring-offset-2 focus:ring-offset-gray-800"
                        >
                          Complete
                        </button>
                      )}
                      
                      {task.completed && (
                        <div className="flex items-center space-x-2 text-green-400">
                          <CheckCircle className="w-5 h-5" />
                          <span className="font-medium">Completed</span>
                        </div>
                      )}
                      
                      {timeRemaining === 'Expired' && !task.completed && (
                        <div className="flex items-center space-x-2 text-red-400">
                          <Clock className="w-5 h-5" />
                          <span className="font-medium">Expired</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No tasks available</h3>
          <p className="text-gray-400 mb-4">
            {filter === 'all'
              ? 'Check back later for new tasks and challenges!'
              : `No ${filter} tasks available at the moment.`}
          </p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-otw-gold text-black font-medium rounded-lg hover:bg-yellow-500 transition-colors"
          >
            Refresh Tasks
          </button>
        </div>
      )}
    </div>
  );
}