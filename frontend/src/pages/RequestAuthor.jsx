import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const RequestAuthor = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        reason: '',
        social_link: ''
    });

    const [requestStatus, setRequestStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        // Check if user is already author/admin
        if (user.role === 'author' || user.role === 'admin') {
            navigate('/');
            return;
        }

        // Fetch current request status
        fetchRequestStatus();
    }, [user, navigate]);

    const fetchRequestStatus = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/users/request-status`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRequestStatus(response.data);
        } catch (err) {
            console.error('Error fetching request status:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setSubmitting(true);

        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/users/request-author`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setSuccess('Request submitted successfully! An admin will review it soon.');
            setFormData({ reason: '', social_link: '' });

            // Refresh status
            setTimeout(() => {
                fetchRequestStatus();
            }, 1000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit request');
        } finally {
            setSubmitting(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-20">
                <div className="text-center">Loading...</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8">
                <h1 className="text-3xl font-bold mb-6">Request Author Access</h1>

                {/* Existing Request Status */}
                {requestStatus && (
                    <div className={`mb-6 p-4 rounded-lg ${requestStatus.status === 'pending' ? 'bg-yellow-50 border border-yellow-200' :
                        requestStatus.status === 'approved' ? 'bg-green-50 border border-green-200' :
                            'bg-red-50 border border-red-200'
                        }`}>
                        <h3 className="font-semibold mb-2">Your Request Status:
                            <span className={`ml-2 ${requestStatus.status === 'pending' ? 'text-yellow-600' :
                                requestStatus.status === 'approved' ? 'text-green-600' :
                                    'text-red-600'
                                }`}>
                                {requestStatus.status.toUpperCase()}
                            </span>
                        </h3>

                        {requestStatus.status === 'pending' && (
                            <p className="text-gray-700">Your request is being reviewed by an admin.</p>
                        )}

                        {requestStatus.status === 'approved' && (
                            <p className="text-gray-700">Your request has been approved! You should now have author privileges.</p>
                        )}

                        {requestStatus.status === 'rejected' && (
                            <div>
                                <p className="text-gray-700 mb-2">Your request was rejected.</p>
                                {requestStatus.rejection_reason && (
                                    <div className="bg-white p-3 rounded border border-red-300">
                                        <p className="font-semibold text-sm text-gray-600 mb-1">Admin's Feedback:</p>
                                        <p className="text-gray-800">{requestStatus.rejection_reason}</p>
                                    </div>
                                )}
                                <p className="text-sm text-gray-600 mt-3">You can submit a new request below.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Only show form if no pending request */}
                {(!requestStatus || requestStatus.status === 'rejected') && (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Why should we approve you? <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="reason"
                                value={formData.reason}
                                onChange={handleChange}
                                required
                                rows="5"
                                placeholder="Tell us about your background, expertise, and why you'd like to become an author..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            ></textarea>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Social Media / Online Presence Link (Optional)
                            </label>
                            <input
                                type="url"
                                name="social_link"
                                value={formData.social_link}
                                onChange={handleChange}
                                placeholder="https://linkedin.com/in/yourprofile"
                                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                                {success}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={submitting}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? 'Submitting...' : 'Submit Request'}
                        </button>
                    </form>
                )}

                {requestStatus && requestStatus.status === 'pending' && (
                    <div className="text-center py-8">
                        <p className="text-gray-600">You already have a pending request. Please wait for admin review.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RequestAuthor;
