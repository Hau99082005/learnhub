export const TEACH_START_KEY = "learnhub.teachStart"
export const INSTRUCTOR_STUDIO = "/giang-day/quan-tri"

export function readTeachStartAnswers() {
  try {
    const raw = sessionStorage.getItem(TEACH_START_KEY)
    if (!raw) {
      return null
    }
    const parsed = JSON.parse(raw)
    const answers = parsed?.answers || {}
    const teachingFormat = answers["hinh-thuc"] || ""
    const recordingExperience = answers["ghi-hinh"] || ""
    const audienceSize = answers["tiep-can"] || ""
    if (!teachingFormat || !recordingExperience || !audienceSize) {
      return null
    }
    return { teachingFormat, recordingExperience, audienceSize }
  } catch {
    return null
  }
}

export function clearTeachStart() {
  sessionStorage.removeItem(TEACH_START_KEY)
}

export function fromTeachFlow() {
  return new URLSearchParams(window.location.search).get("from") === "teach"
}
