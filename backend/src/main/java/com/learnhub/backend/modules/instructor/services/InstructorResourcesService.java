package com.learnhub.backend.modules.instructor.services;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.learnhub.backend.modules.course.repositories.CourseSectionRepository;
import com.learnhub.backend.modules.course.repositories.LessonRepository;
import com.learnhub.backend.modules.instructor.dtos.InstructorResourcesDTO;
import com.learnhub.backend.modules.instructor.dtos.ResourceCourseDTO;
import com.learnhub.backend.modules.instructor.dtos.ResourceItemDTO;
import com.learnhub.backend.modules.instructor.dtos.SupportTicketDTO;
import com.learnhub.backend.modules.instructor.dtos.SupportTicketRequest;
import com.learnhub.backend.modules.instructor.dtos.ToolCheckRequest;
import com.learnhub.backend.modules.instructor.models.Course;
import com.learnhub.backend.modules.instructor.models.InstructorResourceProgress;
import com.learnhub.backend.modules.instructor.models.InstructorSupportTicket;
import com.learnhub.backend.modules.instructor.repositories.CourseRepository;
import com.learnhub.backend.modules.instructor.repositories.InstructorResourceProgressRepository;
import com.learnhub.backend.modules.instructor.repositories.InstructorSupportTicketRepository;
import com.learnhub.backend.modules.user.dtos.userDTO;
import com.learnhub.backend.modules.user.exceptions.AuthException;
import com.learnhub.backend.modules.user.models.user;
import com.learnhub.backend.modules.user.repositories.userRepository;
import com.learnhub.backend.modules.user.services.interfaces.UserServicesInterfaces;

