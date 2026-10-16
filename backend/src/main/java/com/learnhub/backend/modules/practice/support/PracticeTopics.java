package com.learnhub.backend.modules.practice.support;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

public final class PracticeTopics {
    public static final List<String> LABELS = List.of(
            "Flutter",
            "Dart",
            "React",
            "Next.js",
            "Firebase",
            "Spring Boot",
            "Java",
            "Docker",
            "Git và GitHub",
            "REST API",
            "SQL và cơ sở dữ liệu",
            "JavaScript",
            "TypeScript",
            "HTML và CSS",
            "UI/UX",
            "Trí tuệ nhân tạo",
            "Xác thực người dùng",
            "Android",
            "iOS");

    private PracticeTopics() {
    }

    public static Topic detect(String text) {
        String hay = norm(text);
        if (hay.isBlank()) {
            return null;
        }
        for (Topic topic : ALL) {
            for (String key : topic.keys) {
                if (hay.contains(key)) {
                    return topic;
                }
            }
        }
        return null;
    }

    public static List<String> otherLabels(String correct, int need) {
        List<String> items = new ArrayList<>();
        for (String label : LABELS) {
            if (!label.equalsIgnoreCase(correct)) {
                items.add(label);
            }
            if (items.size() >= need) {
                break;
            }
        }
        return items;
    }

    public static String fieldLabel() {
        return "Lập trình và phát triển phần mềm";
    }

    public static List<String> otherFields() {
        return List.of(
                "Quản trị hệ thống và mạng",
                "Khoa học dữ liệu",
                "An toàn thông tin");
    }

    public static List<Fact> bank() {
        return BANK;
    }

    public static String norm(String value) {
        return value == null ? "" : value.toLowerCase(Locale.ROOT);
    }

