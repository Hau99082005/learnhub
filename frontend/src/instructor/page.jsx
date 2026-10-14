import { useEffect } from "react";
import { AllCourse } from "@/admin/courses/AllCourse";
import CourseRecord from "@/instructor/CourseRecord";
import Performance from "@/instructor/Performance";
import Resources from "@/instructor/Resources";
import Tools from "@/instructor/Tools";
import { getAuthUser } from "@/lib/auth";
import { isInstructor, isAdmin } from "@/lib/roles";
import InstructorLayout from "@/instructor/layout";

const InstructorPage = () => {
  useEffect(() => {
    const user = getAuthUser();
    if (!user) {
      window.location.href = "/dang-nhap?from=teach";
      return;
    }
    if (!isInstructor(user) && !isAdmin(user)) {
      window.location.href = "/giang-day/bat-dau";
    }
  }, []);

  const section = typeof window === "undefined" ? "/giang-day/quan-tri" : window.location.pathname;
  const placeholders = {
    "/giang-day/quan-tri/giao-tiep": {
      title: "Giao tiếp",
      text: "Tin nhắn và hỏi đáp từ học viên sẽ hiện ở đây khi khóa học bắt đầu chạy.",
    },
  };
  const placeholder = placeholders[section];

  if (section === "/giang-day/quan-tri/ghi-hinh") {
    return (
      <InstructorLayout>
        <CourseRecord />
      </InstructorLayout>
    );
  }

  if (section === "/giang-day/quan-tri/hieu-suat") {
    return (
      <InstructorLayout>
        <Performance />
      </InstructorLayout>
    );
  }

  if (section === "/giang-day/quan-tri/cong-cu") {
    return (
      <InstructorLayout>
        <Tools />
      </InstructorLayout>
    );
  }

  if (section === "/giang-day/quan-tri/tai-nguyen") {
    return (
      <InstructorLayout>
        <Resources />
      </InstructorLayout>
    );
  }

  if (placeholder) {
    return (
      <InstructorLayout>
        <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{placeholder.title}</h1>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
            {placeholder.text}
          </p>
        </div>
      </InstructorLayout>
    );
  }

  return (
    <InstructorLayout>
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <AllCourse
          apiBase="/api/instructor/courses"
          categoriesUrl="/api/categories"
          showInstructor={false}
          curriculumHref={(id) => `/giang-day/quan-tri/${id}/phan-hoc`}
          listHref="/giang-day/quan-tri"
          pathPattern={/^\/giang-day\/quan-tri\/(\d+)\/phan-hoc$/}
        />
      </div>
    </InstructorLayout>
  );
};

export default InstructorPage;
