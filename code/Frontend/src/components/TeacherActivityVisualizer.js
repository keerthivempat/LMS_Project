import React, { useState, useEffect, useRef } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { subDays, isAfter, differenceInDays, format } from 'date-fns';
import LoadingSpinner from './LoadingSpinner';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const TeacherActivityVisualizer = ({ teacherData, loading = false }) => {
  const chartRef = useRef(null);
  const [activityStats, setActivityStats] = useState({
    active: 0,
    semiActive: 0,
    inactive: 0
  });
  
  const [lastReviewStats, setLastReviewStats] = useState({
    lastWeek: 0,
    lastMonth: 0,
    older: 0,
    never: 0
  });

  const [teacherDetails, setTeacherDetails] = useState({
    name: '',
    lastActive: null,
    lastContentUploaded: null,
    lastAssignmentReviewed: null
  });

  // Cleanup chart on unmount
  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (teacherData) {
      console.log('Teacher data received:', teacherData);
      calculateActivityStats();
      setTeacherDetails({
        name: teacherData.name,
        lastActive: teacherData.lastActive,
        lastContentUploaded: teacherData.lastContentUploaded,
        lastAssignmentReviewed: teacherData.lastAssignmentReviewed
      });
      console.log('Timeline data:', getTimelineData());
    }
  }, [teacherData]);

  const formatDate = (date) => {
    if (!date) return 'Never';
    try {
      return format(new Date(date), 'PPp');
    } catch (e) {
      return 'Invalid date';
    }
  };

  const calculateActivityStats = () => {
    const now = new Date();
    const oneWeekAgo = subDays(now, 7);
    const oneMonthAgo = subDays(now, 30);
    
    // Reset stats
    const stats = {
      active: 0,
      semiActive: 0,
      inactive: 0
    };
    
    const reviewStats = {
      lastWeek: 0,
      lastMonth: 0,
      older: 0,
      never: 0
    };
    
    if (teacherData) {
      if (!teacherData.lastActive) {
        stats.inactive++;
      } else {
        const lastActiveDate = new Date(teacherData.lastActive);
        if (isAfter(lastActiveDate, oneWeekAgo)) {
          stats.active++;
        } else if (isAfter(lastActiveDate, oneMonthAgo)) {
          stats.semiActive++;
        } else {
          stats.inactive++;
        }
      }
      
      if (!teacherData.lastAssignmentReviewed) {
        reviewStats.never++;
      } else {
        const lastReviewDate = new Date(teacherData.lastAssignmentReviewed);
        if (isAfter(lastReviewDate, oneWeekAgo)) {
          reviewStats.lastWeek++;
        } else if (isAfter(lastReviewDate, oneMonthAgo)) {
          reviewStats.lastMonth++;
        } else {
          reviewStats.older++;
        }
      }
    }
    
    setActivityStats(stats);
    setLastReviewStats(reviewStats);
  };

  const calculateDateDifference = (date1, date2) => {
    const normalizeDate = (date) => {
      const normalized = new Date(date);
      normalized.setHours(0, 0, 0, 0); // Set time to midnight
      return normalized;
    };

    const normalizedDate1 = normalizeDate(date1);
    const normalizedDate2 = normalizeDate(date2);

    const diffTime = Math.abs(normalizedDate1 - normalizedDate2);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Convert milliseconds to days
  };

  const getTimelineData = () => {
    const lastActiveDays = teacherDetails.lastActive
      ? calculateDateDifference(new Date(), new Date(teacherDetails.lastActive))
      : 0;
    console.log('Days since last active:', lastActiveDays);

    const lastUploadDays = teacherDetails.lastContentUploaded
      ? calculateDateDifference(new Date(), new Date(teacherDetails.lastContentUploaded))
      : 0;
    console.log('Days since last content upload:', lastUploadDays, teacherDetails.lastContentUploaded);

    const lastReviewDays = teacherDetails.lastAssignmentReviewed
      ? calculateDateDifference(new Date(), new Date(teacherDetails.lastAssignmentReviewed))
      : 0;

    console.log('Days since last activities:', {
      lastActiveDays,
      lastUploadDays,
      lastReviewDays,
    });

    return {
      labels: ['Last Active', 'Last Content Upload', 'Last Assignment Review'],
      datasets: [
        {
          label: 'Days Ago',
          data: [lastActiveDays, lastUploadDays, lastReviewDays],
          backgroundColor: [
            'rgba(75, 192, 192, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 159, 64, 0.6)',
          ],
          borderColor: [
            'rgb(75, 192, 192)',
            'rgb(54, 162, 235)',
            'rgb(255, 159, 64)',
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `Activity Timeline for ${teacherDetails.name}`,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: Math.max(
          ...getTimelineData().datasets[0].data
        ) + 5, // Add some padding for better visualization
        title: {
          display: true,
          text: 'Days Ago',
        },
      },
    },
  };

  // Check if any activity data exists
  const hasActivityData = teacherDetails.lastActive || 
                           teacherDetails.lastContentUploaded || 
                           teacherDetails.lastAssignmentReviewed;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-medium text-brown mb-4">Activity Overview for {teacherDetails.name}</h3>
      
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-brown/60">Last Active</div>
          <div className="text-lg font-semibold text-brown">{formatDate(teacherDetails.lastActive)}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-brown/60">Last Content Upload</div>
          <div className="text-lg font-semibold text-brown">{formatDate(teacherDetails.lastContentUploaded)}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-brown/60">Last Assignment Review</div>
          <div className="text-lg font-semibold text-brown">{formatDate(teacherDetails.lastAssignmentReviewed)}</div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mt-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-md font-medium text-brown mb-4">Activity Timeline</h3>
          
          {hasActivityData ? (
            <div className="h-64 w-full">
              <Bar 
                data={getTimelineData()} 
                options={options}
                ref={chartRef}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-brown/60">
              No activity data available for this teacher
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherActivityVisualizer;