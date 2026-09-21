import { CourseGrid } from "@/components/Course";
import { CourseDetail } from "@/components/CourseDetail";

const CoursePage = ({ slug }) => {
  if (slug) {
    return <CourseDetail slug={slug} />;
  }
  return <CourseGrid />;
};

export default CoursePage;
