import React, { useState, useEffect } from 'react';
import { Bell, Check, X, Clock, User, MessageSquare, Heart, Flag, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/contexts/UserContext';
import { api } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import Sidebar from '@/components/Sidebar';
import { getGreeting } from '@/utils/greetingUtils';

interface Notification {
  id: number;
  type: 'status_change' | 'comment' | 'upvote' | 'admin_message';
  title: string;
  message: string;
  report_id?: string;
  report_type?: 'red-flag' | 'intervention';
  report_title?: string;
  is_read: boolean;
  created_at: string;
  metadata?: any;
}

export default function NotificationsPage() {
  const { user: currentUser } = useUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (currentUser) {
      loadNotifications();
    }
  }, [currentUser]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.getNotifications();
      if (response.status === 200) {
        setNotifications(response.data || []);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      await api.markNotificationRead(notificationId.toString());
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, is_read: true } : notif
        )
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(prev => prev.map(notif => ({ ...notif, is_read: true })));
      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark notifications as read",
        variant: "destructive",
      });
    }
  };

  const deleteNotification = async (notificationId: number) => {
    try {
      await api.deleteNotification(notificationId.toString());
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
      toast({
        title: "Success",
        description: "Notification deleted",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive",
      });
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'status_change':
        return <Flag className="w-5 h-5 text-blue-500" />;
      case 'comment':
        return <MessageSquare className="w-5 h-5 text-green-500" />;
      case 'upvote':
        return <Heart className="w-5 h-5 text-red-500" />;
      case 'admin_message':
        return <User className="w-5 h-5 text-purple-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return date.toLocaleDateString();
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (!currentUser) {
    return <div>Please log in to view notifications</div>;
  }

  return (
    <div className="page-dashboard min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="main-content">
        {/* Header */}
        <div className="page-header">
          <div className="flex-1">
            <div className="mb-2">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Clock size={16} />
                <span className="text-sm">
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-foreground">
                {getGreeting(currentUser?.first_name || 'User')}
              </h1>
            </div>

            <div className="page-subtitle">
              <Bell size={20} className="text-blue-500" />
              <span>Notifications Center</span>
            </div>
            <h2 className="text-xl font-semibold text-muted-foreground">
              Stay updated on your reports
            </h2>
          </div>

          {/* User Profile Section */}
          <div className="flex items-center gap-4" style={{ marginTop: '-6rem' }}>
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium text-foreground">{`${currentUser.first_name} ${currentUser.last_name}`}</div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <User size={12} />
                Citizen Reporter
              </div>
            </div>
            <div className="brand-icon relative">
              <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center">
                <span className="text-lg font-semibold text-primary">
                  {currentUser.first_name?.[0]}{currentUser.last_name?.[0]}
                </span>
              </div>
              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-bold">{unreadCount}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-6">
          <div className="cards-grid">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Notifications</p>
                    <p className="text-2xl font-bold">{notifications.length}</p>
                  </div>
                  <Bell className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Unread</p>
                    <p className="text-2xl font-bold text-blue-600">{unreadCount}</p>
                  </div>
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold">{unreadCount}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">This Week</p>
                    <p className="text-2xl font-bold">
                      {notifications.filter(n => {
                        const weekAgo = new Date();
                        weekAgo.setDate(weekAgo.getDate() - 7);
                        return new Date(n.created_at) > weekAgo;
                      }).length}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Actions */}
        <div className="mb-6 flex gap-3">
          <Button onClick={markAllAsRead} disabled={unreadCount === 0}>
            <Check className="w-4 h-4 mr-2" />
            Mark All as Read
          </Button>
          <Button variant="outline" onClick={loadNotifications}>
            Refresh
          </Button>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-muted rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No notifications yet</h3>
              <p className="text-muted-foreground">
                You'll receive notifications when there are updates to your reports or new activity.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`transition-all duration-200 hover:shadow-md ${
                  !notification.is_read ? 'border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20' : ''
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground mb-1">
                            {notification.title}
                          </h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            {notification.message}
                          </p>

                          {notification.report_title && (
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="text-xs">
                                {notification.report_type === 'red-flag' ? 'Red Flag' : 'Intervention'}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                "{notification.report_title}"
                              </span>
                            </div>
                          )}

                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>{formatDate(notification.created_at)}</span>
                            {!notification.is_read && (
                              <Badge variant="secondary" className="text-xs">
                                New
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          {!notification.is_read && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => markAsRead(notification.id)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteNotification(notification.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
