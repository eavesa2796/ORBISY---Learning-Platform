import { Lesson } from "@/types/models";

type BaseLesson = Omit<Lesson, "subject">;

const reactLessons: BaseLesson[] = [
  {
    id: "lesson-js-immutability",
    moduleId: "module-js-foundations",
    topicId: "immutability",
    title: "Immutability for Predictable UI",
    difficulty: "beginner",
    estimatedMinutes: 30,
    learningObjectives: [
      "Explain why mutating state causes React bugs",
      "Use spread syntax for arrays and objects",
      "Describe structural sharing in plain language",
    ],
    explanation:
      "React compares previous and next values to decide what changed. If you mutate an object in place, React can miss updates or produce hard-to-trace behavior.",
    mentalModel:
      "Treat state like a snapshot. Every update creates a new snapshot instead of editing the old one.",
    syntaxExamples: [
      "setItems((prev) => [...prev, newItem]);",
      "setUser((prev) => ({ ...prev, name: 'Sam' }));",
    ],
    practicalExamples: [
      "Add a todo item without mutating the existing list",
      "Toggle completion by returning a mapped array",
    ],
    commonMistakes: [
      "Using push/splice directly on state arrays",
      "Editing nested object fields without cloning",
    ],
    bestPractices: [
      "Prefer immutable helper methods like map/filter",
      "Normalize deeply nested state when possible",
    ],
    memorizeSummary: [
      "Never mutate React state directly",
      "Return a new reference for changed data",
      "Immutable updates keep render logic predictable",
    ],
    flashcardIds: ["fc-immutability-1", "fc-immutability-2"],
    quizId: "quiz-immutability",
    codingExerciseId: "exercise-immutability-list",
    reflectionQuestion:
      "Which state update in your last project could break if it mutated data in place?",
  },
  {
    id: "lesson-react-jsx-basics",
    moduleId: "module-react-fundamentals",
    topicId: "jsx",
    title: "JSX Essentials",
    difficulty: "beginner",
    estimatedMinutes: 25,
    learningObjectives: [
      "Write valid JSX expressions",
      "Distinguish HTML attributes from JSX props",
      "Render dynamic values safely",
    ],
    explanation:
      "JSX is syntax that looks like HTML but compiles to JavaScript function calls. It helps describe UI declaratively.",
    mentalModel:
      "JSX is not a template language. It is JavaScript that returns UI objects.",
    syntaxExamples: [
      "const heading = <h1>Hello</h1>;",
      "<button disabled={isSaving}>{label}</button>",
    ],
    practicalExamples: [
      "Render a greeting component with dynamic username",
      "Conditionally render a banner with &&",
    ],
    commonMistakes: [
      "Using class instead of className",
      "Returning multiple adjacent elements without a wrapper",
    ],
    bestPractices: [
      "Keep JSX focused and extract repeated UI into components",
      "Avoid complex logic directly in markup",
    ],
    memorizeSummary: [
      "JSX expressions go inside braces",
      "React components must return one root node",
      "className and htmlFor replace class and for",
    ],
    flashcardIds: ["fc-jsx-1", "fc-jsx-2"],
    quizId: "quiz-jsx",
    codingExerciseId: "exercise-jsx-profile-card",
    reflectionQuestion:
      "Which part of JSX feels most like JavaScript instead of HTML to you?",
  },
  {
    id: "lesson-react-props-state",
    moduleId: "module-react-fundamentals",
    topicId: "props-state",
    title: "Props vs State",
    difficulty: "beginner",
    estimatedMinutes: 35,
    learningObjectives: [
      "Differentiate props from state",
      "Pass data and callbacks through components",
      "Recognize one-way data flow",
    ],
    explanation:
      "Props are inputs from a parent. State is internal data owned by the component. React flows data downward through props.",
    mentalModel: "Props are function parameters. State is component memory.",
    syntaxExamples: [
      "function Badge({ label }: { label: string }) { return <span>{label}</span>; }",
      "const [count, setCount] = useState(0);",
    ],
    practicalExamples: [
      "Parent passes value and onChange to child input",
      "Counter component owns count state",
    ],
    commonMistakes: [
      "Trying to change props directly",
      "Storing duplicated state in multiple children",
    ],
    bestPractices: [
      "Lift state up when multiple components need it",
      "Keep state as close as possible to where it is used",
    ],
    memorizeSummary: [
      "Props are read-only",
      "State updates trigger re-renders",
      "Data flows down, events flow up",
    ],
    flashcardIds: ["fc-props-state-1", "fc-props-state-2"],
    quizId: "quiz-props-state",
    codingExerciseId: "exercise-lift-state-temperature",
    reflectionQuestion:
      "Where in your app should state live for the cleanest one-way data flow?",
  },
  {
    id: "lesson-react-lists-keys",
    moduleId: "module-react-fundamentals",
    topicId: "lists-keys",
    title: "Rendering Lists and Choosing Keys",
    difficulty: "beginner",
    estimatedMinutes: 30,
    learningObjectives: [
      "Render arrays using map",
      "Choose stable keys",
      "Explain why index keys can break UI",
    ],
    explanation:
      "Keys help React match elements between renders. Unstable keys can remount components unexpectedly and lose local state.",
    mentalModel: "Keys are identity cards for list items across re-renders.",
    syntaxExamples: [
      "items.map((item) => <li key={item.id}>{item.name}</li>)",
      "<Fragment key={item.id}>...</Fragment>",
    ],
    practicalExamples: [
      "Todo list with unique IDs",
      "Sortable list preserving input state",
    ],
    commonMistakes: [
      "Using Math.random() for keys",
      "Using array index when order can change",
    ],
    bestPractices: [
      "Prefer database IDs or generated UUIDs",
      "Keep keys stable across sorting and filtering",
    ],
    memorizeSummary: [
      "Every list item needs a stable key",
      "Index keys are a last resort for static lists",
      "Keys affect state preservation",
    ],
    flashcardIds: ["fc-keys-1", "fc-keys-2"],
    quizId: "quiz-keys",
    codingExerciseId: "exercise-keyed-shopping-list",
    reflectionQuestion:
      "What bugs might appear if you use index keys in a reorderable list?",
  },
  {
    id: "lesson-state-updates",
    moduleId: "module-state-forms",
    topicId: "use-state",
    title: "Reliable State Updates",
    difficulty: "beginner",
    estimatedMinutes: 30,
    learningObjectives: [
      "Use functional updates correctly",
      "Handle sequential updates safely",
      "Avoid stale state values",
    ],
    explanation:
      "State updates may batch. Functional updates read the latest value and avoid stale closures when multiple updates happen quickly.",
    mentalModel:
      "If next state depends on previous state, pass a function to setState.",
    syntaxExamples: [
      "setCount((prev) => prev + 1);",
      "setForm((prev) => ({ ...prev, email: value }));",
    ],
    practicalExamples: [
      "Increment click counter quickly without missed updates",
      "Append chat messages in a stream",
    ],
    commonMistakes: [
      "setCount(count + 1) in rapid loops",
      "Mixing async values with stale closures",
    ],
    bestPractices: [
      "Use updater form when deriving from previous state",
      "Keep state transitions explicit and small",
    ],
    memorizeSummary: [
      "Use functional updates for dependent state",
      "State updates are asynchronous",
      "Never rely on immediate state after setState",
    ],
    flashcardIds: ["fc-state-1", "fc-state-2"],
    quizId: "quiz-state-updates",
    codingExerciseId: "exercise-cart-quantity",
    reflectionQuestion: "Where can stale state appear in your event handlers?",
  },
  {
    id: "lesson-controlled-inputs",
    moduleId: "module-state-forms",
    topicId: "controlled-inputs",
    title: "Controlled Inputs and Form Flow",
    difficulty: "beginner",
    estimatedMinutes: 35,
    learningObjectives: [
      "Bind input value to React state",
      "Handle onChange and onSubmit clearly",
      "Implement basic validation flow",
    ],
    explanation:
      "Controlled inputs keep source of truth in React state, making validation, preview, and dynamic behavior straightforward.",
    mentalModel:
      "Input UI mirrors state. Events update state. State re-renders UI.",
    syntaxExamples: [
      "<input value={email} onChange={(e) => setEmail(e.target.value)} />",
      "const onSubmit = (e) => { e.preventDefault(); ... }",
    ],
    practicalExamples: [
      "Newsletter signup with validation",
      "Task form with character counter",
    ],
    commonMistakes: [
      "Missing value prop causing uncontrolled behavior",
      "Forgetting preventDefault on submit",
    ],
    bestPractices: [
      "Store related fields in structured form state",
      "Show inline validation near fields",
    ],
    memorizeSummary: [
      "value + onChange makes input controlled",
      "Form submit should prevent default reload",
      "Validation feedback should be specific",
    ],
    flashcardIds: ["fc-form-1", "fc-form-2"],
    quizId: "quiz-controlled-inputs",
    codingExerciseId: "exercise-contact-form",
    reflectionQuestion:
      "Which form rule in your app would benefit from instant validation?",
  },
  {
    id: "lesson-lifting-state",
    moduleId: "module-state-forms",
    topicId: "lifting-state",
    title: "Lifting State for Shared Behavior",
    difficulty: "intermediate",
    estimatedMinutes: 40,
    learningObjectives: [
      "Identify duplicated state",
      "Move state to common ancestor",
      "Pass callbacks to coordinate child components",
    ],
    explanation:
      "When sibling components need the same data, state belongs in their nearest common parent.",
    mentalModel: "One source of truth beats syncing two competing states.",
    syntaxExamples: [
      "<TemperatureInput value={celsius} onChange={setCelsius} />",
      "const [activeId, setActiveId] = useState<string | null>(null);",
    ],
    practicalExamples: [
      "Accordion with one open item",
      "Shared filters across list and chart",
    ],
    commonMistakes: [
      "Copying parent data into child local state",
      "Passing too many unrelated props",
    ],
    bestPractices: [
      "Lift only what needs sharing",
      "Keep child components focused and stateless when possible",
    ],
    memorizeSummary: [
      "Shared state lives in closest common parent",
      "Children receive data and callbacks via props",
      "Avoid duplicated sources of truth",
    ],
    flashcardIds: ["fc-lift-1", "fc-lift-2"],
    quizId: "quiz-lifting-state",
    codingExerciseId: "exercise-accordion-single-open",
    reflectionQuestion:
      "Which two components in your app should share one parent-owned state?",
  },
  {
    id: "lesson-use-effect",
    moduleId: "module-effects-refs",
    topicId: "use-effect",
    title: "useEffect Without Confusion",
    difficulty: "intermediate",
    estimatedMinutes: 45,
    learningObjectives: [
      "Describe when effects are needed",
      "Use dependency arrays correctly",
      "Avoid infinite loops",
    ],
    explanation:
      "Effects synchronize React with external systems like timers, subscriptions, and network requests.",
    mentalModel:
      "Render should be pure. Effects run after render to sync outside world.",
    syntaxExamples: [
      "useEffect(() => { document.title = title; }, [title]);",
      "useEffect(() => { const id = setInterval(...); return () => clearInterval(id); }, []);",
    ],
    practicalExamples: [
      "Persisting preferences to localStorage",
      "Refetching data when query changes",
    ],
    commonMistakes: [
      "Updating state inside effect without guard",
      "Omitting dependencies to silence warnings",
    ],
    bestPractices: [
      "Start by asking if effect is necessary",
      "Move non-effect logic back into render/events",
    ],
    memorizeSummary: [
      "Effects sync external systems",
      "Dependencies should reflect used values",
      "Cleanup prevents leaks and stale behavior",
    ],
    flashcardIds: ["fc-effect-1", "fc-effect-2"],
    quizId: "quiz-use-effect",
    codingExerciseId: "exercise-search-effect",
    reflectionQuestion:
      "Which effect in your code can be removed by deriving state in render?",
  },
  {
    id: "lesson-data-fetching-race",
    moduleId: "module-effects-refs",
    topicId: "fetching-races",
    title: "Prevent Race Conditions in Fetching",
    difficulty: "advanced",
    estimatedMinutes: 50,
    learningObjectives: [
      "Handle request cancellation with AbortController",
      "Prevent stale responses from overriding fresh data",
      "Model loading and error transitions",
    ],
    explanation:
      "Fast user input can trigger overlapping requests. Without cancellation or guard checks, old responses can overwrite new state.",
    mentalModel:
      "Every request should have ownership over whether it can still update state.",
    syntaxExamples: [
      "const controller = new AbortController(); fetch(url, { signal: controller.signal });",
      "return () => controller.abort();",
    ],
    practicalExamples: [
      "Search field with rapid query changes",
      "Tab switch that cancels previous fetch",
    ],
    commonMistakes: [
      "Ignoring abort errors and showing false failures",
      "Updating state after component unmount",
    ],
    bestPractices: [
      "Treat each request as cancellable",
      "Keep request state machine explicit",
    ],
    memorizeSummary: [
      "Abort stale requests",
      "Guard against out-of-order responses",
      "Track loading, success, and error separately",
    ],
    flashcardIds: ["fc-race-1", "fc-race-2"],
    quizId: "quiz-race-conditions",
    codingExerciseId: "exercise-abortable-search",
    reflectionQuestion:
      "What user interaction in your app can trigger overlapping requests?",
  },
  {
    id: "lesson-custom-hooks",
    moduleId: "module-reusable-patterns",
    topicId: "custom-hooks",
    title: "Designing Useful Custom Hooks",
    difficulty: "intermediate",
    estimatedMinutes: 40,
    learningObjectives: [
      "Extract repeated logic into hooks",
      "Return clear hook APIs",
      "Keep hooks composable",
    ],
    explanation:
      "Custom hooks let you reuse stateful behavior without creating giant components.",
    mentalModel: "Hooks are behavior units, components are UI units.",
    syntaxExamples: [
      "function useToggle(initial = false) { const [on, setOn] = useState(initial); ... }",
      "const { value, setValue, reset } = useFormField('');",
    ],
    practicalExamples: [
      "useLocalStorageState for persisted settings",
      "useDebouncedValue for search input",
    ],
    commonMistakes: [
      "Returning too many unrelated values",
      "Putting UI markup inside hook logic",
    ],
    bestPractices: [
      "Name hooks by behavior intent",
      "Keep return signatures simple and predictable",
    ],
    memorizeSummary: [
      "Custom hooks share logic, not UI",
      "Hook names start with use",
      "Stable, minimal APIs are easier to adopt",
    ],
    flashcardIds: ["fc-hooks-1", "fc-hooks-2"],
    quizId: "quiz-custom-hooks",
    codingExerciseId: "exercise-use-local-storage-hook",
    reflectionQuestion:
      "Which repeated logic in your app should be extracted into a custom hook?",
  },
  {
    id: "lesson-routing-layouts",
    moduleId: "module-routing-structure",
    topicId: "nested-routes",
    title: "Nested Routes and Layout Thinking",
    difficulty: "intermediate",
    estimatedMinutes: 35,
    learningObjectives: [
      "Understand route nesting",
      "Use shared layouts for consistent UI",
      "Manage route params and search params",
    ],
    explanation:
      "Nested routes let sections share navigation, context, and structure while individual pages focus on content.",
    mentalModel:
      "Layout is a frame. Child routes are scenes inside that frame.",
    syntaxExamples: [
      "app/(course)/layout.tsx",
      "const moduleId = params.moduleId;",
    ],
    practicalExamples: [
      "Learning app with shared sidebar",
      "Project detail pages by slug",
    ],
    commonMistakes: [
      "Duplicating nav on every page",
      "Mixing route and component concerns in one file",
    ],
    bestPractices: [
      "Use route groups for organization",
      "Keep layout components stable and focused",
    ],
    memorizeSummary: [
      "Layouts reduce duplication",
      "Nested routes inherit parent layouts",
      "Route params map to folder names",
    ],
    flashcardIds: ["fc-routing-1", "fc-routing-2"],
    quizId: "quiz-nested-routes",
    codingExerciseId: "exercise-route-layout",
    reflectionQuestion:
      "Which part of your app should become a shared layout first?",
  },
  {
    id: "lesson-fetch-states",
    moduleId: "module-apis",
    topicId: "loading-error-empty",
    title: "Loading, Error, and Empty States Done Right",
    difficulty: "intermediate",
    estimatedMinutes: 35,
    learningObjectives: [
      "Represent async state clearly",
      "Avoid blank screens during fetch",
      "Differentiate empty results from errors",
    ],
    explanation:
      "User trust depends on transparent async feedback. A complete UI state model improves reliability and usability.",
    mentalModel:
      "Every fetch UI should answer: loading, success with data, success empty, or failure.",
    syntaxExamples: [
      "if (isLoading) return <Spinner />;",
      "if (error) return <ErrorState />;",
    ],
    practicalExamples: [
      "Search page with no matches state",
      "Retry button for failed requests",
    ],
    commonMistakes: [
      "Using one boolean for all async states",
      "Displaying generic errors without guidance",
    ],
    bestPractices: [
      "Use explicit status enums",
      "Design empty states with next actions",
    ],
    memorizeSummary: [
      "Loading, error, and empty are distinct states",
      "Never leave users guessing what happened",
      "Retry paths improve resilience",
    ],
    flashcardIds: ["fc-loading-1", "fc-loading-2"],
    quizId: "quiz-async-states",
    codingExerciseId: "exercise-state-machine-fetch",
    reflectionQuestion:
      "Which screen in your app lacks a strong empty or error state today?",
  },
  {
    id: "lesson-react-memo",
    moduleId: "module-performance",
    topicId: "react-memo",
    title: "React.memo in Context",
    difficulty: "intermediate",
    estimatedMinutes: 30,
    learningObjectives: [
      "Explain when memoization helps",
      "Apply React.memo to expensive child trees",
      "Avoid premature optimization",
    ],
    explanation:
      "React.memo skips re-rendering when props are shallowly equal, but it adds complexity and should be used where profiling shows benefit.",
    mentalModel: "Measure first, optimize second.",
    syntaxExamples: [
      "const ListItem = React.memo(function ListItem(props) { ... });",
      "const filtered = useMemo(() => heavyFilter(data), [data]);",
    ],
    practicalExamples: [
      "Large table rows with stable props",
      "Search filters with heavy computations",
    ],
    commonMistakes: [
      "Memoizing everything by default",
      "Forgetting unstable function props trigger re-renders",
    ],
    bestPractices: [
      "Use profiler to confirm wins",
      "Memoize only expensive branches",
    ],
    memorizeSummary: [
      "React.memo is a tool, not a default",
      "Prop stability matters",
      "Optimize with evidence",
    ],
    flashcardIds: ["fc-memo-1", "fc-memo-2"],
    quizId: "quiz-react-memo",
    codingExerciseId: "exercise-profiler-memo",
    reflectionQuestion:
      "Which component in your app is expensive enough to justify memoization?",
  },
  {
    id: "lesson-testing-rtl",
    moduleId: "module-testing",
    topicId: "rtl-vitest",
    title: "Testing Components the User Way",
    difficulty: "intermediate",
    estimatedMinutes: 45,
    learningObjectives: [
      "Write tests with React Testing Library",
      "Use accessible queries",
      "Test behavior instead of implementation details",
    ],
    explanation:
      "Good tests simulate user behavior and protect important workflows while allowing internal refactors.",
    mentalModel:
      "If users cannot observe it, your test usually should not depend on it.",
    syntaxExamples: [
      "render(<LoginForm />);",
      "await user.click(screen.getByRole('button', { name: /submit/i }));",
    ],
    practicalExamples: [
      "Form validation error appears on invalid submit",
      "Loading spinner disappears after success",
    ],
    commonMistakes: [
      "Querying private class names",
      "Overmocking to the point tests lose realism",
    ],
    bestPractices: [
      "Prefer getByRole for accessible queries",
      "Keep each test focused on one behavior",
    ],
    memorizeSummary: [
      "Test from user perspective",
      "Prefer semantic queries",
      "Stable tests enable fearless refactoring",
    ],
    flashcardIds: ["fc-testing-1", "fc-testing-2"],
    quizId: "quiz-rtl-vitest",
    codingExerciseId: "exercise-test-form-submit",
    reflectionQuestion:
      "Which critical user flow in your app lacks a behavior-focused test?",
  },
  {
    id: "lesson-ts-props",
    moduleId: "module-ts-react",
    topicId: "typing-props",
    title: "Type-Safe Props That Scale",
    difficulty: "beginner",
    estimatedMinutes: 35,
    learningObjectives: [
      "Define clear prop interfaces",
      "Use unions for variant components",
      "Type children and callbacks properly",
    ],
    explanation:
      "Strong prop types make components easier to reuse and harder to misuse.",
    mentalModel: "Types are contracts for component behavior.",
    syntaxExamples: [
      "type ButtonProps = { variant: 'primary' | 'ghost'; onClick: () => void };",
      "type CardProps = { children: React.ReactNode; title: string };",
    ],
    practicalExamples: [
      "Reusable button with variant unions",
      "Modal component with typed close handler",
    ],
    commonMistakes: [
      "Using any for component props",
      "Overly broad string types for finite variants",
    ],
    bestPractices: [
      "Use discriminated unions for stateful variants",
      "Type callbacks with exact argument shapes",
    ],
    memorizeSummary: [
      "Props should be explicit and narrow",
      "Union types model finite UI states",
      "Avoid any in shared component APIs",
    ],
    flashcardIds: ["fc-ts-1", "fc-ts-2"],
    quizId: "quiz-ts-props",
    codingExerciseId: "exercise-button-union-types",
    reflectionQuestion:
      "Which shared component in your app has the weakest prop contract today?",
  },
  {
    id: "lesson-a11y-focus",
    moduleId: "module-accessibility",
    topicId: "keyboard-focus",
    title: "Keyboard Navigation and Focus Management",
    difficulty: "intermediate",
    estimatedMinutes: 30,
    learningObjectives: [
      "Design keyboard-accessible interactions",
      "Manage focus after dialogs and route changes",
      "Spot common tab-order issues",
    ],
    explanation:
      "A keyboard-friendly interface benefits all users, especially assistive tech users and power users.",
    mentalModel:
      "Every interactive action should be reachable and understandable without a mouse.",
    syntaxExamples: [
      "button:focus-visible { outline: 2px solid ... }",
      "dialogRef.current?.focus();",
    ],
    practicalExamples: [
      "Modal focus trap basics",
      "Skip-to-content link for long pages",
    ],
    commonMistakes: [
      "Using div onClick instead of button",
      "Removing focus styles globally",
    ],
    bestPractices: [
      "Prefer semantic elements first",
      "Test tab order on every feature",
    ],
    memorizeSummary: [
      "Keyboard accessibility is non-negotiable",
      "Focus should move intentionally",
      "Semantic HTML solves many accessibility issues",
    ],
    flashcardIds: ["fc-a11y-1", "fc-a11y-2"],
    quizId: "quiz-keyboard-focus",
    codingExerciseId: "exercise-accessible-modal-flow",
    reflectionQuestion:
      "Which interaction on your site is hardest to use with keyboard only?",
  },
];

