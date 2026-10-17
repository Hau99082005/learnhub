package com.learnhub.backend.modules.practice.services;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import com.learnhub.backend.modules.cart.models.Enrollment;
import com.learnhub.backend.modules.cart.repositories.EnrollmentRepository;
import com.learnhub.backend.modules.cart.support.CertificateGrades;
import com.learnhub.backend.modules.course.models.CourseSection;
import com.learnhub.backend.modules.course.models.Lesson;
import com.learnhub.backend.modules.course.repositories.CourseSectionRepository;
import com.learnhub.backend.modules.course.repositories.LessonRepository;
import com.learnhub.backend.modules.instructor.models.Course;
import com.learnhub.backend.modules.instructor.repositories.CourseRepository;
import com.learnhub.backend.modules.practice.dtos.PracticeAnswerRequest;
import com.learnhub.backend.modules.practice.dtos.PracticeCourseDTO;
import com.learnhub.backend.modules.practice.dtos.PracticeHistoryDTO;
import com.learnhub.backend.modules.practice.dtos.PracticeOptionDTO;
import com.learnhub.backend.modules.practice.dtos.PracticeQuestionDTO;
import com.learnhub.backend.modules.practice.dtos.PracticeQuizDTO;
import com.learnhub.backend.modules.practice.dtos.PracticeResultDTO;
import com.learnhub.backend.modules.practice.dtos.PracticeSubmitRequest;
import com.learnhub.backend.modules.practice.models.Quiz;
import com.learnhub.backend.modules.practice.models.QuizAttempt;
import com.learnhub.backend.modules.practice.models.QuizAttemptAnswer;
import com.learnhub.backend.modules.practice.models.QuizOption;
import com.learnhub.backend.modules.practice.models.QuizQuestion;
import com.learnhub.backend.modules.practice.repositories.QuizAttemptAnswerRepository;
import com.learnhub.backend.modules.practice.repositories.QuizAttemptRepository;
import com.learnhub.backend.modules.practice.repositories.QuizOptionRepository;
import com.learnhub.backend.modules.practice.repositories.QuizQuestionRepository;
import com.learnhub.backend.modules.practice.repositories.QuizRepository;
import com.learnhub.backend.modules.practice.support.PracticeTopics;
import com.learnhub.backend.modules.notify.models.NotificationJob;
import com.learnhub.backend.modules.notify.services.NotificationQueue;
import com.learnhub.backend.modules.user.exceptions.AuthException;
import com.learnhub.backend.modules.user.models.user;
import com.learnhub.backend.modules.user.services.interfaces.UserServicesInterfaces;

@Service
public class PracticeService {
    private static final String PRACTICE_SLUG = "danh-gia-nang-luc";
    private static final String QUIZ_MARK = "[LH3]";
    private static final int MIN_QUESTIONS = 50;
    private static final int MAX_QUESTIONS = 60;

    private final EnrollmentRepository enrollments;
    private final CourseRepository courses;
    private final CourseSectionRepository sections;
    private final LessonRepository lessons;
    private final QuizRepository quizzes;
    private final QuizQuestionRepository questions;
    private final QuizOptionRepository options;
    private final QuizAttemptRepository attempts;
    private final QuizAttemptAnswerRepository attemptAnswers;
    private final UserServicesInterfaces userServices;
    private final NotificationQueue notificationQueue;

    public PracticeService(
            EnrollmentRepository enrollments,
            CourseRepository courses,
            CourseSectionRepository sections,
            LessonRepository lessons,
            QuizRepository quizzes,
            QuizQuestionRepository questions,
            QuizOptionRepository options,
            QuizAttemptRepository attempts,
            QuizAttemptAnswerRepository attemptAnswers,
            UserServicesInterfaces userServices,
            NotificationQueue notificationQueue) {
        this.enrollments = enrollments;
        this.courses = courses;
        this.sections = sections;
        this.lessons = lessons;
        this.quizzes = quizzes;
        this.questions = questions;
        this.options = options;
        this.attempts = attempts;
        this.attemptAnswers = attemptAnswers;
        this.userServices = userServices;
        this.notificationQueue = notificationQueue;
    }

