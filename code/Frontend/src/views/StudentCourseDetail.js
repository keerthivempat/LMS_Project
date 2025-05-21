import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import CertificateDownload from '../components/CertificateDownload';

const StudentCourseDetail = () => {
    const { id } = useParams();
    const [course, setCourse] = useState(null);

    useEffect(() => {
        // Fetch course data
        // ...existing code...
    }, [id]);

    return (
        <div className="container mx-auto px-4 py-8">
            {/* ...existing code... */}
            
            {/* Course title and details */}
            {course && (
                <>
                    {/* ...existing course content... */}
                    
                    {/* Add the certificate section at a visible spot in your UI */}
                    <div className="mt-8 p-6 bg-white rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold text-brown mb-4">Course Certificate</h3>
                        <div className="mb-4">
                            <p className="text-brown/70">
                                You can download your course completion certificate by clicking the button below.
                            </p>
                        </div>
                        {/* Pass the course ID from the URL parameter */}
                        <CertificateDownload courseId={id} />
                    </div>
                </>
            )}
        </div>
    );
};

export default StudentCourseDetail;