@Service
public class InstructorResourcesService {
    private static final Set<String> TOPICS = Set.of("COURSE", "VIDEO", "PAYOUT", "ACCOUNT", "OTHER");
    private static final Guide[] GUIDES = {
            new Guide(
                    "idea",
                    "Chọn chủ đề có nhu cầu",
                    "Khóa học bán được khi giải quyết một kỹ năng cụ thể người học đang tìm.",
                    "Viết một câu: sau khóa này học viên làm được gì. So với khóa trên LearnHub cùng chủ đề, bạn phải rõ hơn về kết quả, đối tượng và thời lượng. Tránh khóa “tất cả về…” — hẹp và thực chiến sẽ dễ xuất bản hơn.",
                    "/giang-day/quan-tri",
                    "Tạo khóa học"),
            new Guide(
                    "outline",
                    "Lập dàn ý chương",
                    "Chia khóa thành 4–8 phần, mỗi bài 5–15 phút và một ý chính.",
                    "Đặt tên phần theo kết quả (“Tạo trang sản phẩm”) chứ không theo lý thuyết. Bài đầu nên cho học viên thắng nhỏ. Cuối mỗi phần có bài tập hoặc tóm tắt để giữ nhịp.",
                    "/giang-day/quan-tri",
                    "Mở danh sách khóa"),
            new Guide(
                    "landing",
                    "Viết trang giới thiệu",
                    "Ảnh bìa, phụ đề, mô tả và “bạn sẽ học được gì” quyết định lượt mua.",
                    "Phụ đề nói rõ lợi ích trong một câu. Mô tả: đối tượng, lộ trình, kết quả. Thêm ít nhất 4 ý học được và yêu cầu đầu vào trung thực. Dùng mẫu mô tả trong Công cụ nếu bạn đang kẹt chữ.",
                    "/giang-day/quan-tri/cong-cu",
                    "Mở công cụ mô tả"),
            new Guide(
                    "record",
                    "Ghi bài giảng",
                    "Âm thanh rõ và khung hình ổn định quan trọng hơn thiết bị đắt.",
                    "Tắt thông báo, kiểm tra micro, quay 1080p nếu được. Mỗi clip một ý. Dùng checklist ghi hình rồi tải lên studio. Học viên bỏ khóa chủ yếu vì tiếng ồn và bài quá dài.",
                    "/giang-day/quan-tri/ghi-hinh",
                    "Mở studio ghi hình"),
            new Guide(
                    "edit",
                    "Hoàn thiện curriculum",
                    "Sắp xếp phần học, đặt tên bài, gắn video đúng chỗ trước khi xuất bản.",
                    "Xem lại từng bài trên trang phần học. Bài giới thiệu (preview) nên ngắn và thể hiện giọng dạy. Kiểm tra thứ tự, thời lượng và bài trống chưa có video.",
                    "/giang-day/quan-tri",
                    "Sửa chương trình học"),
            new Guide(
                    "publish",
                    "Xuất bản và theo dõi",
                    "Chỉ xuất bản khi checklist bắt buộc đã xanh, rồi theo dõi hiệu suất tuần đầu.",
                    "Dùng Công cụ xuất bản để chốt thiếu sót. Sau khi lên kệ, vào Hiệu suất xem lượt học và đánh giá. Cập nhật bài yếu thay vì tạo khóa mới ngay.",
                    "/giang-day/quan-tri/cong-cu",
                    "Mở công cụ xuất bản"),
    };
    private static final Guide[] STANDARDS = {
            new Guide(
                    "audio",
                    "Âm thanh rõ, ít tạp",
                    "Micro ổn định, không vọng, không quạt che tiếng nói.",
                    "Nghe lại 30 giây đầu mỗi bài bằng tai nghe. Nếu phải tăng volume hết cỡ mới nghe được thì quay lại.",
                    "/giang-day/quan-tri/ghi-hinh",
                    "Ghi lại bài"),
            new Guide(
                    "video",
                    "Hình ổn định, đủ sáng",
                    "Không ngược sáng, không rung tay, chữ trên màn hình đọc được.",
                    "Khung 1080p, mặt hoặc slide chiếm phần lớn khung. Tránh zoom liên tục và watermark che nội dung.",
                    "/giang-day/quan-tri/ghi-hinh",
                    "Mở ghi hình"),
            new Guide(
                    "pacing",
                    "Một ý mỗi bài",
                    "Bài 5–15 phút, không nhồi nhiều chủ đề.",
                    "Nếu bài vượt 20 phút, tách thành hai. Mở bài bằng mục tiêu, kết bài bằng việc học viên vừa làm được.",
                    "/giang-day/quan-tri",
                    "Xem phần học"),
            new Guide(
                    "value",
                    "Giá trị ngay bài đầu",
                    "Học viên phải có thắng nhỏ trong 10 phút đầu.",
                    "Bài 1 không phải lịch sử công cụ. Cho họ làm một thao tác cụ thể để tin khóa học đáng học tiếp.",
                    "/giang-day/quan-tri",
                    "Sửa bài đầu"),
            new Guide(
                    "accuracy",
                    "Nội dung đúng và cập nhật",
                    "Không dạy API/công cụ đã khai tử mà không ghi chú.",
                    "Ghi năm hoặc phiên bản trong mô tả. Khi công cụ đổi, cập nhật bài thay vì để đánh giá thấp.",
                    "/giang-day/quan-tri",
                    "Cập nhật khóa"),
            new Guide(
                    "inclusion",
                    "Bao quát người học",
                    "Nói chậm vừa phải, tránh tiếng lóng không giải thích.",
                    "Giả định học viên mới. Định nghĩa thuật ngữ lần đầu. Không chế giễu trình độ hay công cụ khác.",
                    "/giang-day/quan-tri/cong-cu",
                    "Sửa mô tả"),
            new Guide(
                    "promo",
                    "Không spam bán hàng",
                    "Khóa học không phải video quảng cáo sản phẩm ngoài.",
                    "Được nhắc khóa liên quan một lần, không kêu gọi link affiliate lặp lại. Vi phạm có thể bị gỡ xuất bản.",
                    "/giang-day/quan-tri/cong-cu",
                    "Xem xuất bản"),
            new Guide(
                    "copy",
                    "Trang khóa đủ thông tin",
                    "Ảnh, phụ đề, mô tả, kết quả học và danh mục phải đầy đủ.",
                    "Thiếu các mục này khóa sẽ kẹt ở nháp. Checklist xuất bản trong Công cụ phản ánh đúng tiêu chuẩn này.",
                    "/giang-day/quan-tri/cong-cu",
                    "Mở checklist"),
    };

