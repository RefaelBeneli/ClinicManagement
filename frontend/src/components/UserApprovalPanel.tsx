import React, { useState, useEffect } from 'react';
import { PendingUser } from '../types';
import { userApproval } from '../services/api';
import './UserApprovalPanel.css';

interface UserApprovalPanelProps {
  onClose: () => void;
}

const UserApprovalPanel: React.FC<UserApprovalPanelProps> = ({ onClose }) => {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      const users = await userApproval.getPendingUsers();
      setPendingUsers(users);
    } catch (error: any) {
      setError('Failed to fetch pending users: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: number) => {
    try {
              await userApproval.approveUser(userId, { approvalStatus: 'APPROVED' });
      setPendingUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (error: any) {
      alert('Failed to approve user: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleReject = async (userId: number) => {
    const reason = prompt('Reason for rejection (optional):') || '';
    try {
      await userApproval.rejectUser(userId, { approvalStatus: 'REJECTED', rejectionReason: reason });
      setPendingUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (error: any) {
      alert('Failed to reject user: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="user-approval-overlay">
      <div className="user-approval-panel">
        <div className="panel-header">
          <h2>User Approval Management</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <div className="tab-content">
          {loading ? (
            <div className="loading-spinner">Loading...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : (
            <div className="users-list">
              {pendingUsers.map((user) => (
                <div key={user.id} className="user-card">
                  <div className="user-info">
                    <h4>{user.fullName}</h4>
                    <p>@{user.username}</p>
                    <p>{user.email}</p>
                    <small>Joined: {new Date(user.createdAt).toLocaleDateString()}</small>
                  </div>
                  <div className="user-actions">
                    <button className="approve-btn" onClick={() => handleApprove(user.id)}>Approve</button>
                    <button className="reject-btn" onClick={() => handleReject(user.id)}>Reject</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserApprovalPanel;