    @Transactional
    public List<PracticeCourseDTO> list(String authorization) {
        user account = userServices.requireAccount(authorization);
        List<Enrollment> rows = enrollments.findByUserIdOrderByEnrolledAtDesc(account.getId());
        if (rows.isEmpty()) {
            return List.of();
        }
        List<Long> courseIds = rows.stream().map(Enrollment::getCourseId).toList();
        Map<Long, Course> byId = courses.findAllById(courseIds).stream()
                .collect(Collectors.toMap(Course::getId, Function.identity(), (left, right) -> left));
        List<PracticeCourseDTO> items = new ArrayList<>();
        for (Enrollment row : rows) {
            Course course = byId.get(row.getCourseId());
            if (course == null || course.getDeletedAt() != null) {
                continue;
            }
            Quiz quiz = ensureQuiz(course);
            items.add(toCourseDto(course, row, quiz, account.getId()));
        }
        return items;
    }

    @Transactional
    public PracticeQuizDTO get(String authorization, String slug) {
        Context context = open(authorization, slug);
        List<QuizQuestion> rows = questions.findByQuizIdOrderBySortOrderAscIdAsc(context.quiz.getId());
        if (rows.isEmpty()) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "Khóa học chưa đủ bài giảng để tạo bài tập");
        }
        Map<Long, List<QuizOption>> grouped = optionsByQuestion(rows);
        List<PracticeQuestionDTO> items = new ArrayList<>();
        for (QuizQuestion row : rows) {
            List<PracticeOptionDTO> choices = grouped.getOrDefault(row.getId(), List.of()).stream()
                    .map(choice -> new PracticeOptionDTO(choice.getId(), choice.getOptionText()))
                    .toList();
            items.add(new PracticeQuestionDTO(row.getId(), row.getQuestion(), choices));
        }
        QuizAttempt best = attempts
                .findTopByQuizIdAndUserIdAndSubmittedAtIsNotNullOrderByScoreDescIdDesc(
                        context.quiz.getId(),
                        context.account.getId())
                .orElse(null);
        BigDecimal bestScore = best == null ? BigDecimal.ZERO : best.getScore();
        String gradeLabel = best == null ? "" : CertificateGrades.label(CertificateGrades.of(bestScore));
        return new PracticeQuizDTO(
                context.quiz.getId(),
                context.course.getId(),
                context.quiz.getTitle(),
                context.quiz.getDescription(),
                context.course.getTitle(),
                context.course.getSlug(),
                context.course.getImages(),
                context.quiz.getPassScore() == null ? 50 : context.quiz.getPassScore(),
                items.size(),
                bestScore,
                gradeLabel,
                items);
    }

    @Transactional
    public PracticeResultDTO submit(String authorization, String slug, PracticeSubmitRequest request) {
        Context context = open(authorization, slug);
        List<QuizQuestion> rows = questions.findByQuizIdOrderBySortOrderAscIdAsc(context.quiz.getId());
        if (rows.isEmpty()) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "Khóa học chưa đủ bài giảng để tạo bài tập");
        }
        Map<Long, List<QuizOption>> grouped = optionsByQuestion(rows);
        Map<Long, Long> picked = new HashMap<>();
        if (request != null && request.getAnswers() != null) {
            for (PracticeAnswerRequest answer : request.getAnswers()) {
                if (answer != null && answer.getQuestionId() != null) {
                    picked.put(answer.getQuestionId(), answer.getOptionId());
                }
            }
        }
        int earned = 0;
        int total = 0;
        int correctCount = 0;
        QuizAttempt attempt = new QuizAttempt();
        attempt.setQuizId(context.quiz.getId());
        attempt.setUserId(context.account.getId());
        attempt.setEnrollmentId(context.enrollment.getId());
        attempt.setStartedAt(LocalDateTime.now());
        attempt.setSubmittedAt(LocalDateTime.now());
        QuizAttempt saved = attempts.save(attempt);
        List<QuizAttemptAnswer> stored = new ArrayList<>();
        List<PracticeQuestionDTO> review = new ArrayList<>();
        for (QuizQuestion row : rows) {
            int points = row.getPoints() == null ? 1 : row.getPoints();
            total += points;
            List<QuizOption> choices = grouped.getOrDefault(row.getId(), List.of());
            Long chosen = picked.get(row.getId());
            QuizOption match = choices.stream()
                    .filter(choice -> chosen != null && chosen.equals(choice.getId()))
                    .findFirst()
                    .orElse(null);
            boolean right = match != null && Boolean.TRUE.equals(match.getCorrect());
            if (right) {
                earned += points;
                correctCount += 1;
            }
            QuizAttemptAnswer line = new QuizAttemptAnswer();
            line.setAttemptId(saved.getId());
            line.setQuestionId(row.getId());
            line.setOptionId(chosen);
            line.setCorrect(right);
            stored.add(line);
            List<PracticeOptionDTO> optionDtos = choices.stream()
                    .map(choice -> new PracticeOptionDTO(
                            choice.getId(),
                            choice.getOptionText(),
                            Boolean.TRUE.equals(choice.getCorrect())))
                    .toList();
            review.add(new PracticeQuestionDTO(row.getId(), row.getQuestion(), optionDtos, chosen, right));
        }
        attemptAnswers.saveAll(stored);
        BigDecimal score = total == 0
                ? BigDecimal.ZERO
                : BigDecimal.valueOf(earned * 100.0 / total).setScale(2, RoundingMode.HALF_UP);
        int passScore = context.quiz.getPassScore() == null ? 50 : context.quiz.getPassScore();
        boolean passed = score.compareTo(BigDecimal.valueOf(passScore)) >= 0;
        saved.setScore(score);
        saved.setPassed(passed);
        saved.setCorrectCount(correctCount);
        saved.setTotalQuestions(rows.size());
        attempts.save(saved);
        context.enrollment.setUpdatedAt(LocalDateTime.now());
        enrollments.save(context.enrollment);
        String grade = CertificateGrades.of(score);
        String courseTitle = context.course.getTitle();
        Long userId = context.account.getId();
        Long attemptId = saved.getId();
        int storedCorrect = correctCount;
        int storedTotal = rows.size();
        afterCommit(() -> notificationQueue.enqueue(new NotificationJob(
                userId,
                "Đã lưu kết quả bài tập",
                "Bạn đạt " + score.stripTrailingZeros().toPlainString() + " điểm ("
                        + storedCorrect + "/" + storedTotal + ") khóa \"" + courseTitle
                        + "\". Kết quả đã được ghi vào lịch sử học tập.",
                "PRACTICE",
                "PRACTICE",
                attemptId)));
        return new PracticeResultDTO(
                saved.getId(),
                context.course.getId(),
                score,
                passed,
                grade,
                CertificateGrades.label(grade),
                correctCount,
                rows.size(),
                review);
    }

    @Transactional(readOnly = true)
    public List<PracticeHistoryDTO> history(String authorization) {
        user account = userServices.requireAccount(authorization);
        List<QuizAttempt> rows = attempts.findByUserIdAndSubmittedAtIsNotNullOrderBySubmittedAtDesc(account.getId());
        if (rows.isEmpty()) {
            return List.of();
        }
        List<Long> quizIds = rows.stream().map(QuizAttempt::getQuizId).distinct().toList();
        Map<Long, Quiz> quizMap = quizzes.findAllById(quizIds).stream()
                .collect(Collectors.toMap(Quiz::getId, Function.identity(), (left, right) -> left));
        List<Long> lessonIds = quizMap.values().stream().map(Quiz::getLessonId).distinct().toList();
        Map<Long, Course> courseByLesson = new HashMap<>();
        if (!lessonIds.isEmpty()) {
            for (Lesson lesson : lessons.findWithCourseByIdIn(lessonIds)) {
                if (lesson.getSection() != null && lesson.getSection().getCourse() != null) {
                    courseByLesson.put(lesson.getId(), lesson.getSection().getCourse());
                }
            }
        }
        List<PracticeHistoryDTO> items = new ArrayList<>();
        for (QuizAttempt row : rows) {
            Quiz quiz = quizMap.get(row.getQuizId());
            Course course = quiz == null ? null : courseByLesson.get(quiz.getLessonId());
            if (course == null || course.getDeletedAt() != null) {
                continue;
            }
            BigDecimal score = row.getScore() == null ? BigDecimal.ZERO : row.getScore();
            String grade = CertificateGrades.of(score);
            int total = row.getTotalQuestions() == null ? 0 : row.getTotalQuestions();
            int correct = row.getCorrectCount() == null ? 0 : row.getCorrectCount();
            items.add(new PracticeHistoryDTO(
                    row.getId(),
                    course.getId(),
                    course.getSlug(),
                    course.getTitle(),
                    course.getImages(),
                    score,
                    Boolean.TRUE.equals(row.getPassed()),
                    grade,
                    CertificateGrades.label(grade),
                    correct,
                    total,
                    row.getSubmittedAt()));
        }
        return items;
    }

    private Context open(String authorization, String slug) {
        user account = userServices.requireAccount(authorization);
        Course course = courses.findBySlugAndDeletedAtIsNull(slug)
                .orElseThrow(() -> new AuthException(HttpStatus.NOT_FOUND, "Không tìm thấy khóa học"));
        Enrollment enrollment = enrollments.findByUserIdAndCourseId(account.getId(), course.getId())
                .orElseThrow(() -> new AuthException(HttpStatus.FORBIDDEN, "Bạn chưa sở hữu khóa học này"));
        Quiz quiz = ensureQuiz(course);
        if (quiz == null) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "Khóa học chưa đủ bài giảng để tạo bài tập");
        }
        return new Context(account, course, enrollment, quiz);
    }

    private Quiz ensureQuiz(Course course) {
        Lesson host = lessons.findByCourseIdAndSlug(course.getId(), PRACTICE_SLUG).stream().findFirst().orElse(null);
        if (host == null) {
            List<CourseSection> courseSections = sections.findByCourseIdOrderBySortOrderAscIdAsc(course.getId());
            if (courseSections.isEmpty()) {
                return null;
            }
            CourseSection last = courseSections.get(courseSections.size() - 1);
            host = new Lesson();
            host.setSection(last);
            host.setTitle("Bài tập đánh giá năng lực");
            host.setSlug(PRACTICE_SLUG);
            host.setLessonType("QUIZ");
            host.setContent("Quiz đánh giá năng lực theo bài giảng khóa học");
            host.setDurationSeconds(0);
            host.setSortOrder(lessons.maxSortOrder(last.getId()) + 1);
            host.setIsPreview(0);
            host.setIsPublished(0);
            host = lessons.save(host);
        }
        Quiz quiz = quizzes.findByLessonId(host.getId()).orElse(null);
        if (quiz == null) {
            quiz = new Quiz();
            quiz.setLessonId(host.getId());
            quiz.setTitle("Đánh giá năng lực: " + course.getTitle());
            quiz.setDescription(QUIZ_MARK + " Trắc nghiệm theo bài giảng lập trình. Đạt từ 50 điểm.");
            quiz.setPassScore(50);
            quiz.setMaxAttempts(0);
            quiz = quizzes.save(quiz);
        }
        String description = quiz.getDescription() == null ? "" : quiz.getDescription();
        if (!description.startsWith(QUIZ_MARK) || questions.countByQuizId(quiz.getId()) < MIN_QUESTIONS) {
            rebuildQuestions(course, quiz);
        }
        return quiz;
    }

    private void rebuildQuestions(Course course, Quiz quiz) {
        List<QuizQuestion> existing = questions.findByQuizIdOrderBySortOrderAscIdAsc(quiz.getId());
        if (!existing.isEmpty()) {
            List<Long> questionIds = existing.stream().map(QuizQuestion::getId).toList();
            attemptAnswers.deleteByQuestionIdIn(questionIds);
            attemptAnswers.flush();
            options.deleteByQuestionIdIn(questionIds);
            options.flush();
            questions.deleteByQuizId(quiz.getId());
            questions.flush();
        }
        fillQuestions(course, quiz);
        quiz.setDescription(QUIZ_MARK + " Trắc nghiệm theo bài giảng lập trình và giáo dục. Đạt từ 50 điểm.");
        quizzes.save(quiz);
    }

    private void fillQuestions(Course course, Quiz quiz) {
        List<Lesson> videos = lessons.findPublishedVideosByCourseId(course.getId()).stream()
                .filter(item -> usable(cleanTitle(item.getTitle())))
                .toList();
        if (videos.isEmpty()) {
            return;
        }
        Random random = new Random(course.getId() + 3);
        List<Draft> drafts = new ArrayList<>();
        Set<String> seen = new HashSet<>();
        List<String> lessonTitles = videos.stream()
                .map(item -> cleanTitle(item.getTitle()))
                .filter(this::usable)
                .toList();
        PracticeTopics.Topic courseTopic = PracticeTopics.detect(course.getTitle() + " " + String.join(" ", lessonTitles));
        List<String> sectionsUsed = videos.stream()
                .map(item -> item.getSection() == null ? "" : item.getSection().getTitle())
                .filter(this::usable)
                .filter(item -> !norm(item).equals(norm(course.getTitle())))
                .distinct()
                .toList();
        for (int index = 0; index < videos.size(); index++) {
            Lesson lesson = videos.get(index);
            String title = shortTitle(cleanTitle(lesson.getTitle()));
            PracticeTopics.Topic topic = PracticeTopics.detect(cleanTitle(lesson.getTitle()));
            if (topic == null) {
                topic = courseTopic;
            }
            if (topic != null) {
                push(drafts, seen, choice(
                        "Bài giảng \"" + title + "\" thuộc chủ đề nào?",
                        topic.label,
                        PracticeTopics.otherLabels(topic.label, 6),
                        random));
                push(drafts, seen, choice(
                        "Công nghệ chính được đề cập trong bài \"" + title + "\" là gì?",
                        topic.label,
                        PracticeTopics.otherLabels(topic.label, 6),
                        random));
                push(drafts, seen, trueFalse(
                        "Bài \"" + title + "\" liên quan đến " + topic.label + ".",
                        true,
                        random));
                for (PracticeTopics.Fact fact : topic.facts) {
                    push(drafts, seen, choice(fact.question, fact.correct, fact.wrongs, random));
                }
            }
            List<String> others = othersFrom(lessonTitles, title, 3, random);
            if (!others.isEmpty()) {
                push(drafts, seen, choice(
                        "Bài nào sau đây có trong khóa học này?",
                        title,
                        others,
                        random));
            }
            String sectionTitle = lesson.getSection() == null ? "" : lesson.getSection().getTitle();
            if (sectionsUsed.size() >= 2 && usable(sectionTitle) && !norm(sectionTitle).equals(norm(course.getTitle()))) {
                push(drafts, seen, choice(
                        "Bài \"" + title + "\" thuộc phần học nào?",
                        sectionTitle,
                        sectionsUsed.stream().filter(item -> !norm(item).equals(norm(sectionTitle))).limit(3).toList(),
                        random));
            }
            if (index + 3 < videos.size()) {
                push(drafts, seen, choice(
                        "Theo lộ trình, bài nào nên học trước?",
                        title,
                        List.of(shortTitle(cleanTitle(videos.get(index + 3).getTitle()))),
                        random));
            }
        }
        if (courseTopic != null) {
            push(drafts, seen, choice(
                    "Khóa học \"" + course.getTitle() + "\" nghiêng về nhóm kiến thức nào?",
                    PracticeTopics.fieldLabel(),
                    PracticeTopics.otherFields(),
                    random));
            push(drafts, seen, choice(
                    "Chủ đề xuyên suốt khóa học này là gì?",
                    courseTopic.label,
                    PracticeTopics.otherLabels(courseTopic.label, 6),
                    random));
        }
        for (PracticeTopics.Fact fact : PracticeTopics.bank()) {
            push(drafts, seen, choice(fact.question, fact.correct, fact.wrongs, random));
        }
        push(drafts, seen, trueFalse("Khóa học này thuộc lĩnh vực lập trình và giáo dục công nghệ.", true, random));
        push(drafts, seen, trueFalse("Khi học khóa này, bạn nên vừa xem bài giảng vừa thực hành lại phần code.", true, random));
        push(drafts, seen, trueFalse("Có thể bỏ qua toàn bộ bài giảng mà vẫn nắm vững nội dung khóa.", false, random));
        if (drafts.size() < MIN_QUESTIONS) {
            for (PracticeTopics.Fact fact : PracticeTopics.bank()) {
                push(drafts, seen, choice(
                        "Áp dụng cho khóa \"" + course.getTitle() + "\": " + fact.question,
                        fact.correct,
                        fact.wrongs,
                        random));
                if (drafts.size() >= MIN_QUESTIONS) {
                    break;
                }
            }
        }
        int extra = 0;
        while (drafts.size() < MIN_QUESTIONS && extra < videos.size() * 4) {
            Lesson lesson = videos.get(extra % videos.size());
            String title = shortTitle(cleanTitle(lesson.getTitle()));
            push(drafts, seen, trueFalse(
                    "Học viên nên xem bài \"" + title + "\" khi ôn tập khóa này.",
                    true,
                    random));
            extra += 1;
        }
        List<Draft> picked = new ArrayList<>(drafts);
        Collections.shuffle(picked, random);
        int limit = Math.max(MIN_QUESTIONS, Math.min(MAX_QUESTIONS, picked.size()));
        if (picked.size() > limit) {
            picked = new ArrayList<>(picked.subList(0, limit));
        }
        if (picked.isEmpty()) {
            return;
        }
        int order = 0;
        List<QuizOption> rows = new ArrayList<>();
        for (Draft draft : picked) {
            QuizQuestion question = new QuizQuestion();
            question.setQuizId(quiz.getId());
            question.setQuestion(draft.prompt);
            question.setQuestionType("SINGLE_CHOICE");
            question.setPoints(1);
            question.setSortOrder(order++);
            QuizQuestion saved = questions.save(question);
            int optionOrder = 0;
            for (DraftOption option : draft.options) {
                QuizOption row = new QuizOption();
                row.setQuestionId(saved.getId());
                row.setOptionText(option.text);
                row.setCorrect(option.correct);
                row.setSortOrder(optionOrder++);
                rows.add(row);
            }
        }
        options.saveAll(rows);
    }

    private void push(List<Draft> drafts, Set<String> seen, Draft draft) {
        if (draft == null || draft.options.size() < 2) {
            return;
        }
        String key = norm(draft.prompt);
        if (key.isBlank() || !seen.add(key)) {
            return;
        }
        drafts.add(draft);
    }

    private List<String> othersFrom(List<String> titles, String correct, int need, Random random) {
        List<String> pool = new ArrayList<>();
        for (String title : titles) {
            if (!norm(title).equals(norm(correct))) {
                pool.add(shortTitle(title));
            }
        }
        Collections.shuffle(pool, random);
        if (pool.size() <= need) {
            return pool;
        }
        return new ArrayList<>(pool.subList(0, need));
    }

    private Draft trueFalse(String prompt, boolean yes, Random random) {
        List<DraftOption> options = new ArrayList<>();
        options.add(new DraftOption("Đúng", yes));
        options.add(new DraftOption("Sai", !yes));
        Collections.shuffle(options, random);
        return new Draft(prompt, options);
    }

    private Draft choice(String prompt, String correct, List<String> wrongs, Random random) {
        List<DraftOption> options = new ArrayList<>();
        if (!usable(correct)) {
            return new Draft(prompt, List.of());
        }
        options.add(new DraftOption(correct, true));
        Set<String> seen = new HashSet<>();
        seen.add(norm(correct));
        List<String> pool = new ArrayList<>();
        if (wrongs != null) {
            pool.addAll(wrongs);
        }
        pool.addAll(PracticeTopics.LABELS);
        Collections.shuffle(pool, random);
        for (String wrong : pool) {
            if (!usable(wrong) || !seen.add(norm(wrong))) {
                continue;
            }
            options.add(new DraftOption(wrong, false));
            if (options.size() >= 4) {
                break;
            }
        }
        Collections.shuffle(options, random);
        return new Draft(prompt, options);
    }

    private boolean usable(String text) {
        if (text == null) {
            return false;
        }
        String value = text.trim();
        if (value.length() < 3 || value.length() > 180) {
            return false;
        }
        if (value.matches("^[A-Za-z0-9+/=_-]{16,}$")) {
            return false;
        }
        long letters = value.chars().filter(Character::isLetter).count();
        return letters >= 3;
    }

    private PracticeCourseDTO toCourseDto(Course course, Enrollment enrollment, Quiz quiz, Long userId) {
        int questionCount = quiz == null ? 0 : (int) questions.countByQuizId(quiz.getId());
        QuizAttempt best = quiz == null
                ? null
                : attempts.findTopByQuizIdAndUserIdAndSubmittedAtIsNotNullOrderByScoreDescIdDesc(quiz.getId(), userId)
                        .orElse(null);
        int attemptCount = quiz == null
                ? 0
                : (int) attempts.countByQuizIdAndUserIdAndSubmittedAtIsNotNull(quiz.getId(), userId);
        BigDecimal bestScore = best == null || best.getScore() == null ? BigDecimal.ZERO : best.getScore();
        String grade = best == null ? "" : CertificateGrades.of(bestScore);
        return new PracticeCourseDTO(
                course.getId(),
                course.getTitle(),
                course.getSlug(),
                course.getImages(),
                teacher(course),
                enrollment.getProgressPercent(),
                questionCount,
                attemptCount,
                bestScore,
                best != null && Boolean.TRUE.equals(best.getPassed()),
                grade,
                grade.isBlank() ? "" : CertificateGrades.label(grade),
                questionCount > 0);
    }

    private Map<Long, List<QuizOption>> optionsByQuestion(List<QuizQuestion> rows) {
        List<Long> ids = rows.stream().map(QuizQuestion::getId).toList();
        if (ids.isEmpty()) {
            return Map.of();
        }
        return options.findByQuestionIdInOrderBySortOrderAscIdAsc(ids).stream()
                .collect(Collectors.groupingBy(QuizOption::getQuestionId, LinkedHashMap::new, Collectors.toList()));
    }

    private String teacher(Course course) {
        return course == null ? "LearnHub" : course.displayInstructorName();
    }

    private String cleanTitle(String title) {
        if (title == null) {
            return "";
        }
        return title.replaceFirst("^\\s*\\d+\\s*", "").trim();
    }

    private String shortTitle(String title) {
        String value = title == null ? "" : title.trim();
        if (value.length() <= 72) {
            return value;
        }
        return value.substring(0, 69).trim() + "...";
    }

    private String norm(String value) {
        return value == null ? "" : value.trim().toLowerCase();
    }

    private void afterCommit(Runnable action) {
        if (!TransactionSynchronizationManager.isSynchronizationActive()) {
            action.run();
            return;
        }
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                action.run();
            }
        });
    }

    private record Context(user account, Course course, Enrollment enrollment, Quiz quiz) {
    }

    private record Draft(String prompt, List<DraftOption> options) {
    }

    private record DraftOption(String text, boolean correct) {
    }
}