    public static final List<Topic> ALL = List.of(
            new Topic("Flutter", List.of("flutter"), List.of(
                    fact("Flutter chủ yếu dùng để xây dựng gì?",
                            "Ứng dụng di động đa nền tảng",
                            List.of("Hệ thống nhúng vi điều khiển", "Mạch in PCB", "Trình điều khiển máy in")),
                    fact("Ngôn ngữ chính khi lập trình Flutter là gì?",
                            "Dart",
                            List.of("PHP", "Ruby", "Go")))),
            new Topic("Dart", List.of(" dart", "ngôn ngữ dart"), List.of(
                    fact("Dart thường được dùng cùng nền tảng nào?",
                            "Flutter",
                            List.of("Laravel", "Django", "WordPress")))),
            new Topic("React", List.of("react"), List.of(
                    fact("React là gì?",
                            "Thư viện xây dựng giao diện người dùng",
                            List.of("Hệ quản trị cơ sở dữ liệu", "Trình biên dịch C++", "Hệ điều hành")),
                    fact("Cú pháp phổ biến khi viết React là gì?",
                            "JSX",
                            List.of("XML Schema", "YAML", "Markdown")))),
            new Topic("Next.js", List.of("next.js", "nextjs", "next js"), List.of(
                    fact("Next.js được xây dựng dựa trên thư viện nào?",
                            "React",
                            List.of("Vue", "Svelte", "Angular")),
                    fact("Next.js thường dùng cho loại ứng dụng nào?",
                            "Ứng dụng web (SSR/full-stack)",
                            List.of("Trình điều khiển máy in", "Firmware IoT", "Game console")))),
            new Topic("Firebase", List.of("firebase", "firestore"), List.of(
                    fact("Firebase thuộc hệ sinh thái của công ty nào?",
                            "Google",
                            List.of("Microsoft", "Amazon", "Oracle")),
                    fact("Firebase thường cung cấp dịch vụ nào cho ứng dụng?",
                            "Xác thực, CSDL thời gian thực và lưu trữ",
                            List.of("Biên dịch native C", "Thiết kế chip", "Hosting chỉ FTP")))),
            new Topic("Spring Boot", List.of("spring boot", "springboot", "spring framework", "spring"), List.of(
                    fact("Spring Boot chủ yếu dùng cho phía nào của ứng dụng?",
                            "Backend / máy chủ",
                            List.of("Chỉnh sửa ảnh", "Dựng phim", "Thiết kế 3D")),
                    fact("Spring Boot thường gắn với ngôn ngữ nào?",
                            "Java",
                            List.of("Swift", "Kotlin-only mobile UI", "Pascal")))),
            new Topic("Java", List.of("java", "jdk", "jvm", "lombok"), List.of(
                    fact("Java thường chạy trên môi trường nào?",
                            "JVM",
                            List.of("Chỉ trình duyệt IE", "BIOS", "Photoshop plugin")))),
            new Topic("Docker", List.of("docker", "container"), List.of(
                    fact("Docker dùng để làm gì?",
                            "Đóng gói và chạy ứng dụng bằng container",
                            List.of("Vẽ vector", "Soạn thảo văn bản", "Cân chỉnh âm thanh")))),
            new Topic("Git và GitHub", List.of("git", "github", "copilot"), List.of(
                    fact("Git dùng để làm gì trong lập trình?",
                            "Quản lý phiên bản mã nguồn",
                            List.of("Vẽ mockup", "Render video", "Thiết kế font chữ")),
                    fact("GitHub Copilot hỗ trợ lập trình viên theo hướng nào?",
                            "Gợi ý và sinh mã bằng AI",
                            List.of("Thay thế hoàn toàn máy chủ", "Quản lý lương nhân sự", "In 3D")))),
            new Topic("REST API", List.of("api", "rest", "endpoint", "http"), List.of(
                    fact("API giúp các phần mềm làm gì?",
                            "Giao tiếp và trao đổi dữ liệu với nhau",
                            List.of("Tăng độ phân giải ảnh", "Ép xung CPU", "Căn chỉnh màu in")),
                    fact("REST API thường dùng giao thức nào?",
                            "HTTP",
                            List.of("SMTP in ấn", "HDMI", "Bluetooth audio")))),
            new Topic("SQL và cơ sở dữ liệu", List.of("sql", "jpa", "hibernate", "database", "cơ sở dữ liệu"), List.of(
                    fact("SQL dùng để làm gì?",
                            "Truy vấn và quản lý dữ liệu",
                            List.of("Thiết kế poster", "Thu âm podcast", "Cân chỉnh đèn studio")))),
            new Topic("JavaScript", List.of("javascript", "js "), List.of(
                    fact("JavaScript chạy phổ biến ở đâu?",
                            "Trình duyệt và môi trường như Node.js",
                            List.of("Chỉ trên mainframe", "Chỉ trong Excel macro", "Chỉ firmware router")))),
            new Topic("TypeScript", List.of("typescript", "ts "), List.of(
                    fact("TypeScript khác JavaScript chủ yếu ở điểm nào?",
                            "Có kiểu dữ liệu tĩnh (type)",
                            List.of("Không chạy được trên web", "Chỉ dùng cho Android", "Thay thế HTML")))),
            new Topic("HTML và CSS", List.of("html", "css", "giao diện web"), List.of(
                    fact("HTML dùng để làm gì?",
                            "Cấu trúc nội dung trang web",
                            List.of("Biên dịch kernel", "Mã hóa SSL", "Lập lịch cron")))),
            new Topic("UI/UX", List.of("giao diện", "gui", "appbar", "navbar", " ui/ux", "ux "), List.of(
                    fact("UI trong phát triển phần mềm là gì?",
                            "Giao diện người dùng",
                            List.of("Bộ xử lý trung tâm", "Giao thức mạng nội bộ", "Hệ thống file")))),
            new Topic("Trí tuệ nhân tạo", List.of("gemini", "chatgpt", "openai", "genai", "machine learning", "trí tuệ"), List.of(
                    fact("Gemini là mô hình AI của đơn vị nào?",
                            "Google",
                            List.of("Intel", "Adobe", "Sony")),
                    fact("Khi tích hợp AI vào ứng dụng, lập trình viên thường làm gì?",
                            "Gọi API mô hình để gửi dữ liệu và nhận kết quả",
                            List.of("Hàn mạch thủ công", "Cài driver máy in", "Cân màu màn hình")))),
            new Topic("Xác thực người dùng", List.of("auth", "login", "đăng nhập", "oauth", "jwt"), List.of(
                    fact("Xác thực (authentication) dùng để làm gì?",
                            "Nhận diện người dùng trước khi cho vào hệ thống",
                            List.of("Nén ảnh PNG", "Tối ưu SEO offpage", "Cân bằng tải DNS chỉ")))),
            new Topic("Android", List.of("android", "emulator", "avd"), List.of(
                    fact("Android Emulator dùng để làm gì khi học lập trình mobile?",
                            "Chạy thử ứng dụng trên máy ảo",
                            List.of("In 3D mô hình", "Ghi âm podcast", "Thiết kế poster")))),
            new Topic("iOS", List.of("ios", "xcode", "iphone", "simulator"), List.of(
                    fact("Xcode chủ yếu dùng khi phát triển nền tảng nào?",
                            "iOS / macOS",
                            List.of("Windows Forms", "Mainframe COBOL", "WordPress theme")))));

