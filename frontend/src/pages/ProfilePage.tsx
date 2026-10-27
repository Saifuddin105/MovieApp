import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usersApi } from '../api/users';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import {
  User as UserIcon,
  Bookmark,
  CheckCircle,
  Calendar,
  Edit2,
  LogOut,
  Film,
  Sparkles,
} from 'lucide-react';
import { getPosterUrl, formatRating } from '../utils/tmdb';
import { toast } from 'sonner';

export const ProfilePage: React.FC = () => {
  const { user, logout, refreshUser } = useAuth();
  const queryClient = useQueryClient();

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name || '');
  const [avatarUrlInput, setAvatarUrlInput] = useState(user?.avatarUrl || '');

  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ['userStats'],
    queryFn: () => usersApi.getUserStats(),
    enabled: !!user,
  });

  const updateProfileMutation = useMutation({
    mutationFn: () =>
      usersApi.updateProfile({
        name: nameInput,
        avatarUrl: avatarUrlInput || undefined,
      }),
    onSuccess: async () => {
      await refreshUser();
      queryClient.invalidateQueries({ queryKey: ['userStats'] });
      setEditModalOpen(false);
      toast.success('Profile updated successfully!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    },
  });

  if (!user) return null;

  const joinDate = new Date(user.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Profile Header Banner */}
      <div className="bg-[#12161f] border border-border rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
          {/* Avatar / Initials */}
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-amber-500 to-rose-500 text-slate-950 font-black text-3xl flex items-center justify-center shadow-glow">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-full h-full object-cover rounded-3xl"
              />
            ) : (
              user.name.charAt(0).toUpperCase()
            )}
          </div>

          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-100">{user.name}</h1>
            <p className="text-sm text-slate-400">{user.email}</p>
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-slate-400 pt-1">
              <Calendar className="w-3.5 h-3.5 text-amber-500" />
              <span>Movie explorer since {joinDate}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setNameInput(user.name);
              setAvatarUrlInput(user.avatarUrl || '');
              setEditModalOpen(true);
            }}
          >
            <Edit2 className="w-3.5 h-3.5" />
            Edit Profile
          </Button>

          <Button variant="ghost" size="sm" onClick={() => logout()}>
            <LogOut className="w-3.5 h-3.5 text-rose-400" />
            Logout
          </Button>
        </div>
      </div>

      {/* Stats Counter Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Link
          to="/watchlist"
          className="group bg-card border border-border/80 hover:border-amber-500/50 rounded-2xl p-6 transition-all duration-300 shadow-lg hover:shadow-glow flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Saved in Watchlist
            </span>
            <h3 className="text-3xl font-black text-slate-100 group-hover:text-amber-400 transition-colors">
              {stats?.watchlistCount ?? user.stats?.watchlistCount ?? 0}
            </h3>
            <p className="text-xs text-slate-400">Movies waiting for your movie night</p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
            <Bookmark className="w-7 h-7" />
          </div>
        </Link>

        <Link
          to="/watched"
          className="group bg-card border border-border/80 hover:border-emerald-500/50 rounded-2xl p-6 transition-all duration-300 shadow-lg flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Completed Watched
            </span>
            <h3 className="text-3xl font-black text-slate-100 group-hover:text-emerald-400 transition-colors">
              {stats?.watchedCount ?? user.stats?.watchedCount ?? 0}
            </h3>
            <p className="text-xs text-slate-400">Titles recorded in your watch log</p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <CheckCircle className="w-7 h-7" />
          </div>
        </Link>
      </div>

      {/* Recently Watched Showcase */}
      {stats?.recentWatched && stats.recentWatched.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-border/80 pb-3">
            <div className="flex items-center gap-2">
              <Film className="w-5 h-5 text-amber-400" />
              <h2 className="text-xl font-bold text-slate-100">Recently Watched</h2>
            </div>
            <Link to="/watched" className="text-xs text-amber-400 hover:underline">
              View all
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {stats.recentWatched.map((item) => (
              <Link
                key={item.id}
                to={`/movie/${item.tmdbId}`}
                className="group relative rounded-xl overflow-hidden bg-slate-900 aspect-[2/3] border border-border/70 hover:border-amber-500 transition-all shadow"
              >
                <img
                  src={getPosterUrl(item.posterPath, 'w342')}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-2 left-2 right-2">
                  <p className="text-xs font-bold text-slate-100 line-clamp-1">{item.title}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Your Profile"
        maxWidth="md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            updateProfileMutation.mutate();
          }}
          className="space-y-4"
        >
          <Input
            label="Display Name"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            required
            minLength={2}
          />

          <Input
            label="Avatar Image URL (Optional)"
            placeholder="https://example.com/photo.jpg"
            value={avatarUrlInput}
            onChange={(e) => setAvatarUrlInput(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={updateProfileMutation.isPending}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