const pythonLessons: Lesson[] = [
  {
    id: "py-lesson-1-hello-python",
    subject: "python",
    moduleId: "py-module-1-fundamentals",
    topicId: "py-module-1-fundamentals-topic-1",
    title: "What Programming Is and Your First Python Program",
    difficulty: "beginner",
    estimatedMinutes: 35,
    learningObjectives: [
      "Explain what a program does",
      "Run Python code in a file and interpreter",
      "Print text and values to the console",
    ],
    explanation:
      "Programming is giving precise instructions to a computer. Python lets you start with clear, readable syntax and immediate feedback.",
    mentalModel:
      "A program is a sequence of instructions executed top to bottom unless control flow changes it.",
    syntaxExamples: [
      "print('Hello, Python!')",
      "name = 'Anthony'\nprint(f'Hi, {name}')",
    ],
    practicalExamples: [
      "Create a greeting script that prints a personalized message",
      "Run code in REPL to quickly test assumptions",
    ],
    commonMistakes: [
      "Forgetting parentheses in print",
      "Running the wrong file path from terminal",
    ],
    bestPractices: [
      "Keep scripts small while learning",
      "Test tiny changes often in interpreter",
    ],
    memorizeSummary: [
      "Python executes line by line",
      "print() is your first debugging tool",
      "REPL is ideal for quick experiments",
    ],
    flashcardIds: ["py-fc-1", "py-fc-2"],
    quizId: "py-quiz-1",
    codingExerciseId: "py-ex-1",
    reflectionQuestion:
      "What did you learn faster by using the REPL compared to a file?",
  },
  {
    id: "py-lesson-2-variables-types",
    subject: "python",
    moduleId: "py-module-1-fundamentals",
    topicId: "py-module-1-fundamentals-topic-3",
    title: "Variables, Types, and Conversion",
    difficulty: "beginner",
    estimatedMinutes: 40,
    learningObjectives: [
      "Create variables with meaningful names",
      "Identify int, float, str, bool",
      "Convert between types safely",
    ],
    explanation:
      "Variables bind names to values. Python values carry types that affect operations and conversions.",
    mentalModel: "A variable is a label attached to a value object.",
    syntaxExamples: ["age = 29", "price = float('19.99')"],
    practicalExamples: [
      "Parse numeric input before arithmetic",
      "Convert values for clean output formatting",
    ],
    commonMistakes: [
      "Trying to add string and int directly",
      "Using unclear variable names",
    ],
    bestPractices: ["Use snake_case names", "Validate input before conversion"],
    memorizeSummary: [
      "Names reference values",
      "Type determines valid operations",
      "Use int()/float()/str() for explicit conversion",
    ],
    flashcardIds: ["py-fc-3", "py-fc-4"],
    quizId: "py-quiz-2",
    codingExerciseId: "py-ex-2",
    reflectionQuestion:
      "Which conversion error have you seen most often and why?",
  },
  {
    id: "py-lesson-3-conditions",
    subject: "python",
    moduleId: "py-module-2-control-flow",
    topicId: "py-module-2-control-flow-topic-2",
    title: "Branching with if / elif / else",
    difficulty: "beginner",
    estimatedMinutes: 35,
    learningObjectives: [
      "Write clear conditional branches",
      "Use comparison and logical operators",
      "Avoid ambiguous boolean expressions",
    ],
    explanation:
      "Conditionals let programs decide which path to execute based on boolean expressions.",
    mentalModel: "A conditional is a decision gate in your execution flow.",
    syntaxExamples: [
      "if score >= 90:\n    grade = 'A'\nelif score >= 80:\n    grade = 'B'\nelse:\n    grade = 'C'",
    ],
    practicalExamples: [
      "Classify user age groups",
      "Validate a password length and symbols",
    ],
    commonMistakes: [
      "Using = instead of == in a condition",
      "Forgetting indentation blocks",
    ],
    bestPractices: [
      "Keep conditionals readable",
      "Extract complex checks into named functions",
    ],
    memorizeSummary: [
      "Conditions must evaluate to True or False",
      "elif prevents deeply nested if chains",
      "Indentation defines each branch block",
    ],
    flashcardIds: ["py-fc-5", "py-fc-6"],
    quizId: "py-quiz-3",
    codingExerciseId: "py-ex-3",
    reflectionQuestion: "Where can your current logic branches be simplified?",
  },
  {
    id: "py-lesson-4-loops",
    subject: "python",
    moduleId: "py-module-3-loops",
    topicId: "py-module-3-loops-topic-1",
    title: "for and while Loops in Practice",
    difficulty: "beginner",
    estimatedMinutes: 40,
    learningObjectives: [
      "Choose for vs while appropriately",
      "Use range effectively",
      "Control loops with break and continue",
    ],
    explanation:
      "Loops automate repetition and are central for processing collections and repeated checks.",
    mentalModel:
      "A loop is controlled repetition until a stopping condition is reached.",
    syntaxExamples: [
      "for i in range(5):\n    print(i)",
      "while attempts < 3:\n    attempts += 1",
    ],
    practicalExamples: [
      "Summing order totals from a list",
      "Retrying user input until valid",
    ],
    commonMistakes: ["Off-by-one range boundaries", "Infinite while loops"],
    bestPractices: [
      "Prefer for loops for known collections",
      "Always ensure while loop progress",
    ],
    memorizeSummary: [
      "for iterates over iterables",
      "while repeats on condition",
      "break exits loop early",
    ],
    flashcardIds: ["py-fc-7", "py-fc-8"],
    quizId: "py-quiz-4",
    codingExerciseId: "py-ex-4",
    reflectionQuestion:
      "Which loop in your code could become clearer with a different loop type?",
  },
  {
    id: "py-lesson-5-functions",
    subject: "python",
    moduleId: "py-module-4-functions",
    topicId: "py-module-4-functions-topic-2",
    title: "Function Parameters, Returns, and Scope",
    difficulty: "intermediate",
    estimatedMinutes: 45,
    learningObjectives: [
      "Define reusable functions",
      "Use positional/keyword arguments",
      "Avoid scope side effects",
    ],
    explanation:
      "Functions package logic into reusable units and reduce duplication in larger programs.",
    mentalModel:
      "A function is a mini-machine with inputs, processing, and outputs.",
    syntaxExamples: [
      "def area(width: float, height: float) -> float:\n    return width * height",
      "def greet(name, punctuation='!'):\n    return f'Hi {name}{punctuation}'",
    ],
    practicalExamples: [
      "Build reusable validation helpers",
      "Separate IO from computation for easier testing",
    ],
    commonMistakes: [
      "Forgetting to return computed values",
      "Mutating global state from helpers",
    ],
    bestPractices: [
      "Keep functions focused on one responsibility",
      "Use type hints and docstrings for clarity",
    ],
    memorizeSummary: [
      "Parameters accept inputs",
      "return sends outputs",
      "Local variables exist only inside function scope",
    ],
    flashcardIds: ["py-fc-9", "py-fc-10"],
    quizId: "py-quiz-5",
    codingExerciseId: "py-ex-5",
    reflectionQuestion:
      "Which repeated code block can you extract into a function today?",
  },
  {
    id: "py-lesson-6-collections",
    subject: "python",
    moduleId: "py-module-6-collections",
    topicId: "py-module-6-collections-topic-2",
    title: "Choosing Lists, Sets, and Dictionaries",
    difficulty: "intermediate",
    estimatedMinutes: 45,
    learningObjectives: [
      "Choose proper collection types",
      "Use comprehensions effectively",
      "Avoid accidental shared references",
    ],
    explanation:
      "Collections model data differently. Choosing the right one impacts readability and performance.",
    mentalModel:
      "List for order, set for uniqueness, dict for key-value lookup.",
    syntaxExamples: [
      "unique_names = set(names)",
      "name_lengths = {name: len(name) for name in names}",
    ],
    practicalExamples: [
      "Count word frequencies with a dict",
      "Filter duplicate IDs with a set",
    ],
    commonMistakes: [
      "Using list membership checks in large loops",
      "Shallow copy assumptions with nested lists",
    ],
    bestPractices: [
      "Match data structure to access pattern",
      "Prefer comprehensions for clear transforms",
    ],
    memorizeSummary: [
      "dict gives O(1)-ish key lookup",
      "set removes duplicates",
      "list preserves order and duplicates",
    ],
    flashcardIds: ["py-fc-11", "py-fc-12"],
    quizId: "py-quiz-6",
    codingExerciseId: "py-ex-6",
    reflectionQuestion:
      "Where is your current code using the wrong collection?",
  },
  {
    id: "py-lesson-7-exceptions",
    subject: "python",
    moduleId: "py-module-7-exceptions",
    topicId: "py-module-7-exceptions-topic-2",
    title: "Error Handling and Reading Tracebacks",
    difficulty: "intermediate",
    estimatedMinutes: 35,
    learningObjectives: [
      "Interpret traceback lines quickly",
      "Use try/except/finally responsibly",
      "Raise meaningful exceptions",
    ],
    explanation:
      "Exceptions surface abnormal execution paths. Handling them well improves reliability and user trust.",
    mentalModel: "Exceptions are controlled escapes from normal flow.",
    syntaxExamples: [
      "try:\n    value = int(raw)\nexcept ValueError:\n    print('Invalid number')",
      "raise ValueError('age must be positive')",
    ],
    practicalExamples: [
      "Validate CLI input with clear error messages",
      "Guarantee file close with finally/with",
    ],
    commonMistakes: [
      "Catching broad Exception without intent",
      "Silencing exceptions with pass",
    ],
    bestPractices: [
      "Catch specific exceptions",
      "Keep try blocks as small as possible",
    ],
    memorizeSummary: [
      "Tracebacks show exact failure path",
      "except should be specific",
      "raise for invalid states",
    ],
    flashcardIds: ["py-fc-13", "py-fc-14"],
    quizId: "py-quiz-7",
    codingExerciseId: "py-ex-7",
    reflectionQuestion:
      "Which error in your projects should become a custom exception?",
  },
  {
    id: "py-lesson-8-files-json",
    subject: "python",
    moduleId: "py-module-8-files",
    topicId: "py-module-8-files-topic-4",
    title: "Working with Files, CSV, and JSON",
    difficulty: "intermediate",
    estimatedMinutes: 45,
    learningObjectives: [
      "Read and write files safely",
      "Parse CSV and JSON data",
      "Handle missing file paths gracefully",
    ],
    explanation:
      "Real applications exchange data through files and structured formats such as CSV and JSON.",
    mentalModel:
      "Always open resources with a plan to close and validate data.",
    syntaxExamples: [
      "with open('data.txt', 'r', encoding='utf-8') as f:\n    content = f.read()",
      'import json\nrecord = json.loads(\'{"name": "A"}\')',
    ],
    practicalExamples: [
      "Load and summarize sales CSV",
      "Persist settings in JSON",
    ],
    commonMistakes: [
      "Forgetting encoding for text files",
      "Assuming keys always exist in JSON",
    ],
    bestPractices: [
      "Use pathlib for path operations",
      "Validate parsed data shape",
    ],
    memorizeSummary: [
      "with handles close automatically",
      "CSV is row-based plain text",
      "JSON maps to dict/list primitives",
    ],
    flashcardIds: ["py-fc-15", "py-fc-16"],
    quizId: "py-quiz-8",
    codingExerciseId: "py-ex-8",
    reflectionQuestion:
      "What validation should happen immediately after loading external data?",
  },
  {
    id: "py-lesson-9-imports-env",
    subject: "python",
    moduleId: "py-module-9-packages",
    topicId: "py-module-9-packages-topic-5",
    title: "Imports, pip, and Virtual Environments",
    difficulty: "intermediate",
    estimatedMinutes: 35,
    learningObjectives: [
      "Use clean import styles",
      "Manage dependencies with pip",
      "Isolate projects with virtual environments",
    ],
    explanation:
      "Environment hygiene prevents dependency conflicts and makes projects reproducible.",
    mentalModel:
      "Each project should have isolated dependencies and explicit requirements.",
    syntaxExamples: [
      "python -m venv .venv",
      "pip install fastapi\npip freeze > requirements.txt",
    ],
    practicalExamples: [
      "Set up a clean env for API work",
      "Organize module imports for readability",
    ],
    commonMistakes: [
      "Installing packages globally",
      "Committing massive lockless dependency drift",
    ],
    bestPractices: [
      "Activate venv before installs",
      "Pin versions for shared projects",
    ],
    memorizeSummary: [
      "venv isolates dependencies",
      "requirements.txt captures installs",
      "import structure should stay predictable",
    ],
    flashcardIds: ["py-fc-17", "py-fc-18"],
    quizId: "py-quiz-9",
    codingExerciseId: "py-ex-9",
    reflectionQuestion:
      "How would your setup process look for a teammate starting from zero?",
  },
  {
    id: "py-lesson-10-oop-basics",
    subject: "python",
    moduleId: "py-module-10-oop",
    topicId: "py-module-10-oop-topic-1",
    title: "Classes, Objects, and Methods",
    difficulty: "intermediate",
    estimatedMinutes: 45,
    learningObjectives: [
      "Define classes with clear responsibilities",
      "Use constructors and instance attributes",
      "Choose OOP when it improves design",
    ],
    explanation:
      "OOP groups related data and behavior. It is useful for modeling entities with state and actions.",
    mentalModel:
      "Class is blueprint; object is runtime instance with concrete state.",
    syntaxExamples: [
      "class Task:\n    def __init__(self, title):\n        self.title = title",
      "def complete(self):\n    self.done = True",
    ],
    practicalExamples: [
      "Build a small inventory item model",
      "Encapsulate validation inside methods",
    ],
    commonMistakes: [
      "Overusing classes for simple scripts",
      "Putting too much logic in __init__",
    ],
    bestPractices: [
      "Prefer composition over deep inheritance",
      "Keep methods cohesive",
    ],
    memorizeSummary: [
      "self refers to instance",
      "__init__ initializes instance state",
      "Use classes when they clarify domain modeling",
    ],
    flashcardIds: ["py-fc-19", "py-fc-20"],
    quizId: "py-quiz-10",
    codingExerciseId: "py-ex-10",
    reflectionQuestion:
      "Which part of your app domain would be cleaner as objects?",
  },
];

export const seededLessons: Lesson[] = [
  ...reactLessons.map((lesson) => ({ ...lesson, subject: "react" as const })),
  ...pythonLessons,
];