    private static final List<Fact> BANK = List.of(
            fact("Mục tiêu chính khi học lập trình trên khóa học trực tuyến là gì?",
                    "Nắm khái niệm rồi thực hành theo bài giảng",
                    List.of("Chỉ xem cho có mặt", "Bỏ qua bài tập", "Học thuộc lòng không cần chạy code")),
            fact("Khi code không chạy, bước nên làm trước là gì?",
                    "Đọc thông báo lỗi và kiểm tra lại đoạn vừa viết",
                    List.of("Xóa toàn bộ dự án", "Đổi máy tính ngay", "Bỏ qua và học bài khác")),
            fact("Git commit dùng để làm gì?",
                    "Lưu một phiên bản mã nguồn kèm mô tả thay đổi",
                    List.of("Xóa remote repository", "Tăng RAM máy ảo", "Xuất file PDF")),
            fact("Biến (variable) trong lập trình dùng để làm gì?",
                    "Lưu giá trị để dùng lại trong chương trình",
                    List.of("Vẽ icon", "Cấu hình router", "Nén video")),
            fact("Hàm (function) giúp lập trình viên điều gì?",
                    "Tái sử dụng một khối xử lý",
                    List.of("Tăng độ phân giải màn hình", "Sạc pin nhanh hơn", "Đổi font hệ thống")),
            fact("Câu lệnh điều kiện (if/else) dùng khi nào?",
                    "Khi chương trình phải rẽ nhánh theo dữ liệu",
                    List.of("Khi cài driver", "Khi format ổ đĩa", "Khi cân màu ảnh")),
            fact("Vòng lặp (loop) dùng để làm gì?",
                    "Lặp lại một thao tác nhiều lần",
                    List.of("Tắt máy an toàn", "Ghi đĩa CD", "Cập nhật BIOS")),
            fact("Mảng / danh sách dùng để làm gì?",
                    "Lưu nhiều phần tử cùng kiểu",
                    List.of("Quản lý DNS", "In 3D", "Ép xung GPU")),
            fact("JSON thường dùng để làm gì trong lập trình web?",
                    "Trao đổi dữ liệu giữa client và server",
                    List.of("Sửa firmware máy in", "Cân chỉnh loa", "Quay video 8K")),
            fact("HTTP status 404 nghĩa là gì?",
                    "Không tìm thấy tài nguyên",
                    List.of("Máy chủ hết RAM", "SSL hết hạn", "DNS bị tấn công")),
            fact("HTTP status 200 nghĩa là gì?",
                    "Yêu cầu thành công",
                    List.of("Yêu cầu bị cấm", "Máy chủ đang bảo trì", "Hết dung lượng")),
            fact("HTTPS khác HTTP ở điểm nào?",
                    "Dữ liệu được mã hóa khi truyền",
                    List.of("Nhanh hơn luôn gấp 10 lần", "Chỉ chạy trên Windows", "Không dùng được API")),
            fact("Cơ sở dữ liệu quan hệ thường dùng ngôn ngữ nào?",
                    "SQL",
                    List.of("HTML", "CSS", "SVG")),
            fact("Primary key trong bảng CSDL dùng để làm gì?",
                    "Định danh duy nhất từng dòng dữ liệu",
                    List.of("Đổi theme giao diện", "Tăng FPS game", "Nén ảnh PNG")),
            fact("ORM (như JPA/Hibernate) giúp điều gì?",
                    "Ánh xạ đối tượng trong code sang bảng CSDL",
                    List.of("Render phim", "Thiết kế poster", "Cân chỉnh microphone")),
            fact("REST API nên dùng phương thức nào để lấy dữ liệu?",
                    "GET",
                    List.of("FORMAT", "PRINT", "SLEEP")),
            fact("REST API nên dùng phương thức nào để tạo dữ liệu mới?",
                    "POST",
                    List.of("HEAD only", "TRACE only", "CONNECT only")),
            fact("JWT thường dùng trong ứng dụng web để làm gì?",
                    "Xác thực người dùng sau khi đăng nhập",
                    List.of("Vẽ biểu đồ", "Nén CSS", "Tối ưu SEO hình ảnh")),
            fact("Môi trường phát triển (development) khác production ở điểm nào?",
                    "Dùng để thử nghiệm, chưa phục vụ người dùng thật",
                    List.of("Nhanh hơn production luôn", "Không cần mã nguồn", "Không được dùng Git")),
            fact("Dependency / thư viện bên thứ ba dùng để làm gì?",
                    "Tái sử dụng chức năng đã có thay vì viết lại",
                    List.of("Thay thế hệ điều hành", "Tăng dung lượng ổ cứng", "Chặn hết API")),
            fact("Khi học một khóa lập trình, thứ tự hợp lý là gì?",
                    "Xem bài giảng, làm theo, rồi tự thực hành",
                    List.of("Làm bài tập trước khi biết đề bài", "Bỏ qua toàn bộ lý thuyết", "Chỉ copy code không đọc")),
            fact("Debug là gì?",
                    "Tìm và sửa lỗi trong chương trình",
                    List.of("Xóa hệ điều hành", "Ép xung CPU", "Định dạng USB")),
            fact("IDE (như VS Code, IntelliJ) dùng để làm gì?",
                    "Viết, chạy và gỡ lỗi mã nguồn",
                    List.of("Sửa video 4K", "Thiết kế nội thất", "Quản lý lương")),
            fact("Terminal / command line giúp lập trình viên điều gì?",
                    "Chạy lệnh, cài gói và quản lý dự án",
                    List.of("Cân màu ảnh raw", "Thu âm podcast", "In offset")),
            fact("Package manager (npm, Maven, Gradle) dùng để làm gì?",
                    "Cài và quản lý thư viện của dự án",
                    List.of("Quay slow-motion", "Căn chỉnh đèn studio", "Ép file ISO")),
            fact("Responsive trong lập trình web nghĩa là gì?",
                    "Giao diện thích ứng nhiều kích thước màn hình",
                    List.of("Server trả lời trong 1ms", "Chỉ chạy trên 4K", "Tắt JavaScript")),
            fact("Component trong UI framework dùng để làm gì?",
                    "Tách giao diện thành khối tái sử dụng",
                    List.of("Tăng điện áp nguồn", "Ghi đĩa DVD", "Cài driver audio")),
            fact("State trong ứng dụng giao diện là gì?",
                    "Dữ liệu làm UI thay đổi khi cập nhật",
                    List.of("Tên miền DNS", "Dung lượng RAM vật lý", "Độ phân giải camera")),
            fact("Khi gọi API thất bại, ứng dụng nên làm gì?",
                    "Báo lỗi rõ và cho người dùng thử lại",
                    List.of("Im lặng đóng app", "Xóa tài khoản", "Format máy")),
            fact("Test (kiểm thử) giúp dự án điều gì?",
                    "Phát hiện lỗi sớm trước khi đưa cho học viên/người dùng",
                    List.of("Làm chậm compiler", "Tăng kích thước ảnh", "Tắt Git")),
            fact("Comment trong code nên dùng khi nào?",
                    "Giải thích ý định khó hiểu, không lặp lại từng dòng",
                    List.of("Viết cả tiểu thuyết trong file", "Xóa hết tên biến", "Thay thế Git")),
            fact("Đặt tên biến/hàm rõ ràng nhằm mục đích gì?",
                    "Để người khác (và bạn sau này) đọc hiểu code",
                    List.of("Làm chương trình chạy nhanh gấp đôi", "Giảm dung lượng ổ", "Tăng FPS")),
            fact("Khi học xong một bài giảng, việc nên làm ngay là gì?",
                    "Tự gõ lại và chạy thử phần vừa học",
                    List.of("Xóa bài giảng", "Đổi khóa học khác ngay", "Bỏ qua thực hành")),
            fact("Lộ trình học lập trình hiệu quả thường bắt đầu từ đâu?",
                    "Nền tảng (cú pháp, công cụ) rồi mới tới dự án",
                    List.of("Dự án lớn ngày đầu", "Bỏ qua cài môi trường", "Học ngược từ deploy")),
            fact("Pull request / code review giúp gì?",
                    "Người khác góp ý để code chắc và dễ bảo trì",
                    List.of("Tự động tăng lương", "Xóa production", "Tắt HTTPS")));

    private static Fact fact(String question, String correct, List<String> wrongs) {
        return new Fact(question, correct, wrongs);
    }

    public static final class Topic {
        public final String label;
        public final List<String> keys;
        public final List<Fact> facts;

        private Topic(String label, List<String> keys, List<Fact> facts) {
            this.label = label;
            this.keys = keys;
            this.facts = facts;
        }
    }

    public static final class Fact {
        public final String question;
        public final String correct;
        public final List<String> wrongs;

        private Fact(String question, String correct, List<String> wrongs) {
            this.question = question;
            this.correct = correct;
            this.wrongs = wrongs;
        }
    }
}
