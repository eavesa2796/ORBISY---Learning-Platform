"use client";

import { useMemo, useState } from "react";
import InteractiveLesson from "@/components/InteractiveLesson";
import { lessons, type Track } from "@/data/lessons";

const tracks: Array<Track | "All"> = ["All", "React", "Python", "SQL"];

export default function LearningHub() {
  const [track, setTrack] = useState<Track | "All">("All");
  const [lessonId, set