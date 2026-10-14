export const TEACH_START_KEY = "learnhub.teachStart"
export const INSTRUCTOR_STUDIO = "/giang-day/quan-tri"

export function answersToPayload(answers = {}) {
  const teachingFormat = answers["hinh-thuc"] || ""
  const recordingExperience = answers["ghi-hinh"] || ""
  const audienceSize = answers["tiep-can"] || ""
  const payload = {}
  if (teachingFormat) {
    payload.teachingFormat = teachingFormat
  }
  if (recordingExperience) {
    payload.recordingExperience = recordingExperience
  }
  if (audienceSize) {
    payload.audienceSize = audienceSize
  }
  return payload
}

export function payloadToAnswers(data) {
  const answers = {}
  if (data?.teachingFormat) {
    answers["hinh-thuc"] = data.teachingFormat
  }
  if (data?.recordingExperience) {
    answers["ghi-hinh"] = data.recordingExperience
  }
  if (data?.audienceSize) {
    answers["tiep-can"] = data.audienceSize
  }
  return answers
}

export function isTeachStartComplete(answers = {}) {
  return Boolean(answers["hinh-thuc"] && answers["ghi-hinh"] && answers["tiep-can"])
}

export function readTeachStartState() {
  try {
    const raw = sessionStorage.getItem(TEACH_START_KEY)
    if (!raw) {
      return { step: 0, answers: {} }
    }
    const parsed = JSON.parse(raw)
    return {
      step: Number.isInteger(parsed.step) ? parsed.step : 0,
      answers:
        parsed.answers && typeof parsed.answers === "object" ? parsed.answers : {},
    }
  } catch {
    return { step: 0, answers: {} }
  }
}

export function persistTeachStart(step, answers) {
  sessionStorage.setItem(
    TEACH_START_KEY,
    JSON.stringify({ step, answers: answers || {} }),
  )
}

export function readTeachStartAnswers() {
  const payload = answersToPayload(readTeachStartState().answers)
  if (!payload.teachingFormat || !payload.recordingExperience || !payload.audienceSize) {
    return null
  }
  return payload
}

export function readTeachStartPayload() {
  const payload = answersToPayload(readTeachStartState().answers)
  return Object.keys(payload).length ? payload : null
}

export function clearTeachStart() {
  sessionStorage.removeItem(TEACH_START_KEY)
}

export function fromTeachFlow() {
  return new URLSearchParams(window.location.search).get("from") === "teach"
}

export function onboardingTrack(answers = {}) {
  const teaching = answers["hinh-thuc"] || ""
  const recording = answers["ghi-hinh"] || ""
  if (recording === "da-dang-video" || recording === "da-quay-nhieu") {
    return "upload"
  }
  if (teaching === "chua-tung-day" || recording === "moi-bat-dau") {
    return "starter"
  }
  if (teaching === "truc-tuyen") {
    return "online"
  }
  return "transfer"
}

export function planItems(answers = {}) {
  const track = onboardingTrack(answers)
  const audience = answers["tiep-can"] || ""
  const items = {
    starter: [
      {
        title: "Khóa học ngắn, một kỹ năng",
        text: "Bắt đầu với 20–40 phút. Mỗi bài một việc học viên làm được ngay.",
      },
      {
        title: "Quay bằng điện thoại",
        text: "Ánh sáng cửa sổ, mic gần miệng, quay từng mục 3–8 phút.",
      },
      {
        title: "Checklist bài đầu",
        text: "Tiêu đề rõ kết quả, 4–8 bài, không cần studio hay kịch bản dài.",
      },
    ],
    transfer: [
      {
        title: "Tách buổi dạy thành bài video",
        text: "Lấy giáo án cũ: mỗi mục thành một bài, cắt phần lý thuyết dài.",
      },
      {
        title: "Ghi hình như đang dạy một người",
        text: "Nói trực tiếp vào camera, giữ nhịp lớp thật, rồi cắt đoạn thừa.",
      },
      {
        title: "Giữ chuyên môn, gói gọn hơn",
        text: "Học viên online cần kết quả cụ thể, không phải nguyên giáo trình.",
      },
    ],
    online: [
      {
        title: "Gói lại bài bạn đã dạy online",
        text: "Chọn chuỗi bài hay nhất, chuẩn hóa âm thanh rồi đăng từng bài.",
      },
      {
        title: "Làm rõ học viên sẽ làm được gì",
        text: "Tiêu đề và mô tả theo kết quả, không theo số buổi hay công cụ.",
      },
      {
        title: "Xuất bản bản nháp trước",
        text: "Đăng 2–3 bài đầu để kiểm tra luồng học, rồi bổ sung phần còn lại.",
      },
    ],
    upload: [
      {
        title: "Tải video có sẵn",
        text: "Cắt thành bài ngắn, bỏ đoạn chào/kết dài, giữ đúng một kỹ năng.",
      },
      {
        title: "Tiêu đề theo nhu cầu học viên",
        text: "Viết như học viên đang tìm: làm được việc X trong Y phút.",
      },
      {
        title: "Kiểm tra âm thanh rồi xuất bản",
        text: "Giọng rõ, không vọng. Thumbnail và mô tả xong là mở bán được.",
      },
    ],
  }[track]

  if (audience === "cong-dong-lon") {
    return [
      ...items.slice(0, 2),
      {
        title: "Đưa cộng đồng vào khóa học",
        text: "Gửi link khai giảng cho nhóm đang theo dõi bạn. Họ là học viên đầu.",
      },
    ]
  }
  if (audience === "chua-co") {
    return [
      ...items.slice(0, 2),
      {
        title: "LearnHub phân phối giúp bạn",
        text: "Chọn chủ đề người học đang tìm. Nền tảng đưa khóa học ra danh mục.",
      },
    ]
  }
  return items
}

export function studioHint(onboarding) {
  const answers = payloadToAnswers(onboarding || {})
  const track = onboardingTrack(answers)
  if (!answers["hinh-thuc"]) {
    return "Từ câu trả lời của bạn, hãy chọn một kỹ năng cụ thể. Học viên tìm người giúp họ làm được việc — không phải giáo trình dài."
  }
  if (track === "upload") {
    return "Bạn đã có video. Tạo khóa học, tải từng bài và viết tiêu đề theo việc học viên sẽ làm được."
  }
  if (track === "online") {
    return "Gói lại bài bạn đã dạy online thành khóa ngắn. Bắt đầu bằng 2–3 bài rõ kết quả."
  }
  if (track === "transfer") {
    return "Tách một buổi dạy trực tiếp thành vài bài video. Mỗi bài một mục, học viên làm được ngay."
  }
  return "Bắt đầu khóa học ngắn 20–40 phút. Quay bằng điện thoại cũng được — một kỹ năng, vài bài rõ ràng."
}
