import User from '../models/User.js';
import { asyncHandler } from '../utils/http.js';

// -----------------------------------------------------------------------
// Dashboard controller
//
//   GET /api/dashboard/public   publicStats()   — homepage counters, no auth
//   GET /api/dashboard/me       myDashboard()   — any logged-in user
//   GET /api/dashboard/admin    adminDashboard()— admin only
//
// Course / assignment / enrollment figures are still computed on the
// frontend (DataContext) until those modules get their own API; when they
// do, add their counts to adminDashboard() alongside the user stats.
// -----------------------------------------------------------------------

const DAY = 24 * 60 * 60 * 1000;

export const publicStats = asyncHandler(async (_req, res) => {
  const users = await User.countDocuments({ isActive: true });
  res.json({ success: true, stats: { users } });
});

export const myDashboard = asyncHandler(async (req, res) => {
  const user = req.user;
  const daysOnPlatform = Math.max(0, Math.floor((Date.now() - user.createdAt.getTime()) / DAY));
  res.json({
    success: true,
    user,
    account: {
      role: user.role,
      memberSince: user.createdAt,
      lastLogin: user.lastLogin || null,
      daysOnPlatform,
      profileComplete: Boolean(user.name && user.email && user.bio),
    },
  });
});

export const adminDashboard = asyncHandler(async (_req, res) => {
  const now = Date.now();
  const weekAgo = new Date(now - 7 * DAY);
  const startOfWindow = new Date(new Date(now - 6 * DAY).setUTCHours(0, 0, 0, 0));

  const [roleAgg, activeCount, totalUsers, newThisWeek, activeThisWeek, recentUsers, recentSignups] = await Promise.all([
    User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
    User.countDocuments({ isActive: true }),
    User.countDocuments(),
    User.countDocuments({ createdAt: { $gte: weekAgo } }),
    User.countDocuments({ lastLogin: { $gte: weekAgo } }),
    User.find().sort({ createdAt: -1 }).limit(5),
    User.find({ createdAt: { $gte: startOfWindow } }, { createdAt: 1 }).lean(),
  ]);

  const byRole = { student: 0, instructor: 0, admin: 0 };
  roleAgg.forEach(({ _id, count }) => {
    if (_id in byRole) byRole[_id] = count;
  });

  // Bucket sign-ups by UTC day, filling empty days with 0 so the frontend
  // gets a continuous 7-day series.
  const signupMap = {};
  recentSignups.forEach(({ createdAt }) => {
    const day = createdAt.toISOString().slice(0, 10);
    signupMap[day] = (signupMap[day] || 0) + 1;
  });
  const signupsLast7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startOfWindow.getTime() + i * DAY).toISOString().slice(0, 10);
    return { date, count: signupMap[date] || 0 };
  });

  res.json({
    success: true,
    stats: {
      totalUsers,
      activeUsers: activeCount,
      inactiveUsers: totalUsers - activeCount,
      byRole,
      newUsersThisWeek: newThisWeek,
      activeThisWeek,
    },
    signupsLast7Days,
    recentUsers,
  });
});
