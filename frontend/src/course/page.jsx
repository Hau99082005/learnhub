import { CourseDetail, CourseGrid } from "@/components/Course";

const CoursePage = ({ slug }) => {
  if (slug) {
    return <CourseDetail slug={slug} />;
  }
  return <CourseGrid />;
};

export default CoursePage;