    private final UserServicesInterfaces userServices;
    private final userRepository users;
    private final CourseRepository courses;
    private final CourseSectionRepository sections;
    private final LessonRepository lessons;
    private final InstructorResourceProgressRepository progress;
    private final InstructorSupportTicketRepository tickets;

    public InstructorResourcesService(
            UserServicesInterfaces userServices,
            userRepository users,
            CourseRepository courses,
            CourseSectionRepository sections,
            LessonRepository lessons,
            InstructorResourceProgressRepository progress,
            InstructorSupportTicketRepository tickets) {
        this.userServices = userServices;
        this.users = users;
        this.courses = courses;
        this.sections = sections;
        this.lessons = lessons;
        this.progress = progress;
        this.tickets = tickets;
    }

    @Transactional(readOnly = true)
    public InstructorResourcesDTO overview(String authorization) {
        return snapshot(actor(authorization));
    }

    @Transactional
    public InstructorResourcesDTO saveProgress(String authorization, ToolCheckRequest request) {
        user account = actor(authorization);
        if (request == null || request.getKey() == null || request.getKey().isBlank()) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "Thiếu mục tài nguyên");
        }
        String key = request.getKey().trim().toLowerCase(Locale.ROOT);
        if (!knownKey(key)) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "Mục tài nguyên không hợp lệ");
        }
        InstructorResourceProgress row = progress.findByUser_IdAndItemKey(account.getId(), key).orElseGet(() -> {
            InstructorResourceProgress created = new InstructorResourceProgress();
            created.setUser(account);
            created.setItemKey(key);
            return created;
        });
        row.setChecked(request.getChecked() != null && request.getChecked());
        progress.saveAndFlush(row);
        return snapshot(account);
    }

    @Transactional
    public InstructorResourcesDTO createTicket(String authorization, SupportTicketRequest request) {
        user account = actor(authorization);
        if (request == null) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "Thiếu nội dung hỗ trợ");
        }
        String topic = request.getTopic() == null ? "" : request.getTopic().trim().toUpperCase(Locale.ROOT);
        if (!TOPICS.contains(topic)) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "Chủ đề không hợp lệ", "topic");
        }
        String title = request.getTitle() == null ? "" : request.getTitle().trim();
        if (title.length() < 6) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "Tiêu đề cần ít nhất 6 ký tự", "title");
        }
        String body = request.getBody() == null ? "" : request.getBody().trim();
        if (body.length() < 20) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "Mô tả cần ít nhất 20 ký tự", "body");
        }
        InstructorSupportTicket row = new InstructorSupportTicket();
        row.setUser(account);
        row.setTopic(topic);
        row.setTitle(title);
        row.setBody(body);
        row.setStatus("OPEN");
        tickets.saveAndFlush(row);
        return snapshot(account);
    }

    @Transactional
    public InstructorResourcesDTO closeTicket(String authorization, Long id) {
        user account = actor(authorization);
        InstructorSupportTicket row = tickets.findByIdAndUser_Id(id, account.getId())
                .orElseThrow(() -> new AuthException(HttpStatus.NOT_FOUND, "Không tìm thấy yêu cầu hỗ trợ"));
        row.setStatus("CLOSED");
        tickets.saveAndFlush(row);
        return snapshot(account);
    }

    private InstructorResourcesDTO snapshot(user account) {
        Set<String> done = new HashSet<>();
        for (InstructorResourceProgress row : progress.findByUser_Id(account.getId())) {
            if (Boolean.TRUE.equals(row.getChecked())) {
                done.add(row.getItemKey());
            }
        }
        List<ResourceItemDTO> guides = new ArrayList<>();
        for (Guide item : GUIDES) {
            guides.add(toItem(item, done.contains(item.key)));
        }
        List<ResourceItemDTO> standards = new ArrayList<>();
        for (Guide item : STANDARDS) {
            standards.add(toItem(item, done.contains(item.key)));
        }
        List<Course> rows = courses.findByInstructorIdAndDeletedAtIsNullOrderByCreatedAtDesc(account.getId());
        Counts counts = counts(rows);
        List<ResourceCourseDTO> scored = rows.stream().map(row -> toCourse(row, counts)).toList();
        List<SupportTicketDTO> support = tickets.findByUser_IdOrderByCreatedAtDesc(account.getId())
                .stream()
                .map(row -> new SupportTicketDTO(
                        row.getId(),
                        row.getTopic(),
                        row.getTitle(),
                        row.getBody(),
                        row.getStatus(),
                        row.getCreatedAt()))
                .toList();
        return new InstructorResourcesDTO(guides, standards, scored, support);
    }

    private ResourceItemDTO toItem(Guide item, boolean checked) {
        return new ResourceItemDTO(item.key, item.title, item.summary, item.body, item.href, item.hrefLabel, checked);
    }

    private ResourceCourseDTO toCourse(Course course, Counts counts) {
        List<String> gaps = new ArrayList<>();
        int total = 8;
        int score = 0;
        if (filled(course.getTitle(), 8)) {
            score += 1;
        } else {
            gaps.add("Tên khóa học");
        }
        if (filled(course.getImages(), 4)) {
            score += 1;
        } else {
            gaps.add("Ảnh bìa");
        }
        if (filled(course.getSubtitle(), 20)) {
            score += 1;
        } else {
            gaps.add("Phụ đề");
        }
        if (filled(plain(course.getDescription()), 80)) {
            score += 1;
        } else {
            gaps.add("Mô tả chi tiết");
        }
        if (hasList(course.getWhatYouWillLearn())) {
            score += 1;
        } else {
            gaps.add("Bạn sẽ học được gì");
        }
        if (course.getCategory() != null) {
            score += 1;
        } else {
            gaps.add("Danh mục");
        }
        if (counts.sections.getOrDefault(course.getId(), 0L) >= 1) {
            score += 1;
        } else {
            gaps.add("Phần học");
        }
        if (counts.videos.getOrDefault(course.getId(), 0L) >= 1) {
            score += 1;
        } else {
            gaps.add("Video bài giảng");
        }
        return new ResourceCourseDTO(
                course.getId(),
                course.getTitle(),
                course.getImages(),
                course.getStatus(),
                Math.round(score * 100f / total),
                gaps);
    }

    private Counts counts(List<Course> rows) {
        List<Long> ids = rows.stream().map(Course::getId).toList();
        Map<Long, Long> sectionMap = new HashMap<>();
        Map<Long, Long> videoMap = new HashMap<>();
        if (!ids.isEmpty()) {
            for (Object[] row : sections.countGroupedByCourseIds(ids)) {
                sectionMap.put((Long) row[0], (Long) row[1]);
            }
            for (Object[] row : lessons.countWithMediaByCourseIds(ids)) {
                videoMap.put((Long) row[0], (Long) row[1]);
            }
        }
        return new Counts(sectionMap, videoMap);
    }

    private boolean knownKey(String key) {
        for (Guide item : GUIDES) {
            if (item.key.equals(key)) {
                return true;
            }
        }
        for (Guide item : STANDARDS) {
            if (item.key.equals(key)) {
                return true;
            }
        }
        return false;
    }

    private user actor(String authorization) {
        userDTO dto = userServices.requireInstructor(authorization);
        return users.findById(dto.getId())
                .orElseThrow(() -> new AuthException(HttpStatus.UNAUTHORIZED, "Phiên đăng nhập hết hạn"));
    }

    private boolean filled(String value, int min) {
        return value != null && value.trim().length() >= min;
    }

    private String plain(String value) {
        if (value == null) {
            return "";
        }
        return value.replaceAll("<[^>]+>", " ").replaceAll("\\s+", " ").trim();
    }

    private boolean hasList(String raw) {
        if (raw == null) {
            return false;
        }
        String text = raw.replace("[", "").replace("]", "").replace("\"", "").trim();
        return text.length() >= 8;
    }

    private record Guide(String key, String title, String summary, String body, String href, String hrefLabel) {
    }

    private record Counts(Map<Long, Long> sections, Map<Long, Long> videos) {
    }
}
