import React, { useState, useEffect } from 'react';
import { Clock, User, Flag, MessageSquare, CheckCircle, XCircle, AlertTriangle, Edit, Share2 } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { api } from '@/services/api';

interface ActivityItem {
  id: string;
  type: 'report_created' | 'report_updated' | 'comment_added' | 'status_changed' | 'report_shared';
  title: string;
  description: string;
  timestamp: string;
  user: {
    name: string;
    avatar?: string;
  };
  reportType?: 'red-flag' | 'intervention';
  reportId?: string;
  metadata?: {
    oldStatus?: string;
    newStatus?: string;
    commentCount?: number;
  };
}

interface ActivityTimelineProps {
  limit?: number;
  showHeader?: boolean;
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  limit = 10,
  showHeader = true
}) => {
  const { user: currentUser } = useUser();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      setLoading(true);
      // For now, we'll generate mock data. In a real app, this would come from an API
      const mockActivities: ActivityItem[] = [
        {
          id: '1',
          type: 'report_created',
          title: 'New Red Flag Report Created',
          description: 'Corruption case reported in Lagos Central District',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
          user: {
            name: 'John Doe',
            avatar: undefined
          },
          reportType: 'red-flag',
          reportId: 'RF-001'
        },
        {
          id: '2',
          type: 'status_changed',
          title: 'Report Status Updated',
          description: 'Intervention request moved to "Under Investigation"',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
          user: {
            name: 'Admin Team',
            avatar: undefined
          },
          reportType: 'intervention',
          reportId: 'INT-005',
          metadata: {
            oldStatus: 'Draft',
            newStatus: 'Under Investigation'
          }
        },
        {
          id: '3',
          type: 'comment_added',
          title: 'New Comment Added',
          description: 'Stakeholder added update to healthcare facility report',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
          user: {
            name: 'Sarah Johnson',
            avatar: undefined
          },
          reportType: 'red-flag',
          reportId: 'RF-003',
          metadata: {
            commentCount: 3
          }
        },
        {
          id: '4',
          type: 'report_updated',
          title: 'Report Evidence Updated',
          description: 'Additional photos added to infrastructure complaint',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
          user: {
            name: 'Mike Wilson',
            avatar: undefined
          },
          reportType: 'intervention',
          reportId: 'INT-002'
        },
        {
          id: '5',
          type: 'status_changed',
          title: 'Report Resolved',
          description: 'Street lighting issue successfully addressed',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8 hours ago
          user: {
            name: 'Admin Team',
            avatar: undefined
          },
          reportType: 'intervention',
          reportId: 'INT-001',
          metadata: {
            oldStatus: 'Under Investigation',
            newStatus: 'Resolved'
          }
        }
      ];

      setActivities(mockActivities.slice(0, limit));
    } catch (error) {
      console.error('Failed to load activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'report_created':
        return <Flag size={16} className="text-blue-500" />;
      case 'report_updated':
        return <Edit size={16} className="text-orange-500" />;
      case 'comment_added':
        return <MessageSquare size={16} className="text-green-500" />;
      case 'status_changed':
        return <CheckCircle size={16} className="text-purple-500" />;
      case 'report_shared':
        return <Share2 size={16} className="text-indigo-500" />;
      default:
        return <Clock size={16} className="text-gray-500" />;
    }
  };

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'report_created':
        return 'border-l-blue-500';
      case 'report_updated':
        return 'border-l-orange-500';
      case 'comment_added':
        return 'border-l-green-500';
      case 'status_changed':
        return 'border-l-purple-500';
      case 'report_shared':
        return 'border-l-indigo-500';
      default:
        return 'border-l-gray-500';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return time.toLocaleDateString();
  };

  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (loading) {
    return (
      <div className="activity-timeline">
        {showHeader && (
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
          </div>
        )}
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-8 h-8 bg-muted rounded-full flex-shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="activity-timeline">
      {showHeader && (
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Clock size={20} className="text-primary" />
            Recent Activity
          </h3>
          <button
            onClick={loadActivities}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Refresh
          </button>
        </div>
      )}

      <div className="space-y-4">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock size={48} className="mx-auto mb-4 opacity-50" />
            <p>No recent activity</p>
          </div>
        ) : (
          activities.map((activity, index) => (
            <div
              key={activity.id}
              className={`flex gap-4 p-4 rounded-lg border-l-4 bg-card hover:bg-muted/50 transition-all duration-200 cursor-pointer group ${getActivityColor(activity.type)}`}
            >
              {/* User Avatar */}
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border-2 border-border">
                  {activity.user.avatar ? (
                    <img
                      src={activity.user.avatar}
                      alt={activity.user.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-semibold text-primary">
                      {getUserInitials(activity.user.name)}
                    </span>
                  )}
                </div>
              </div>

              {/* Activity Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getActivityIcon(activity.type)}
                      <h4 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                        {activity.title}
                      </h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {activity.description}
                    </p>

                    {/* Metadata for status changes */}
                    {activity.type === 'status_changed' && activity.metadata && (
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs px-2 py-1 bg-muted rounded-full text-muted-foreground">
                          {activity.metadata.oldStatus} → {activity.metadata.newStatus}
                        </span>
                      </div>
                    )}

                    {/* Report type badge */}
                    {activity.reportType && (
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          activity.reportType === 'red-flag'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        }`}>
                          {activity.reportType === 'red-flag' ? 'Red Flag' : 'Intervention'}
                        </span>
                        {activity.reportId && (
                          <span className="text-xs text-muted-foreground">
                            #{activity.reportId}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Timestamp */}
                  <div className="flex-shrink-0 text-xs text-muted-foreground">
                    {formatTimeAgo(activity.timestamp)}
                  </div>
                </div>

                {/* User info */}
                <div className="flex items-center gap-2 mt-2">
                  <User size={12} className="text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    by {activity.user.name}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {activities.length > 0 && (
        <div className="mt-6 text-center">
          <button className="text-sm text-primary hover:text-primary/80 transition-colors font-medium">
            View All Activity →
          </button>
        </div>
      )}
    </div>
  );
};

export default ActivityTimeline;
