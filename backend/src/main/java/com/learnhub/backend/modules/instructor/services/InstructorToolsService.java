package com.learnhub.backend.modules.instructor.services;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.learnhub.backend.modules.cart.services.SePayTransactionClient;
import com.learnhub.backend.modules.course.repositories.CourseSectionRepository;
import com.learnhub.backend.modules.course.repositories.LessonRepository;
import com.learnhub.backend.modules.instructor.dtos.ApplyTemplateRequest;
import com.learnhub.backend.modules.instructor.dtos.CopyTemplateDTO;
import com.learnhub.backend.modules.instructor.dtos.CopyTemplateRequest;
import com.learnhub.backend.modules.instructor.dtos.InstructorBankDTO;
import com.learnhub.backend.modules.instructor.dtos.InstructorBankRequest;
import com.learnhub.backend.modules.instructor.dtos.InstructorToolsDTO;
import com.learnhub.backend.modules.instructor.dtos.PublishCourseDTO;
import com.learnhub.backend.modules.instructor.dtos.PublishItemDTO;
import com.learnhub.backend.modules.instructor.dtos.PublishRequest;
import com.learnhub.backend.modules.instructor.dtos.ToolCheckDTO;
import com.learnhub.backend.modules.instructor.dtos.ToolCheckRequest;
import com.learnhub.backend.modules.instructor.models.Course;
import com.learnhub.backend.modules.instructor.models.InstructorBankAccount;
import com.learnhub.backend.modules.instructor.models.InstructorCopyTemplate;
import com.learnhub.backend.modules.instructor.models.InstructorToolCheck;
import com.learnhub.backend.modules.instructor.repositories.CourseRepository;
import com.learnhub.backend.modules.instructor.repositories.InstructorBankAccountRepository;
import com.learnhub.backend.modules.instructor.repositories.InstructorCopyTemplateRepository;
import com.learnhub.backend.modules.instructor.repositories.InstructorToolCheckRepository;
import com.learnhub.backend.modules.instructor.support.VnBanks;
import com.learnhub.backend.modules.user.dtos.userDTO;
import com.learnhub.backend.modules.user.exceptions.AuthException;
import com.learnhub.backend.modules.user.models.user;
import com.learnhub.backend.modules.user.repositories.userRepository;
import com.learnhub.backend.modules.user.services.interfaces.UserServicesInterfaces;

@Service
public class InstructorToolsService {
    private static final Set<String> KINDS = Set.of("SUBTITLE", "DESCRIPTION", "LEARN");
    private static final TypeReference<List<String>> STRING_LIST = new TypeReference<>() {
    };
    private static final Item[] RECORDING = {
            new Item("lighting", "Ánh sáng", "Quay nơi sáng đều, tránh ngược sáng cửa sổ."),
            new Item("audio", "Âm thanh", "Dùng micro ngoài và kiểm tra tạp âm quạt, điều hòa."),
            new Item("camera", "Máy quay", "Độ phân giải tối thiểu 720p, ưu tiên 1080p."),
            new Item("framing", "Khung hình", "Mặt hoặc màn hình nằm giữa khung, không cắt trán."),
            new Item("script", "Kịch bản", "Có dàn ý từng bài trước khi bấm ghi."),
            new Item("length", "Độ dài clip", "Mỗi video 5–15 phút, tập trung một ý chính."),
            new Item("noise", "Môi trường", "Tắt thông báo máy tính, đóng cửa, điện thoại im lặng."),
            new Item("backup", "Sao lưu", "Giữ file gốc trên ổ cứng hoặc cloud trước khi xuất bản."),
            new Item("review", "Xem lại", "Xem hết clip trước khi tải lên khóa học."),
            new Item("naming", "Đặt tên file", "Đặt tên theo chương-bài để khỏi nhầm khi ghép curriculum."),
    };

