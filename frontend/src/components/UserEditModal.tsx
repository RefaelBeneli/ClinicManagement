import React, { useState, useEffect } from 'react';
import { adminUsers, userApproval } from '../services/api';
import { UserApprovalStatus } from '../types';
import './UserEditModal.css';

interface Props {
  userId: number;
  onClose: () => void;
  onSaved: () => void;
}

const UserEditModal: React.FC<Props> = ({ userId, onClose, onSaved }) => {
  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await adminUsers.getById(userId);
        setForm({ ...data, password: '' });
      } catch (e: any) {
        setError('Failed to load user');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as any;
    setForm((prev: any) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const save = async () => {
    try {
      setLoading(true);
      const payload = { ...form };
      if (!payload.password) delete payload.password; // don't send empty password
      await adminUsers.update(userId, payload);
      onSaved();
      onClose();
    } catch (e: any) {
      alert('Save failed: ' + (e.response?.data?.message || e.message));
    } finally {
      setLoading(false);
    }
  };

  const approveIfPending = async () => {
    if (form.approvalStatus === UserApprovalStatus.PENDING) {
              await userApproval.approveUser(userId, { approvalStatus: 'APPROVED' });
      setForm((prev: any) => ({ ...prev, approvalStatus: UserApprovalStatus.APPROVED }));
    }
  };

  if (loading) return <div className="modal-overlay"><div className="modal">Loading...</div></div>;
  if (error) return <div className="modal-overlay"><div className="modal">{error}</div></div>;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Edit User #{userId}</h3>
        <div className="form">
          <label>Username<input name="username" value={form.username} onChange={handleChange} /></label>
          <label>Full Name<input name="fullName" value={form.fullName} onChange={handleChange} /></label>
          <label>Email<input name="email" value={form.email} onChange={handleChange} /></label>
          <label>Role<select name="role" value={form.role} onChange={handleChange}><option value="USER">USER</option><option value="ADMIN">ADMIN</option></select></label>
          <label>Enabled<input type="checkbox" name="enabled" checked={form.enabled} onChange={handleChange} /></label>
          <label>Password<input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Leave blank to keep" /></label>
          <label>Approval Status<select name="approvalStatus" value={form.approvalStatus} onChange={handleChange}>
            <option value="PENDING">PENDING</option>
            <option value="APPROVED">APPROVED</option>
            <option value="REJECTED">REJECTED</option>
          </select></label>
        </div>
        {form.approvalStatus === 'PENDING' && (<button onClick={approveIfPending}>Approve Now</button>)}
        <div className="modal-actions">
          <button onClick={save}>Save</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default UserEditModal; 