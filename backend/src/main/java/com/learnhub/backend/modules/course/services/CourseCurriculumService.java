package com.learnhub.backend.modules.course.services;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.learnhub.backend.modules.course.dtos.CourseSectionDTO;
import com.learnhub.backend.modules.course.dtos.LessonDTO;
import com.learnhub.backend.modules.course.dtos.LessonRequest;
import com.learnhub.backend.modules.course.dtos.SectionRequest;
import com.learnhub.backend.modules.course.models.CourseSection;
import com.learnhub.backend.modules.course.models.Lesson;
import com.learnhub.backend.modules.course.models.MediaAsset;
import com.learnhub.backend.modules.course.repositories.CourseSectionRepository;
import com.learnhub.backend.modules.course.repositories.LessonRepository;
import com.learnhub.backend.modules.course.repositories.MediaAssetRepository;
import com.learnhub.backend.modules.course.support.SlugUtils;
import com.learnhub.backend.modules.instructor.models.Course;
import com.learnhub.backend.modules.instructor.repositories.CourseRepository;
import com.learnhub.backend.modules.user.dtos.userDTO;
import com.learnhub.backend.modules.user.exceptions.AuthException;
import com.learnhub.backend.modules.user.services.interfaces.UserServicesInterfaces;

@Service
public class CourseCurriculumService {
    private final CourseRepository courses;
    private final CourseSectionRepository sections;
    private final LessonRepository lessons;
    private final MediaAssetRepository mediaAssets;
    private final CourseVideoStorage videos;
    private final UserServicesInterfaces userServices;

    public CourseCurriculumService(
            CourseRepository courses,
            CourseSectionRepository sections,
            LessonRepository lessons,
            MediaAssetRepository mediaAssets,
            CourseVideoStorage videos,
            UserServicesInterfaces userServices) {
        this.courses = courses;
        this.sections = sections;
        this.lessons = lessons;
        this.mediaAssets = mediaAssets;
        this.videos = videos;
        this.userServices = userServices;
    }

    @Transactional(readOnly = true)
    public List<CourseSectionDTO> listPublic(Long courseId) {
        return list(courseId, false);
    }

    @Transactional(readOnly = true)
    public List<CourseSectionDTO> listAdmin(String authorization, Long courseId) {
        userServices.requireAdmin(authorization);
        requireCourse(courseId);
        return list(courseId, true);
    }

    @Transactional
    public CourseSectionDTO createSection(String authorization, Long courseId, SectionRequest request) {
        userServices.requireAdmin(authorization);
        Course course = requireCourse(courseId);
        String title = requireTitle(request == null ? null : request.getTitle());
        CourseSection section = new CourseSection();
        section.setCourse(course);
        section.setTitle(title);
        section.setDescription(trimToNull(request == null ? null : request.getDescription(), 1000));
        section.setSortOrder(sections.maxSortOrder(courseId) + 1);
        sections.saveAndFlush(section);
        return toSectionDto(section, List.of());
    }

    @Transactional
    public CourseSectionDTO updateSection(String authorization, Long courseId, Long sectionId, SectionRequest request) {
        userServices.requireAdmin(authorization);
        CourseSection section = requireSection(courseId, sectionId);
        if (request != null && request.getTitle() != null) {
            section.setTitle(requireTitle(request.getTitle()));
        }
        if (request != null && request.getDescription() != null) {
            section.setDescription(trimToNull(request.getDescription(), 1000));
        }
        sections.saveAndFlush(section);
        return toSectionDto(section, lessons.findBySectionIdOrderBySortOrderAscIdAsc(section.getId()));
    }

    @Transactional
    public void deleteSection(String authorization, Long courseId, Long sectionId) {
        userServices.requireAdmin(authorization);
        CourseSection section = requireSection(courseId, sectionId);
        List<Lesson> items = lessons.findBySectionIdOrderBySortOrderAscIdAsc(sectionId);
        for (Lesson lesson : items) {
            detachMedia(lesson);
        }
        lessons.deleteAll(items);
        sections.delete(section);
        resequenceSections(courseId);
        refreshDuration(courseId);
    }

