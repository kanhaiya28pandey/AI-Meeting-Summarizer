export type MeetingStatus =
  | "UPLOADED"
  | "TRANSCRIBING"
  | "ANALYZING"
  | "SAVING"
  | "COMPLETED"
  | "FAILED";

export interface ActionItem {
  task: string;
  owner: string | null;
  deadline: string | null;
}

export interface TranscriptSegment {
  speaker?: string | null;
  text: string;
  startTime?: number | null;
  endTime?: number | null;
}

export interface Meeting {
  id: string;
  title: string;
  originalFileName: string;
  fileType: string;
  duration: number | null;
  transcript: string | null;
  summary: string | null;
  keyDecisions: string[];
  actionItems: ActionItem[];
  status: MeetingStatus;
  createdAt: string;
  updatedAt: string;
}
