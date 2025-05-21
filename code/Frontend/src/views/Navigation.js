import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { courses } from "@/data/courses";

const Nav = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const coursesPerPage = 3;

  const nextCourses = () => {
    if (currentIndex + coursesPerPage < courses.length) {
      setCurrentIndex(currentIndex + coursesPerPage);
    }
  };

  const prevCourses = () => {
    if (currentIndex - coursesPerPage >= 0) {
      setCurrentIndex(currentIndex - coursesPerPage);
    }
  };

  return (
    <div className="flex flex-col items-center w-full p-4">
      <h2 className="text-xl font-bold mb-4">My Courses</h2>
      <div className="flex items-center w-full justify-between">
        <button onClick={prevCourses} disabled={currentIndex === 0} className="p-2 disabled:opacity-50">
          <ChevronLeft size={24} />
        </button>
        <div className="grid grid-cols-3 gap-4">
          {courses.slice(currentIndex, currentIndex + coursesPerPage).map((course) => (
            <Card key={course.id} className="w-60">
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold">{course.title}</h3>
                <p className="text-sm text-gray-500">{course.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <button onClick={nextCourses} disabled={currentIndex + coursesPerPage >= courses.length} className="p-2 disabled:opacity-50">
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
};

export default Nav;
