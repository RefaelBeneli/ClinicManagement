import React from 'react';
import { DashboardStats, ExpenseSummary } from '../../types';
import './StatsOverview.css';

interface StatsOverviewProps {
  stats: DashboardStats;
  expenseSummary: ExpenseSummary | null;
  clientCount: number;
  loading: boolean;
}

const StatsOverview: React.FC<StatsOverviewProps> = ({
  stats,
  expenseSummary,
  clientCount,
  loading
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS'
    }).format(amount);
  };

  const statCards = [
    {
      id: 'clients',
      title: 'Total Clients',
      value: clientCount,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      ),
      color: 'primary',
      description: 'Active clients in your practice'
    },
    {
      id: 'meetings-today',
      title: 'Sessions Today',
      value: stats.meetingsToday,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
      ),
      color: 'success',
      description: 'Scheduled for today'
    },
    {
      id: 'unpaid',
      title: 'Unpaid Sessions',
      value: stats.unpaidSessions,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M12 6v6l4 2"></path>
        </svg>
      ),
      color: 'warning',
      description: 'Awaiting payment'
    },
    {
      id: 'monthly-revenue',
      title: 'Monthly Revenue',
      value: formatCurrency(stats.monthlyRevenue),
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="1" x2="12" y2="23"></line>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
        </svg>
      ),
      color: 'primary',
      description: 'Revenue this month'
    }
  ];

  if (expenseSummary) {
    statCards.push({
      id: 'monthly-expenses',
      title: 'Monthly Expenses',
      value: formatCurrency(expenseSummary.monthlyAverage),
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 3v18h18"></path>
          <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"></path>
        </svg>
      ),
      color: 'error',
      description: 'Average monthly expenses'
    });
  }

  return (
    <div className="stats-overview">
      <div className="stats-overview__header">
        <h2 className="stats-overview__title">Dashboard Overview</h2>
        <p className="stats-overview__subtitle">
          Key metrics for your practice
        </p>
      </div>

      <div className="stats-grid">
        {statCards.map((stat) => (
          <div key={stat.id} className={`stat-card stat-card--${stat.color}`}>
            {loading ? (
              <div className="stat-card__loading">
                <div className="stat-card__skeleton stat-card__skeleton--icon"></div>
                <div className="stat-card__skeleton stat-card__skeleton--text"></div>
                <div className="stat-card__skeleton stat-card__skeleton--value"></div>
              </div>
            ) : (
              <>
                <div className="stat-card__icon">
                  {stat.icon}
                </div>
                <div className="stat-card__content">
                  <h3 className="stat-card__title">{stat.title}</h3>
                  <div className="stat-card__value">
                    {typeof stat.value === 'string' ? stat.value : stat.value.toLocaleString()}
                  </div>
                  <p className="stat-card__description">{stat.description}</p>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatsOverview; 