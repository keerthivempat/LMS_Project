import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowLeft } from 'lucide-react'; // Import the arrow icon
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation

const TeacherSubmissions = () => {
    const { assignmentId } = useParams();
    const [submissions, setSubmissions] = useState([]);
    const [stats, setStats] = useState(null);
    const [assignmentDetails, setAssignmentDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [reviewForm, setReviewForm] = useState({
        submissionId: null,
        comment: '',
        grade: '',
        isOpen: false
    });

    const navigate = useNavigate(); // Initialize useNavigate

    useEffect(() => {
        const fetchSubmissions = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_BACKEND}/api/assignment/${assignmentId}/submissions`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                    }
                });
                setSubmissions(response.data.data.submissions);
                console.log("data is ",response.data.data.submissions);
                setStats(response.data.data.stats);
                setAssignmentDetails(response.data.data.assignmentDetails);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch submissions');
                setLoading(false);
            }
        };

        fetchSubmissions();
    }, [assignmentId]);

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        console.log("doing");
        try {
            await axios.post(
                `${process.env.REACT_APP_BACKEND}/api/assignment/${assignmentId}/submissions/${reviewForm.submissionId}/review`,
                {
                    comment: reviewForm.comment,
                    grade: parseFloat(reviewForm.grade)
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                    }
                }
            );
            
            // Refresh submissions after review
            const response = await axios.get(`${process.env.REACT_APP_BACKEND}/api/assignment/${assignmentId}/submissions`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                }
            });
            setSubmissions(response.data.data.submissions);
            setStats(response.data.data.stats);
            
            // Reset review form
            setReviewForm({
                submissionId: null,
                comment: '',
                grade: '',
                isOpen: false
            });
        } catch (err) {
            setError('Failed to submit review');
        }
    };

    const openReviewForm = (submissionId) => {
        setReviewForm({
            submissionId,
            comment: '',
            grade: '',
            isOpen: true
        });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-red-700">{error}</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-cream flex flex-col p-4 md:p-16">
            {/* Back Button */}
            <button
                onClick={() => navigate(-1)} // Navigate back to the previous page
                className="mb-6 flex items-center gap-2 px-4 py-2 text-brown rounded-md "
            >
                <ArrowLeft size={20} className="mr-1" />
                <span>Back</span>
            </button>

            {/* Assignment Details */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-4 text-amber-900">{assignmentDetails?.title}</h1>
                <p className="text-black mb-2">{assignmentDetails?.description}</p>
                <p className="text-black">Due Date: {format(new Date(assignmentDetails?.dueDate), 'PPp')}</p>
            </div>

            {/* Statistics */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-cream rounded shadow p-4">
                        <h3 className="text-black text-sm">Total Submissions</h3>
                        <p className="text-2xl font-bold text-amber-900">{stats.totalSubmissions}</p>
                    </div>
                    <div className="bg-cream rounded shadow p-4">
                        <h3 className="text-black text-sm">Reviewed</h3>
                        <p className="text-2xl font-bold text-amber-900">{stats.reviewedCount}</p>
                    </div>
                    <div className="bg-cream rounded shadow p-4">
                        <h3 className="text-black text-sm">Pending</h3>
                        <p className="text-2xl font-bold text-amber-900">{stats.pendingCount}</p>
                    </div>
                    <div className="bg-cream rounded shadow p-4">
                        <h3 className="text-black text-sm">Average Grade</h3>
                        <p className="text-2xl font-bold text-amber-900">{stats.averageGrade.toFixed(1)}%</p>
                    </div>
                </div>
            )}
            
            {/* Submissions List */}
            {submissions.length === 0 ? (
                <div className="text-center text-gray-500">
                    No submissions found for this assignment.
                </div>
            ) : (
                <div className="grid gap-6">
                    {submissions.map((submission) => (
                        <div key={submission._id} className="bg-cream rounded-lg shadow-md p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h2 className="text-xl font-semibold text-black">
                                        {submission.student.name}
                                    </h2>
                                    <p className="text-amber-800">{submission.student.email}</p>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className={`px-3 py-1 rounded-lg text-sm ${
                                        submission.status === 'reviewed' 
                                            ? 'bg-amber-100 text-black' 
                                            : 'bg-cream-200 text-black'
                                    }`}>
                                        {submission.status}
                                    </span>
                                    <div className="text-sm text-amber-700 mt-2">
                                        Submitted on: {format(new Date(submission.submittedAt), 'PPp')}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Submitted Files */}
                            <div className="mt-4">
                                <h3 className="font-medium mb-2 text-black">Submitted Files:</h3>
                                <div className="space-y-2">
                                    {submission.files.map((file, index) => (
                                        <div key={index} className="flex items-center">
                                            <a
                                                href={file}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-amber-700 hover:text-amber-900 flex items-center"
                                            >
                                                <svg
                                                    className="w-5 h-5 mr-2"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                                                    />
                                                </svg>
                                                View Submission {index + 1}
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Review Section */}
                            {submission.review ? (
                                <div className="mt-4 border-t pt-4">
                                    <h3 className="font-medium mb-2 text-amber-900">Review:</h3>
                                    <div className="bg-cream-100 p-4 rounded-lg">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-medium text-black">Grade: {submission.review.grade}%</span>
                                            <span className="text-sm text-amber-700">
                                                Reviewed by: {submission.review.reviewedBy.name}
                                            </span>
                                        </div>
                                        <p className="text-amber-800">{submission.review.comment}</p>
                                        <p className="text-sm text-amber-700 mt-2">
                                            Reviewed on: {format(new Date(submission.review.reviewedAt), 'PPp')}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-4">
                                    <button
                                        onClick={() => openReviewForm(submission._id)}
                                        className="bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700"
                                    >
                                        Review Submission
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Review Form Modal */}
            {reviewForm.isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-cream-50 rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4 text-amber-900">Review Submission</h2>
                        <form onSubmit={handleReviewSubmit}>
                            <div className="mb-4">
                                <label className="block text-amber-800 text-sm font-bold mb-2">
                                    Grade (0-100)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={reviewForm.grade}
                                    onChange={(e) => setReviewForm({ ...reviewForm, grade: e.target.value })}
                                    className="shadow appearance-none border border-amber-200 rounded w-full py-2 px-3 text-amber-900 bg-cream-50 leading-tight focus:outline-none focus:shadow-outline focus:border-amber-400"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-amber-800 text-sm font-bold mb-2">
                                    Comments
                                </label>
                                <textarea
                                    value={reviewForm.comment}
                                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                    className="shadow appearance-none border border-amber-200 rounded w-full py-2 px-3 text-amber-900 bg-cream-50 leading-tight focus:outline-none focus:shadow-outline focus:border-amber-400"
                                    rows="4"
                                    required
                                />
                            </div>
                            <div className="flex justify-end space-x-4">
                                <button
                                    type="button"
                                    onClick={() => setReviewForm({ ...reviewForm, isOpen: false })}
                                    className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700"
                                >
                                    Submit Review
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherSubmissions;