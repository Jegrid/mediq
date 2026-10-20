import tones from "./styles/tones.module.css";

export const severityTone = {
  low: "success",
  moderate: "warning",
  high: "high",
  critical: "danger",
};

export const caseStatusTone = {
  open: "neutral",
  in_review: "info",
  resolved: "success",
  referred: "referred",
};

export const decisionTone = {
  confirm_ai: "success",
  override: "info",
};

export const roleTone = {
  patient: "info",
  clinician: "success",
  supervisor: "warning",
};

export const submissionTone = (status) =>
  status === "predicted" ? "success" : "warning";

export const redFlagTone = (severity) =>
  severity === "emergency" ? "danger" : "urgent";

export function tone(name, fallback = "neutral") {
  return tones[name] || tones[fallback];
}
