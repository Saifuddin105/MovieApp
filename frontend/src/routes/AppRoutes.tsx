import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { HomePage } from '../pages/HomePage';
import { DiscoverPage } from '../pages/DiscoverPage';
import { SearchPage } from '../pages/SearchPage';
import { MovieDetailsPage } from '../pages/MovieDetailsPage';
import { WatchlistPage } from '../pages/WatchlistPage';
import { WatchedPage } from '../pages/WatchedPage';
import { ProfilePage } from '../pages/ProfilePage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { ProtectedRoute } from './ProtectedRoute';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/discover" element={<DiscoverPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/movie/:id" element={<MovieDetailsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Private Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/watchlist" element={<WatchlistPage />} />
          <Route path="/watched" element={<WatchedPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        {/* 404 Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

