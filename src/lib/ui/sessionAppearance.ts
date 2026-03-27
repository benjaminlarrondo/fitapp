import type { SessionType } from "@/types/app";

export const sessionTypeLabel: Record<SessionType, string> = {
  crossfit: "CrossFit",
  gym: "Gym",
  recovery: "Recovery",
  rest: "Descanso",
};

export const sessionTypePillTone: Record<SessionType, "crossfit" | "gym" | "recovery" | "rest"> = {
  crossfit: "crossfit",
  gym: "gym",
  recovery: "recovery",
  rest: "rest",
};

export const sessionTypeSurfaceClass: Record<SessionType, string> = {
  crossfit: "bg-crossfit/20 border-crossfit/40",
  gym: "bg-gym/22 border-gym/40",
  recovery: "bg-recovery/24 border-recovery/40",
  rest: "bg-rest/22 border-rest/40",
};

export const sessionTypePanelClass: Record<SessionType, string> = {
  crossfit: "bg-crossfit/28 text-[#5b3f1c]",
  gym: "bg-gym/24 text-[#295d52]",
  recovery: "bg-recovery/30 text-[#4b5e29]",
  rest: "bg-rest/24 text-[#7a4a56]",
};
