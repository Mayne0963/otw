"use client";

import { useState, useEffect } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
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
  Target
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

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
}

// TODO: Replace with actual API call to fetch user tasks from backend
const mockTasks: Task[] = [];

const getTypeColor = (type: string) => {
  switch (type) {
    case 'daily': return 'text-blue-400';
    case 'weekly': return 'text-green-400';
    case 'monthly': return 'text-purple-400';
    case 'achievement': return 'text-otw-gold';
    default: return 'text-gray-400';
  }
};

const getTypeBadge = (type: string) => {
  switch (type) {
    case 'daily': return 'bg-blue-500/20 text-blue-400';
    case 'weekly': return 'bg-green-500/20 text-green-400';
    case 'monthly': return 'bg-purple-500/20 text-purple-400';
    case 'achievement': return 'bg-otw-gold/20 text-otw-gold';
    default: return 'bg-gray-500/20 text-gray-400';
  }
};

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [filter, setFilter] = useState<'all' | 'daily' | 'weekly' | 'monthly' | 'achievement'>('all');
  const [totalPoints, setTotalPoints] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    // Calculate total points earned
    const earned = tasks.filter(task => task.completed).reduce((sum, task) => sum + task.points, 0);
    setTotalPoints(earned);
  }, [tasks]);

  const filteredTasks = filter === 'all' ? tasks : tasks.filter(task => task.type === filter);

  const completeTask = (taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, completed: true } : task
    ));
  };

  const getTimeRemaining = (expiresAt?: Date) => {
    if (!expiresAt) return null;
    const now = new Date();
    const diff = expiresAt.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m remaining`;
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-otw-gold/20">
              <Trophy className="w-5 h-5 text-otw-gold" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Points</p>
              <p className="text-xl font-bold text-otw-gold">{totalPoints}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-green-500/20">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Completed</p>
              <p className="text-xl font-bold">{tasks.filter(t => t.completed).length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-blue-500/20">
              <Target className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Available</p>
              <p className="text-xl font-bold">{tasks.filter(t => !t.completed).length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {['all', 'daily', 'weekly', 'monthly', 'achievement'].map((type) => (
          <Button
            key={type}
            variant={filter === type ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(type as any)}
            className={filter === type ? "bg-otw-gold text-black hover:bg-otw-gold/90" : ""}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </Button>
        ))}
      </div>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTasks.map((task) => {
          const Icon = task.icon;
          const progressPercentage = task.progress ? (task.progress.current / task.progress.total) * 100 : 0;
          
          return (
            <Card key={task.id} className={`p-6 relative ${task.completed ? 'opacity-75' : ''}`}>
              {task.completed && (
                <div className="absolute top-4 right-4">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
              )}
              
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-full bg-gray-800`}>
                  <Icon className={`w-6 h-6 ${getTypeColor(task.type)}`} />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">{task.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs ${getTypeBadge(task.type)}`}>
                      {task.type}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-400 mb-3">{task.description}</p>
                  
                  {task.progress && (
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Progress</span>
                        <span>{task.progress.current}/{task.progress.total}</span>
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
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Gift className="w-4 h-4 text-otw-gold" />
                        <span className="text-sm font-medium text-otw-gold">{task.points} pts</span>
                      </div>
                      
                      {task.expiresAt && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-orange-400" />
                          <span className="text-xs text-orange-400">
                            {getTimeRemaining(task.expiresAt)}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {!task.completed && (
                      <Button
                        size="sm"
                        onClick={() => completeTask(task.id)}
                        className="bg-otw-red hover:bg-otw-gold hover:text-black"
                      >
                        Complete
                      </Button>
                    )}
                  </div>
                  
                  {task.reward && (
                    <div className="mt-3 p-2 bg-otw-gold/10 rounded border border-otw-gold/20">
                      <p className="text-xs text-otw-gold">
                        <strong>Reward:</strong> {task.reward}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      
      {filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-400 mb-2">No tasks available</h3>
          <p className="text-sm text-gray-500">Check back later for new tasks and challenges!</p>
        </div>
      )}
    </div>
  );
}