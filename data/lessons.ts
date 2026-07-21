export type Checkpoint = {
  id: string;
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
};

export type Lesson = {
  id: string;
  track: "React" | "Python" | "SQL";
  title: string;
  summary: string;
  estimatedMinutes: number;
  objectives: string[];
  mentalModel: string;
  explanation: string[];
  example: string;
  memorize: string[];
  mistakes: string[];
  checkpoints: Checkpoint[];
  project: {
    title: string;
    brief: string;
    requirements: string[];
    stretch: string;
  };
};

export const lessons: Lesson[] = [
  {
    id: "react-state-mental-model",
    track: "React",
    title: "State, rendering, and the React mental model",
    summary:
      "Learn what React actually does when state changes, why components re-run, and how to update state without creating hidden bugs.",
    estimatedMinutes: 25,
    objectives: [
      "Explain UI as a function of state",
      "Predict when a component renders",
      "Update primitive, object, and array state safely",
      "Choose where state should live",
    ],
    mentalModel:
      "A React component is a function that describes the UI for the current props and state. Updating state asks React to call that function again and reconcile the new result with the previous UI.",
    explanation: [
      "State is a component's memory. Use it only for information that must survive between renders and can change over time.",
      "Calling a state setter schedules a new render. It does not immediately rewrite the variable in the currently running function.",
      "Treat state as immutable. Create a new object or array instead of changing the existing one, so React and your code can reason about what changed.",
      "Keep state as close as possible to the components that use it. Lift it to the nearest shared parent only when multiple children need the same source of truth.",
    ],
    example: `type Todo = { id: number; text: string; done: boolean };

const [todos, setTodos] = useState<Todo[]>([]);

function addTodo(text: string) {
  setTodos(current => [
    ...current,
    { id: Date.now(), text, done: false },
  ]);
}

function toggleTodo(id: number) {
  setTodos(current =>
    current.map(todo =>
      todo.id === id ? { ...todo, done: !todo.done } : todo
    )
  );
}`,
    memorize: [
      "UI = f(props, state)",
      "A state setter schedules a render",
      "Never mutate React state directly",
      "Use functional updates when the next value depends on the previous value",
      "Store the minimum state needed; derive everything else",
    ],
    mistakes: [
      "Calling array.push or changing an object property in state",
      "Copying props into state without a clear reason",
      "Storing values that can be calculated during rendering",
      "Assuming setState changes the current render's variable immediately",
    ],
    checkpoints: [
      {
        id: "render-trigger",
        prompt: "What does calling a state setter primarily do?",
        options: [
          "Directly edits the DOM",
          "Schedules the component to render with new state",
          "Reloads the page",
          "Mutates the current variable immediately",
        ],
        answer: 1,
        explanation:
          "The setter schedules a render. React then calls the component again and updates only the necessary DOM output.",
      },
      {
        id: "array-update",
        prompt: "Which update safely adds an item to array state?",
        options: [
          "items.push(item); setItems(items)",
          "setItems([...items, item])",
          "items[items.length] = item",
          "setItems(items.push(item))",
        ],
        answer: 1,
        explanation:
          "The spread expression creates a new array. The other choices mutate the existing array or pass the wrong value.",
      },
      {
        id: "derived-state",
        prompt: "You have todos in state. Should completedCount also be state?",
        options: [
          "Always",
          "Only in production",
          "Usually no; derive it from todos",
          "Only when using TypeScript",
        ],
        answer: 2,
        explanation:
          "Completed count can be calculated from todos. Storing both creates two sources of truth that can drift apart.",
      },
    ],
    project: {
      title: "Build a focused task tracker",
      brief:
        "Create a small task tracker without copying a tutorial. The goal is to demonstrate that you understand state ownership and immutable updates.",
      requirements: [
        "Add tasks from a controlled input",
        "Toggle a task between active and complete",
        "Delete a task",
        "Show active and completed counts derived from the task array",
        "Do not mutate the task array or task objects",
        "Write one paragraph explaining where state lives and why",
      ],
      stretch: "Add filters without storing a separate filtered task array in state.",
    },
  },
];
