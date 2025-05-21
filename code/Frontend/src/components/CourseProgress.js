import React from 'react';

const CourseProgress = ({ progress, colorScheme }) => {
  // If progress data is not available, show default state
  if (!progress) {
    return (
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold" style={{ color: colorScheme.brown }}>
            Course Progress
          </h3>
          <span className="font-medium" style={{ color: colorScheme.brown }}>
            0% Complete
          </span>
        </div>
        
        <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{ 
              width: '0%', 
              backgroundColor: colorScheme.yellow,
              boxShadow: '0 0 8px rgba(239, 200, 21, 0.6)'
            }}
          ></div>
        </div>
        
        <div className="mt-1 text-sm text-gray-600">
          Loading progress...
        </div>
      </div>
    );
  }

  // Calculate progress percentage based on completed sections
  const completedSections = progress.progress?.sectionsCompleted?.length || 0;
  const totalSections = progress.totalSections || 0;
  const percentage = totalSections > 0 ? Math.round((completedSections / totalSections) * 100) : 0;
  
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold" style={{ color: colorScheme.brown }}>
          Course Progress
        </h3>
        <span className="font-medium" style={{ color: colorScheme.brown }}>
          {percentage}% Complete
        </span>
      </div>
      
      <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{ 
            width: `${percentage}%`, 
            backgroundColor: colorScheme.yellow,
            boxShadow: '0 0 8px rgba(239, 200, 21, 0.6)'
          }}
        ></div>
      </div>
      
      <div className="mt-1 text-sm text-gray-600">
        {completedSections} of {totalSections} sections completed
      </div>
    </div>
  );
};

export default CourseProgress;
