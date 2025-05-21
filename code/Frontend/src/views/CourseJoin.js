import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';
import SuccessAlert from '../components/SuccessAlert';
import FailAlert from '../components/FailAlert';

const CourseJoin = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleJoinCourse = async () => {
        if (loading) return; // Prevent duplicate clicks
        setLoading(true);
        setError(null); // Reset error state

        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                navigate('/login', { 
                    state: { 
                        from: `/courses/${courseId}/accept`,
                        message: 'Please log in to join the course'
                    } 
                });
                return;
            }

            const response = await axios.post(
                `${process.env.REACT_APP_BACKEND}/api/course/${courseId}/accept`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.data.success) {
                setSuccess(true);
                setTimeout(() => {
                    navigate(`/MyCourses/${courseId}`);
                }, 2000);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to join course');
            if (err.response?.status === 400 && err.response?.data?.message?.includes('already')) {
                setTimeout(() => {
                    navigate(`/MyCourses/${courseId}`);
                }, 2000);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-cream p-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
                {loading && <LoadingSpinner />}
                {success && (
                    <SuccessAlert message="Successfully joined the course! Redirecting..." />
                )}
                {error && (
                    <FailAlert message={error} />
                )}
                {!loading && !success && (
                    <button
                        onClick={handleJoinCourse}
                        className="px-6 py-3 bg-yellow text-brown rounded shadow hover:bg-yellow/80 transition-all"
                    >
                        Join Course
                    </button>
                )}
            </div>
        </div>
    );
};

export default CourseJoin;