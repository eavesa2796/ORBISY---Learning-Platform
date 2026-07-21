"use client";

import { useMemo } from "react";

const studyPlan = [
  "JSX rules and rendering flow",
  "State updates and one-way data flow",
  "useEffect dependencies and cleanup",
  "Props, lifting state, and composition",
  "Event handling and forms",
];

export default function BackendStatus() {
  const focus = useMemo(() => studyPlan[0], []);

  return <p className="status status-ok">Current React Focus: {focus}</p>;
}
