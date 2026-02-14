'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { 
  Bell, 
  Send, 
  Loader2, 
  AlertCircle,
  Users,
  Globe,
  Search,
  X,
  Check,
  Mail,
  Smartphone,
  Layers
} from 'lucide-react';
import { toast } from 'sonner';
import { adminService, type AdminUser, FilterOperation, type NotificationChannel } from '@/services/admin.service';
import { newsletterService } from '@/services/newsletter.service';
import { usePermissions } from '@/contexts/PermissionContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function NotificationsPage() {
  const t = useTranslations('admin.notifications');

  // Form state
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'INFO' | 'WARNING' | 'PROMO' | 'SUCCESS'>('INFO');

  const [channel, setChannel] = useState<NotificationChannel>('PUSH');
  const [isSending, setIsSending] = useState(false);
  const { hasPermission } = usePermissions();

  // Newsletter state
  const [newsletterSubject, setNewsletterSubject] = useState('');
  const [newsletterContent, setNewsletterContent] = useState('');
  const [isHtml, setIsHtml] = useState(false);
  const [isBroadcastingNewsletter, setIsBroadcastingNewsletter] = useState(false);

  // User selection for targeted notifications
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<AdminUser[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<AdminUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Debounced user search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchTerm.length >= 2) {
        setIsSearching(true);
        try {
          const response = await adminService.filterUsers({
            filters: [{
              fieldName: 'email',
              operation: FilterOperation.MATCH,
              value: searchTerm,
            }],
            page: 0,
            size: 10,
          });
          setSearchResults(response.data.content);
        } catch (err) {
          console.error('Search failed:', err);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSendBroadcast = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error('Please enter title and message');
      return;
    }

    setIsSending(true);

    try {
      await adminService.sendBroadcast({ title, message, type, channel });
      toast.success('Broadcast notification sent to all users!');
      setTitle('');
      setMessage('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send notification';
      toast.error(errorMessage);
    } finally {
      setIsSending(false);
    }
  };

  const handleSendToUsers = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error('Please enter title and message');
      return;
    }
    if (selectedUsers.length === 0) {
      toast.error('Please select at least one user');
      return;
    }

    setIsSending(true);
    try {
      await adminService.sendToUsers({
        title,
        message,
        type,
        channel,
        userIds: selectedUsers.map(u => u.id),
      });
      toast.success(`Notification sent to ${selectedUsers.length} user(s)!`);
      setTitle('');
      setMessage('');
      setSelectedUsers([]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send notification';
      toast.error(errorMessage);
    } finally {
      setIsSending(false);
    }
  };

  const addUser = (user: AdminUser) => {
    if (!selectedUsers.find(u => u.id === user.id)) {
      setSelectedUsers([...selectedUsers, user]);
    }
    setSearchTerm('');
    setSearchResults([]);
  };

  const removeUser = (userId: number) => {
    setSelectedUsers(selectedUsers.filter(u => u.id !== userId));
  };

  const handleBroadcastNewsletter = async () => {
    if (!newsletterSubject.trim() || !newsletterContent.trim()) {
      toast.error('Please enter subject and content');
      return;
    }

    setIsBroadcastingNewsletter(true);
    try {
      await newsletterService.broadcast({
        subject: newsletterSubject,
        content: newsletterContent,
        isHtml
      });
      toast.success('Newsletter broadcast initiated successfully!');
      setNewsletterSubject('');
      setNewsletterContent('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send newsletter';
      toast.error(errorMessage);
    } finally {
      setIsBroadcastingNewsletter(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      <Tabs defaultValue="broadcast" className="space-y-6">
        <TabsList>
          <TabsTrigger value="broadcast" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            {t('broadcast')}
          </TabsTrigger>
          <TabsTrigger value="targeted" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            {t('targeted')}
          </TabsTrigger>
          {hasPermission('NEWSLETTER.BROADCAST') && (
            <TabsTrigger value="newsletter" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Newsletter
            </TabsTrigger>
          )}
        </TabsList>

        {/* Broadcast Tab */}
        <TabsContent value="broadcast">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                {t('broadcastToAll')}
              </CardTitle>
              <CardDescription>
                {t('broadcastDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Notification Type</Label>
                <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INFO">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        Information
                      </span>
                    </SelectItem>
                    <SelectItem value="SUCCESS">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500" />
                        Success
                      </span>
                    </SelectItem>
                    <SelectItem value="WARNING">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-yellow-500" />
                        Warning
                      </span>
                    </SelectItem>
                    <SelectItem value="PROMO">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-purple-500" />
                        Promotion
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Notification Channel</Label>
                <Select value={channel} onValueChange={(v) => setChannel(v as NotificationChannel)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PUSH">
                      <span className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4" />
                        Push Notification
                      </span>
                    </SelectItem>
                    <SelectItem value="EMAIL">
                      <span className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email
                      </span>
                    </SelectItem>
                    <SelectItem value="ALL">
                      <span className="flex items-center gap-2">
                        <Layers className="w-4 h-4" />
                        Both (Push & Email)
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Notification title..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Notification message..."
                  rows={4}
                />
              </div>

              <Button 
                onClick={handleSendBroadcast} 
                disabled={isSending || !title.trim() || !message.trim()}
                className="w-full"
              >
                {isSending ? (
                  <Loader2 className="h-4 w-4 ltr:mr-2 rtl:ml-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                )}
                {t('sendToAll')}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Targeted Tab */}
        <TabsContent value="targeted">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {t('sendToSpecific')}
              </CardTitle>
              <CardDescription>
                {t('selectUsersDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* User Search */}
              <div className="space-y-2">
                <Label>Search Users</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by email..."
                    className="pl-9"
                  />
                  {isSearching && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="border rounded-md max-h-40 overflow-y-auto">
                    {searchResults.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => addUser(user)}
                        className="w-full flex items-center justify-between px-3 py-2 hover:bg-muted text-left"
                      >
                        <div>
                          <div className="font-medium">{user.name || user.email}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                        {selectedUsers.find(u => u.id === user.id) ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : null}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected Users */}
              {selectedUsers.length > 0 && (
                <div className="space-y-2">
                  <Label>Selected Users ({selectedUsers.length})</Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedUsers.map((user) => (
                      <Badge key={user.id} variant="secondary" className="flex items-center gap-1">
                        {user.email}
                        <button onClick={() => removeUser(user.id)} className="ml-1 hover:text-destructive">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Notification Type</Label>
                <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INFO">Information</SelectItem>
                    <SelectItem value="SUCCESS">Success</SelectItem>
                    <SelectItem value="WARNING">Warning</SelectItem>
                    <SelectItem value="PROMO">Promotion</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Notification Channel</Label>
                <Select value={channel} onValueChange={(v) => setChannel(v as NotificationChannel)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PUSH">
                      <span className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4" />
                        Push Notification
                      </span>
                    </SelectItem>
                    <SelectItem value="EMAIL">
                      <span className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email
                      </span>
                    </SelectItem>
                    <SelectItem value="ALL">
                      <span className="flex items-center gap-2">
                        <Layers className="w-4 h-4" />
                        Both (Push & Email)
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetTitle">Title</Label>
                <Input
                  id="targetTitle"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Notification title..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetMessage">Message</Label>
                <Textarea
                  id="targetMessage"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Notification message..."
                  rows={4}
                />
              </div>

              <Button 
                onClick={handleSendToUsers} 
                disabled={isSending || !title.trim() || !message.trim() || selectedUsers.length === 0}
                className="w-full"
              >
                {isSending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Send to {selectedUsers.length} User(s)
              </Button>
            </CardContent>
          </Card>
        </TabsContent>


        {/* Newsletter Tab */}
        {hasPermission('NEWSLETTER.BROADCAST') && (
          <TabsContent value="newsletter">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Broadcast Newsletter
                </CardTitle>
                <CardDescription>
                  Send HTML email newsletter to all active subscribers.
                  <br />
                  <small className="text-muted-foreground">Note: Unsubscribe link is automatically appended.</small>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newsletterSubject">Subject</Label>
                  <Input
                    id="newsletterSubject"
                    value={newsletterSubject}
                    onChange={(e) => setNewsletterSubject(e.target.value)}
                    placeholder="Newsletter Subject..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newsletterContent">Content (HTML supported)</Label>
                  <Textarea
                    id="newsletterContent"
                    value={newsletterContent}
                    onChange={(e) => setNewsletterContent(e.target.value)}
                    placeholder="<p>Hello Subscribers...</p>"
                    rows={8}
                    className="font-mono text-sm"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isHtml"
                    checked={isHtml}
                    onCheckedChange={setIsHtml}
                  />
                  <Label htmlFor="isHtml">Send as HTML</Label>
                </div>

                <Button 
                  onClick={handleBroadcastNewsletter} 
                  disabled={isBroadcastingNewsletter || !newsletterSubject.trim() || !newsletterContent.trim()}
                  className="w-full"
                >
                  {isBroadcastingNewsletter ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Broadcast Newsletter
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