    @Transactional
    public List<CourseSectionDTO> moveSection(String authorization, Long courseId, Long sectionId, String direction) {
        userServices.requireAdmin(authorization);
        requireSection(courseId, sectionId);
        List<CourseSection> items = new ArrayList<>(sections.findByCourseIdOrderBySortOrderAscIdAsc(courseId));
        int index = indexOfSection(items, sectionId);
        int target = "up".equalsIgnoreCase(direction) ? index - 1 : index + 1;
        if (target < 0 || target >= items.size()) {
            return list(courseId, true);
        }
        CourseSection current = items.get(index);
        CourseSection other = items.get(target);
        int currentOrder = current.getSortOrder();
        current.setSortOrder(other.getSortOrder());
        other.setSortOrder(currentOrder);
        sections.saveAll(List.of(current, other));
        resequenceSections(courseId);
        return list(courseId, true);
    }

    @Transactional
    public LessonDTO createLesson(String authorization, Long courseId, Long sectionId, LessonRequest request) {
        userDTO admin = requireAdmin(authorization);
        CourseSection section = requireSection(courseId, sectionId);
        String title = requireTitle(request == null ? null : request.getTitle());
        String videoUrl = request == null ? null : trimToNull(request.getVideoUrl(), 1000);
        if (videoUrl == null) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "Vui lòng tải video bài giảng", "videoUrl");
        }
        Lesson lesson = new Lesson();
        lesson.setSection(section);
        lesson.setTitle(title);
        lesson.setSlug(uniqueLessonSlug(sectionId, title, null));
        lesson.setLessonType("VIDEO");
        lesson.setDurationSeconds(safeDuration(request == null ? null : request.getDurationSeconds()));
        lesson.setSortOrder(lessons.maxSortOrder(sectionId) + 1);
        lesson.setIsPreview(flag(request == null ? null : request.getIsPreview(), 0));
        lesson.setIsPublished(flag(request == null ? null : request.getIsPublished(), 1));
        lesson.setMedia(createMedia(admin.getId(), request, videoUrl, lesson.getDurationSeconds()));
        lessons.saveAndFlush(lesson);
        refreshDuration(courseId);
        return toLessonDto(lesson, true);
    }

    @Transactional
    public LessonDTO updateLesson(
            String authorization,
            Long courseId,
            Long sectionId,
            Long lessonId,
            LessonRequest request) {
        userDTO admin = requireAdmin(authorization);
        requireSection(courseId, sectionId);
        Lesson lesson = requireLesson(sectionId, lessonId);
        if (request != null && request.getTitle() != null) {
            lesson.setTitle(requireTitle(request.getTitle()));
            lesson.setSlug(uniqueLessonSlug(sectionId, lesson.getTitle(), lesson.getId()));
        }
        if (request != null && request.getDurationSeconds() != null) {
            lesson.setDurationSeconds(safeDuration(request.getDurationSeconds()));
        }
        if (request != null && request.getIsPreview() != null) {
            lesson.setIsPreview(flag(request.getIsPreview(), 0));
        }
        if (request != null && request.getIsPublished() != null) {
            lesson.setIsPublished(flag(request.getIsPublished(), 1));
        }
        String videoUrl = request == null ? null : trimToNull(request.getVideoUrl(), 1000);
        if (videoUrl != null) {
            detachMedia(lesson);
            lesson.setMedia(createMedia(
                    admin.getId(),
                    request,
                    videoUrl,
                    lesson.getDurationSeconds()));
        }
        lessons.saveAndFlush(lesson);
        refreshDuration(courseId);
        return toLessonDto(lesson, true);
    }

    @Transactional
    public void deleteLesson(String authorization, Long courseId, Long sectionId, Long lessonId) {
        userServices.requireAdmin(authorization);
        requireSection(courseId, sectionId);
        Lesson lesson = requireLesson(sectionId, lessonId);
        detachMedia(lesson);
        lessons.delete(lesson);
        resequenceLessons(sectionId);
        refreshDuration(courseId);
    }

    @Transactional
    public List<CourseSectionDTO> moveLesson(
            String authorization,
            Long courseId,
            Long sectionId,
            Long lessonId,
            String direction) {
        userServices.requireAdmin(authorization);
        requireSection(courseId, sectionId);
        requireLesson(sectionId, lessonId);
        List<Lesson> items = new ArrayList<>(lessons.findBySectionIdOrderBySortOrderAscIdAsc(sectionId));
        int index = indexOfLesson(items, lessonId);
        int target = "up".equalsIgnoreCase(direction) ? index - 1 : index + 1;
        if (target < 0 || target >= items.size()) {
            return list(courseId, true);
        }
        Lesson current = items.get(index);
        Lesson other = items.get(target);
        int currentOrder = current.getSortOrder();
        current.setSortOrder(other.getSortOrder());
        other.setSortOrder(currentOrder);
        lessons.saveAll(List.of(current, other));
        resequenceLessons(sectionId);
        return list(courseId, true);
    }

    private List<CourseSectionDTO> list(Long courseId, boolean admin) {
        List<CourseSection> items = sections.findByCourseIdOrderBySortOrderAscIdAsc(courseId);
        if (items.isEmpty()) {
            return List.of();
        }
        List<Long> ids = items.stream().map(CourseSection::getId).toList();
        Map<Long, List<Lesson>> grouped = lessons.findBySectionIdInOrderBySortOrderAscIdAsc(ids).stream()
                .collect(Collectors.groupingBy(lesson -> lesson.getSection().getId()));
        List<CourseSectionDTO> result = new ArrayList<>();
        for (CourseSection section : items) {
            List<Lesson> sectionLessons = grouped.getOrDefault(section.getId(), List.of()).stream()
                    .filter(lesson -> admin || on(lesson.getIsPublished()))
                    .sorted(Comparator.comparing(Lesson::getSortOrder).thenComparing(Lesson::getId))
                    .toList();
            result.add(toSectionDto(section, sectionLessons, admin));
        }
        return result;
    }

    private CourseSectionDTO toSectionDto(CourseSection section, List<Lesson> items) {
        return toSectionDto(section, items, true);
    }

    private CourseSectionDTO toSectionDto(CourseSection section, List<Lesson> items, boolean admin) {
        int duration = items.stream().mapToInt(item -> item.getDurationSeconds() == null ? 0 : item.getDurationSeconds()).sum();
        List<LessonDTO> lessonDtos = items.stream().map(item -> toLessonDto(item, admin)).toList();
        return new CourseSectionDTO(
                section.getId(),
                section.getTitle(),
                section.getDescription(),
                section.getSortOrder(),
                lessonDtos.size(),
                duration,
                lessonDtos);
    }

    private LessonDTO toLessonDto(Lesson lesson, boolean admin) {
        String videoUrl = lesson.getMedia() == null ? null : lesson.getMedia().getPublicUrl();
        boolean preview = on(lesson.getIsPreview());
        return new LessonDTO(
                lesson.getId(),
                lesson.getSection().getId(),
                lesson.getTitle(),
                lesson.getSlug(),
                lesson.getLessonType(),
                lesson.getDurationSeconds(),
                lesson.getSortOrder(),
                preview,
                on(lesson.getIsPublished()),
                admin || preview ? videoUrl : null);
    }

    private MediaAsset createMedia(Long uploadedBy, LessonRequest request, String videoUrl, int duration) {
        MediaAsset asset = new MediaAsset();
        asset.setUploadedBy(uploadedBy);
        asset.setProvider("LOCAL");
        asset.setAssetType("VIDEO");
        asset.setOriginalName(request != null && request.getOriginalName() != null && !request.getOriginalName().isBlank()
                ? request.getOriginalName().trim()
                : "bai-giang.mp4");
        asset.setMimeType("video/mp4");
        asset.setSizeBytes(request != null && request.getBytes() != null ? request.getBytes() : 0L);
        asset.setStorageKey(videoUrl);
        asset.setPublicUrl(videoUrl);
        asset.setEncodingStatus("READY");
        asset.setDurationSeconds(duration);
        return mediaAssets.saveAndFlush(asset);
    }

    private void detachMedia(Lesson lesson) {
        MediaAsset asset = lesson.getMedia();
        if (asset == null) {
            return;
        }
        lesson.setMedia(null);
        lessons.saveAndFlush(lesson);
        videos.deleteIfOwned(asset.getPublicUrl());
        mediaAssets.delete(asset);
    }

    private void resequenceSections(Long courseId) {
        List<CourseSection> items = sections.findByCourseIdOrderBySortOrderAscIdAsc(courseId);
        for (int index = 0; index < items.size(); index += 1) {
            items.get(index).setSortOrder(index);
        }
        sections.saveAll(items);
    }

    private void resequenceLessons(Long sectionId) {
        List<Lesson> items = lessons.findBySectionIdOrderBySortOrderAscIdAsc(sectionId);
        for (int index = 0; index < items.size(); index += 1) {
            items.get(index).setSortOrder(index);
        }
        lessons.saveAll(items);
    }

    private void refreshDuration(Long courseId) {
        Course course = requireCourse(courseId);
        int total = lessons.totalDuration(courseId);
        if (total > 0) {
            course.setDurationSeconds(total);
            courses.save(course);
        }
    }

    private Course requireCourse(Long courseId) {
        Course item = courses.findById(courseId)
                .orElseThrow(() -> new AuthException(HttpStatus.NOT_FOUND, "Không tìm thấy khóa học"));
        if (item.getDeletedAt() != null) {
            throw new AuthException(HttpStatus.NOT_FOUND, "Không tìm thấy khóa học");
        }
        return item;
    }

    private CourseSection requireSection(Long courseId, Long sectionId) {
        requireCourse(courseId);
        return sections.findByIdAndCourseId(sectionId, courseId)
                .orElseThrow(() -> new AuthException(HttpStatus.NOT_FOUND, "Không tìm thấy phần học"));
    }

    private Lesson requireLesson(Long sectionId, Long lessonId) {
        return lessons.findByIdAndSectionId(lessonId, sectionId)
                .orElseThrow(() -> new AuthException(HttpStatus.NOT_FOUND, "Không tìm thấy bài giảng"));
    }

    private userDTO requireAdmin(String authorization) {
        return userServices.requireAdmin(authorization);
    }

    private String uniqueLessonSlug(Long sectionId, String title, Long excludeId) {
        String base = SlugUtils.slugify(title, "bai-giang");
        String slug = base;
        int index = 2;
        while (slugTaken(sectionId, slug, excludeId)) {
            slug = base + "-" + index;
            index += 1;
        }
        return slug;
    }

    private boolean slugTaken(Long sectionId, String slug, Long excludeId) {
        if (excludeId == null) {
            return lessons.existsBySlugAndSectionId(slug, sectionId);
        }
        return lessons.existsBySlugAndSectionIdAndIdNot(slug, sectionId, excludeId);
    }

    private String requireTitle(String value) {
        String title = value == null ? "" : value.trim();
        if (title.isEmpty()) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "Vui lòng nhập tiêu đề", "title");
        }
        return title.length() > 255 ? title.substring(0, 255) : title;
    }

    private String trimToNull(String value, int max) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        if (trimmed.isEmpty()) {
            return null;
        }
        return trimmed.length() > max ? trimmed.substring(0, max) : trimmed;
    }

    private int safeDuration(Integer value) {
        if (value == null || value < 0) {
            return 0;
        }
        return value;
    }

    private int flag(Boolean value, int fallback) {
        if (value == null) {
            return fallback;
        }
        return value ? 1 : 0;
    }

    private boolean on(Integer value) {
        return value != null && value != 0;
    }

    private int indexOfSection(List<CourseSection> items, Long sectionId) {
        for (int index = 0; index < items.size(); index += 1) {
            if (sectionId.equals(items.get(index).getId())) {
                return index;
            }
        }
        throw new AuthException(HttpStatus.NOT_FOUND, "Không tìm thấy phần học");
    }

    private int indexOfLesson(List<Lesson> items, Long lessonId) {
        for (int index = 0; index < items.size(); index += 1) {
            if (lessonId.equals(items.get(index).getId())) {
                return index;
            }
        }
        throw new AuthException(HttpStatus.NOT_FOUND, "Không tìm thấy bài giảng");
    }
}