    private final UserServicesInterfaces userServices;
    private final userRepository users;
    private final CourseRepository courses;
    private final CourseSectionRepository sections;
    private final LessonRepository lessons;
    private final InstructorToolCheckRepository checks;
    private final InstructorCopyTemplateRepository templates;
    private final InstructorBankAccountRepository banks;
    private final SePayTransactionClient sePayTransactions;
    private final ObjectMapper mapper = new ObjectMapper();

    public InstructorToolsService(
            UserServicesInterfaces userServices,
            userRepository users,
            CourseRepository courses,
            CourseSectionRepository sections,
            LessonRepository lessons,
            InstructorToolCheckRepository checks,
            InstructorCopyTemplateRepository templates,
            InstructorBankAccountRepository banks,
            SePayTransactionClient sePayTransactions) {
        this.userServices = userServices;
        this.users = users;
        this.courses = courses;
        this.sections = sections;
        this.lessons = lessons;
        this.checks = checks;
        this.templates = templates;
        this.banks = banks;
        this.sePayTransactions = sePayTransactions;
    }

    @Transactional
    public InstructorToolsDTO overview(String authorization) {
        user account = actor(authorization);
        seedTemplates(account);
        return snapshot(account);
    }

    @Transactional
    public InstructorToolsDTO saveCheck(String authorization, ToolCheckRequest request) {
        user account = actor(authorization);
        if (request == null || request.getKey() == null || request.getKey().isBlank()) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "Thiếu mục checklist");
        }
        String key = request.getKey().trim().toLowerCase(Locale.ROOT);
        boolean known = false;
        for (Item item : RECORDING) {
            if (item.key.equals(key)) {
                known = true;
                break;
            }
        }
        if (!known) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "Mục checklist không hợp lệ");
        }
        InstructorToolCheck row = checks.findByUser_IdAndItemKey(account.getId(), key).orElseGet(() -> {
            InstructorToolCheck created = new InstructorToolCheck();
            created.setUser(account);
            created.setItemKey(key);
            return created;
        });
        row.setChecked(request.getChecked() != null && request.getChecked());
        checks.saveAndFlush(row);
        return snapshot(account);
    }

    @Transactional
    public InstructorToolsDTO createTemplate(String authorization, CopyTemplateRequest request) {
        user account = actor(authorization);
        InstructorCopyTemplate row = new InstructorCopyTemplate();
        row.setUser(account);
        applyTemplate(row, request);
        templates.saveAndFlush(row);
        return snapshot(account);
    }

    @Transactional
    public InstructorToolsDTO updateTemplate(String authorization, Long id, CopyTemplateRequest request) {
        user account = actor(authorization);
        InstructorCopyTemplate row = templates.findByIdAndUser_Id(id, account.getId())
                .orElseThrow(() -> new AuthException(HttpStatus.NOT_FOUND, "Không tìm thấy mẫu"));
        applyTemplate(row, request);
        templates.saveAndFlush(row);
        return snapshot(account);
    }

    @Transactional
    public InstructorToolsDTO deleteTemplate(String authorization, Long id) {
        user account = actor(authorization);
        InstructorCopyTemplate row = templates.findByIdAndUser_Id(id, account.getId())
                .orElseThrow(() -> new AuthException(HttpStatus.NOT_FOUND, "Không tìm thấy mẫu"));
        templates.delete(row);
        templates.flush();
        return snapshot(account);
    }

    @Transactional
    public InstructorToolsDTO applyTemplate(String authorization, Long id, ApplyTemplateRequest request) {
        user account = actor(authorization);
        InstructorCopyTemplate row = templates.findByIdAndUser_Id(id, account.getId())
                .orElseThrow(() -> new AuthException(HttpStatus.NOT_FOUND, "Không tìm thấy mẫu"));
        Course course = ownedCourse(account, request == null ? null : request.getCourseId());
        writeCopy(course, row.getKind(), row.getBody());
        courses.saveAndFlush(course);
        return snapshot(account);
    }

    @Transactional
    public InstructorToolsDTO publish(String authorization, PublishRequest request) {
        user account = actor(authorization);
        Course course = ownedCourse(account, request == null ? null : request.getCourseId());
        PublishCourseDTO state = toPublish(course, counts(List.of(course)));
        if (!state.isReady()) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "Khóa học chưa đủ mục bắt buộc để xuất bản");
        }
        course.setStatus("PUBLISHED");
        if (course.getPublishedAt() == null) {
            course.setPublishedAt(LocalDateTime.now());
        }
        courses.saveAndFlush(course);
        return snapshot(account);
    }

    @Transactional
    public InstructorToolsDTO unpublish(String authorization, PublishRequest request) {
        user account = actor(authorization);
        Course course = ownedCourse(account, request == null ? null : request.getCourseId());
        course.setStatus("DRAFT");
        courses.saveAndFlush(course);
        return snapshot(account);
    }

    @Transactional
    public InstructorToolsDTO saveBank(String authorization, InstructorBankRequest request) {
        user account = actor(authorization);
        if (request == null) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "Thiếu thông tin tài khoản");
        }
        String code = request.getBankCode() == null ? "" : request.getBankCode().trim();
        if (!VnBanks.known(code)) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "Ngân hàng không hợp lệ", "bankCode");
        }
        String number = digits(request.getAccountNumber());
        if (number.length() < 6 || number.length() > 19) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "Số tài khoản không hợp lệ", "accountNumber");
        }
        String name = request.getAccountName() == null ? "" : request.getAccountName().trim().replaceAll("\\s+", " ");
        if (name.length() < 4) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "Vui lòng nhập tên chủ tài khoản", "accountName");
        }
        InstructorBankAccount row = banks.findByUser_Id(account.getId()).orElseGet(() -> {
            InstructorBankAccount created = new InstructorBankAccount();
            created.setUser(account);
            return created;
        });
        row.setBankCode(code);
        row.setBankName(VnBanks.nameOf(code));
        row.setAccountNumber(number);
        row.setAccountName(name.toUpperCase(Locale.ROOT));
        row.setSepayAccountId(sePayTransactions.findLinkedAccount(number)
                .map(SePayTransactionClient.LinkedAccount::id)
                .orElse(null));
        banks.saveAndFlush(row);
        return snapshot(account);
    }

    @Transactional
    public InstructorToolsDTO deleteBank(String authorization) {
        user account = actor(authorization);
        banks.findByUser_Id(account.getId()).ifPresent(banks::delete);
        banks.flush();
        return snapshot(account);
    }

    private InstructorToolsDTO snapshot(user account) {
        Map<String, Boolean> checked = new HashMap<>();
        for (InstructorToolCheck row : checks.findByUser_Id(account.getId())) {
            checked.put(row.getItemKey(), Boolean.TRUE.equals(row.getChecked()));
        }
        List<ToolCheckDTO> recording = new ArrayList<>();
        for (Item item : RECORDING) {
            recording.add(new ToolCheckDTO(item.key, item.label, item.hint, checked.getOrDefault(item.key, false)));
        }
        List<CopyTemplateDTO> copies = templates.findByUser_IdOrderByUpdatedAtDesc(account.getId())
                .stream()
                .map(row -> new CopyTemplateDTO(row.getId(), row.getKind(), row.getTitle(), row.getBody(), row.getUpdatedAt()))
                .toList();
        List<Course> rows = courses.findByInstructorIdAndDeletedAtIsNullOrderByCreatedAtDesc(account.getId());
        Counts counts = counts(rows);
        List<PublishCourseDTO> publish = rows.stream().map(row -> toPublish(row, counts)).toList();
        InstructorBankDTO bank = banks.findByUser_Id(account.getId()).map(this::toBank).orElse(null);
        return new InstructorToolsDTO(recording, copies, publish, bank);
    }

    private InstructorBankDTO toBank(InstructorBankAccount row) {
        boolean linked = row.getSepayAccountId() != null && !row.getSepayAccountId().isBlank();
        if (!linked) {
            linked = sePayTransactions.findLinkedAccount(row.getAccountNumber()).isPresent();
        }
        return new InstructorBankDTO(
                row.getId(),
                row.getBankCode(),
                row.getBankName(),
                row.getAccountNumber(),
                row.getAccountName(),
                qrUrl(row.getBankCode(), row.getAccountNumber()),
                linked);
    }

    private String qrUrl(String bank, String account) {
        if (bank == null || bank.isBlank() || account == null || account.isBlank()) {
            return "";
        }
        return "https://qr.sepay.vn/img?acc=" + encode(account)
                + "&bank=" + encode(bank)
                + "&template=compact";
    }

    private String encode(String value) {
        return java.net.URLEncoder.encode(value == null ? "" : value, java.nio.charset.StandardCharsets.UTF_8);
    }

    private String digits(String value) {
        if (value == null) {
            return "";
        }
        return value.replaceAll("\\D+", "");
    }

    private void seedTemplates(user account) {
        if (templates.countByUser_Id(account.getId()) > 0) {
            return;
        }
        saveSeed(
                account,
                "SUBTITLE",
                "Phụ đề hấp dẫn",
                "Khóa học thực chiến giúp bạn làm được sản phẩm hoàn chỉnh, không chỉ nghe lý thuyết.");
        saveSeed(
                account,
                "DESCRIPTION",
                "Mô tả chuẩn",
                """
                        Khóa học này dành cho người muốn đi từ nền tảng đến thực hành.

                        Bạn sẽ được hướng dẫn từng bước, làm bài tập sát thực tế và hoàn thiện một sản phẩm có thể mang đi giới thiệu.

                        Nội dung được chia nhỏ theo chủ đề, mỗi bài tập trung một kỹ năng để bạn theo kịp dù đang đi làm.

                        Sau khóa học, bạn tự tin áp dụng ngay vào công việc thay vì chỉ nhớ lý thuyết.""");
        saveSeed(
                account,
                "LEARN",
                "Bạn sẽ học được gì",
                """
                        Xác định mục tiêu và lộ trình học rõ ràng
                        Thực hành trên bài tập sát tình huống thật
                        Tự xây dựng được sản phẩm hoàn chỉnh
                        Biết cách sửa lỗi và tối ưu sau khi hoàn thành""");
    }

    private void saveSeed(user account, String kind, String title, String body) {
        InstructorCopyTemplate row = new InstructorCopyTemplate();
        row.setUser(account);
        row.setKind(kind);
        row.setTitle(title);
        row.setBody(body);
        templates.save(row);
    }

    private void applyTemplate(InstructorCopyTemplate row, CopyTemplateRequest request) {
        if (request == null) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "Thiếu dữ liệu mẫu");
        }
        String kind = request.getKind() == null ? "" : request.getKind().trim().toUpperCase(Locale.ROOT);
        if (!KINDS.contains(kind)) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "Loại mẫu không hợp lệ", "kind");
        }
        String title = request.getTitle() == null ? "" : request.getTitle().trim();
        if (title.isBlank()) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "Vui lòng nhập tên mẫu", "title");
        }
        String body = request.getBody() == null ? "" : request.getBody().trim();
        if (body.isBlank()) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "Vui lòng nhập nội dung mẫu", "body");
        }
        row.setKind(kind);
        row.setTitle(title);
        row.setBody(body);
    }

    private void writeCopy(Course course, String kind, String body) {
        String text = body == null ? "" : body.trim();
        if ("SUBTITLE".equals(kind)) {
            course.setSubtitle(text);
            return;
        }
        if ("DESCRIPTION".equals(kind)) {
            course.setDescription(text);
            return;
        }
        List<String> items = new ArrayList<>();
        for (String line : text.split("\\r?\\n")) {
            String value = line.trim();
            if (!value.isBlank()) {
                items.add(value);
            }
        }
        try {
            course.setWhatYouWillLearn(mapper.writeValueAsString(items));
        } catch (JsonProcessingException exception) {
            course.setWhatYouWillLearn("[]");
        }
    }

    private PublishCourseDTO toPublish(Course course, Counts counts) {
        Long id = course.getId();
        String edit = "/giang-day/quan-tri";
        String curriculum = "/giang-day/quan-tri/" + id + "/phan-hoc";
        String record = "/giang-day/quan-tri/ghi-hinh";
        boolean title = filled(course.getTitle(), 8);
        boolean image = filled(course.getImages(), 4);
        boolean subtitle = filled(course.getSubtitle(), 20);
        boolean description = filled(plain(course.getDescription()), 80);
        boolean learn = jsonLen(course.getWhatYouWillLearn()) >= 2;
        boolean category = course.getCategory() != null;
        boolean section = counts.sections.getOrDefault(id, 0L) >= 1;
        boolean video = counts.videos.getOrDefault(id, 0L) >= 1;
        boolean preview = filled(course.getPreviewVideo(), 4);
        boolean requirements = jsonLen(course.getRequirements()) >= 1;
        List<PublishItemDTO> items = List.of(
                new PublishItemDTO("title", "Tên khóa học", title, true, edit),
                new PublishItemDTO("image", "Ảnh bìa", image, true, edit),
                new PublishItemDTO("subtitle", "Phụ đề", subtitle, true, edit),
                new PublishItemDTO("description", "Mô tả chi tiết", description, true, edit),
                new PublishItemDTO("learn", "Bạn sẽ học được gì", learn, true, edit),
                new PublishItemDTO("category", "Danh mục", category, true, edit),
                new PublishItemDTO("sections", "Ít nhất một phần học", section, true, curriculum),
                new PublishItemDTO("videos", "Ít nhất một video bài giảng", video, true, record),
                new PublishItemDTO("preview", "Video giới thiệu", preview, false, edit),
                new PublishItemDTO("requirements", "Yêu cầu đầu vào", requirements, false, edit));
        int done = 0;
        int requiredDone = 0;
        int requiredTotal = 0;
        for (PublishItemDTO item : items) {
            if (item.isDone()) {
                done += 1;
            }
            if (item.isRequired()) {
                requiredTotal += 1;
                if (item.isDone()) {
                    requiredDone += 1;
                }
            }
        }
        boolean ready = requiredDone == requiredTotal;
        return new PublishCourseDTO(
                id,
                course.getTitle(),
                course.getSlug(),
                course.getImages(),
                course.getStatus(),
                ready,
                done,
                items.size(),
                items);
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

    private Course ownedCourse(user account, Long courseId) {
        if (courseId == null) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "Vui lòng chọn khóa học");
        }
        Course course = courses.findById(courseId)
                .orElseThrow(() -> new AuthException(HttpStatus.NOT_FOUND, "Không tìm thấy khóa học"));
        if (course.getDeletedAt() != null
                || course.getInstructor() == null
                || !account.getId().equals(course.getInstructor().getId())) {
            throw new AuthException(HttpStatus.FORBIDDEN, "Bạn không sở hữu khóa học này");
        }
        return course;
    }

    private user actor(String authorization) {
        userDTO dto = userServices.requireInstructor(authorization);
        return users.findById(dto.getId())
                .orElseThrow(() -> new AuthException(HttpStatus.UNAUTHORIZED, "Phiên đăng nhập hết hạn"));
    }

    private int jsonLen(String raw) {
        if (raw == null || raw.isBlank()) {
            return 0;
        }
        try {
            List<String> items = mapper.readValue(raw, STRING_LIST);
            int count = 0;
            for (String item : items) {
                if (item != null && !item.isBlank()) {
                    count += 1;
                }
            }
            return count;
        } catch (JsonProcessingException ignored) {
            return 0;
        }
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

    private record Item(String key, String label, String hint) {
    }

    private record Counts(Map<Long, Long> sections, Map<Long, Long> videos) {
    }
}
