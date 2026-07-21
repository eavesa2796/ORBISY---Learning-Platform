export type Track = "React" | "Python" | "SQL";
export type LessonStatus = "mastered" | "needs-work" | "in-progress";

export type Checkpoint = {
  id: string;
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
};

export type Lesson = {
  id: string;
  track: Track;
  module: string;
  title: string;
  summary: string;
  estimatedMinutes: number;
  prerequisites: string[];
  objectives: string[];
  mentalModel: string;
  explanation: string[];
  example: string;
  expectedOutput?: string;
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
    module: "React Foundations",
    title: "State, rendering, and the React mental model",
    summary: "Understand what React does when state changes and how to update state without hidden bugs.",
    estimatedMinutes: 25,
    prerequisites: ["JavaScript functions", "Arrays and objects"],
    objectives: [
      "Explain UI as a function of props and state",
      "Predict when a component renders",
      "Update object and array state safely",
      "Choose where state should live",
    ],
    mentalModel: "A component is a function that describes the UI for the current props and state. Updating state asks React to run that function again and reconcile the new description with the existing page.",
    explanation: [
      "State is a component's memory. Use it for information that changes over time and must survive between renders.",
      "Calling a state setter schedules a render. It does not rewrite the variable inside the function that is already running.",
      "Treat state as immutable. Create new objects and arrays so React and future-you can see what changed.",
      "Keep state close to the components that use it. Lift it only to the nearest shared parent when multiple children need the same source of truth.",
    ],
    example: `type Todo = { id: number; text: string; done: boolean };

const [todos, setTodos] = useState<Todo[]>([]);

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
      "Calling push or directly changing an object property in state",
      "Copying props into state without a clear reason",
      "Storing values that can be calculated during rendering",
      "Assuming a setter changes the current render's variable immediately",
    ],
    checkpoints: [
      {
        id: "react-state-render",
        prompt: "What does calling a state setter primarily do?",
        options: ["Directly edits the DOM", "Schedules a render with new state", "Reloads the page", "Mutates the current variable"],
        answer: 1,
        explanation: "React schedules a render, calls the component again, and reconciles the new output with the previous output.",
      },
      {
        id: "react-state-array",
        prompt: "Which update safely appends an item to array state?",
        options: ["items.push(item)", "setItems([...items, item])", "setItems(items.push(item))", "items[items.length] = item"],
        answer: 1,
        explanation: "The spread expression creates a new array instead of mutating the existing state value.",
      },
      {
        id: "react-state-derived",
        prompt: "You store todos. Should completedCount usually be separate state?",
        options: ["Always", "Only with TypeScript", "No; derive it from todos", "Only in production"],
        answer: 2,
        explanation: "Derived values should usually be calculated from their source so two values cannot drift out of sync.",
      },
    ],
    project: {
      title: "Build a focused task tracker",
      brief: "Build a task tracker without copying a finished tutorial. Explain your state decisions in your own words.",
      requirements: ["Add tasks from a controlled input", "Toggle and delete tasks", "Derive active and completed counts", "Avoid all direct mutation", "Explain where state lives and why"],
      stretch: "Add filters without storing a second filtered array in state.",
    },
  },
  {
    id: "react-effects-data-flow",
    track: "React",
    module: "Effects and Data Flow",
    title: "Effects are synchronization, not event handlers",
    summary: "Learn when useEffect is appropriate, how dependencies work, and how to avoid effect loops.",
    estimatedMinutes: 30,
    prerequisites: ["React state", "JavaScript closures"],
    objectives: ["Describe an effect as synchronization", "Separate events from effects", "Choose correct dependencies", "Clean up subscriptions"],
    mentalModel: "Rendering calculates UI. Event handlers respond to user actions. Effects synchronize React with systems outside React after a render.",
    explanation: [
      "Use an effect when the component must synchronize with a network connection, browser API, timer, subscription, or another external system.",
      "Do not use an effect merely to calculate a value from props or state. Calculate it during rendering instead.",
      "Every reactive value read by an effect belongs in its dependency list. If that causes frequent execution, redesign the effect rather than hiding the dependency.",
      "Return a cleanup function whenever the external system needs to be disconnected, unsubscribed, or cancelled.",
    ],
    example: `useEffect(() => {
  const controller = new AbortController();

  async function loadUser() {
    const response = await fetch(`/api/users/${userId}`, {
      signal: controller.signal,
    });
    setUser(await response.json());
  }

  loadUser();
  return () => controller.abort();
}, [userId]);`,
    memorize: ["Effects synchronize with external systems", "Events belong in event handlers", "Dependencies describe what the effect reads", "Cleanup reverses setup", "Derived values usually do not need effects"],
    mistakes: ["Using an effect to set derived state", "Ignoring dependencies", "Putting a click action inside an effect", "Forgetting cleanup", "Creating an infinite loop by setting a dependency every run"],
    checkpoints: [
      { id: "react-effect-purpose", prompt: "Which task best fits useEffect?", options: ["Calculating a filtered array", "Opening and closing a WebSocket connection", "Handling a button click", "Formatting a label"], answer: 1, explanation: "A WebSocket is an external system whose lifecycle must be synchronized with the component." },
      { id: "react-effect-derived", prompt: "Where should fullName be created from firstName and lastName?", options: ["In an effect and state", "During rendering", "In localStorage", "In a timeout"], answer: 1, explanation: "It is a pure derived value, so calculate it during rendering." },
      { id: "react-effect-cleanup", prompt: "Why return a cleanup function?", options: ["To force rendering", "To undo subscriptions or pending work", "To memoize state", "To catch syntax errors"], answer: 1, explanation: "Cleanup prevents stale subscriptions, requests, timers, and memory leaks." },
    ],
    project: {
      title: "Build a searchable user directory",
      brief: "Fetch users when the search query changes, handle loading and errors, and cancel stale requests.",
      requirements: ["Use an effect only for request synchronization", "Abort stale requests", "Show loading and error states", "Keep filtered display logic outside the effect", "Explain every dependency"],
      stretch: "Add a small cache keyed by search term.",
    },
  },
  {
    id: "python-values-control-flow",
    track: "Python",
    module: "Python Foundations",
    title: "Values, variables, conditions, and loops",
    summary: "Build a reliable mental model for how Python evaluates values and controls program flow.",
    estimatedMinutes: 30,
    prerequisites: ["No Python experience required"],
    objectives: ["Distinguish values from variable names", "Use conditions correctly", "Choose for versus while", "Trace a loop by hand"],
    mentalModel: "A Python program evaluates expressions into values, binds names to those values, and executes statements from top to bottom unless control flow redirects it.",
    explanation: [
      "Variables are names bound to objects; they are not boxes permanently tied to one data type.",
      "Conditions use truth values. Empty collections, zero, None, and empty strings are falsy; most other values are truthy.",
      "Use a for loop when iterating over an iterable. Use while when repetition depends on a condition that changes over time.",
      "Indentation defines blocks. The visual structure is part of Python's syntax, not optional formatting.",
    ],
    example: `scores = [72, 91, 84, 67]
passed = []

for score in scores:
    if score >= 70:
        passed.append(score)

print(f"Passed: {len(passed)}")
print(f"Average: {sum(scores) / len(scores):.1f}")`,
    expectedOutput: "Passed: 3\nAverage: 78.5",
    memorize: ["Names are bound to objects", "Indentation defines a block", "for iterates over an iterable", "while repeats while a condition is true", "Use == for comparison and = for assignment"],
    mistakes: ["Using = instead of == in reasoning", "Changing a list while iterating over it", "Creating an infinite while loop", "Forgetting that range stops before its end value", "Mixing strings and numbers without conversion"],
    checkpoints: [
      { id: "python-range", prompt: "What values does range(1, 4) produce?", options: ["1, 2, 3", "1, 2, 3, 4", "0, 1, 2, 3", "4 only"], answer: 0, explanation: "The stop value is exclusive, so 4 is not produced." },
      { id: "python-loop-choice", prompt: "Which loop best processes every item in a list?", options: ["for", "while only", "if", "match"], answer: 0, explanation: "A for loop directly expresses iteration over an iterable." },
      { id: "python-truthy", prompt: "Which value is falsy?", options: ["[1]", "'0'", "0", "-1"], answer: 2, explanation: "Numeric zero is falsy; the string '0' is non-empty and therefore truthy." },
    ],
    project: {
      title: "Build a command-line grade analyzer",
      brief: "Accept grades, validate input, and produce a summary without copying a solution.",
      requirements: ["Accept multiple numeric grades", "Reject invalid values", "Calculate average and pass count", "Assign a letter grade", "Use at least one for loop and one condition"],
      stretch: "Allow the user to keep entering grades until they type done.",
    },
  },
  {
    id: "python-functions-data",
    track: "Python",
    module: "Functions and Collections",
    title: "Design functions that transform data clearly",
    summary: "Learn parameters, return values, scope, dictionaries, and comprehensions through practical transformations.",
    estimatedMinutes: 35,
    prerequisites: ["Python variables", "Conditions and loops"],
    objectives: ["Separate input, transformation, and output", "Return values instead of printing inside reusable logic", "Use dictionaries for keyed records", "Write readable comprehensions"],
    mentalModel: "A good function accepts explicit inputs, performs one understandable transformation, and returns a useful result without surprising hidden changes.",
    explanation: [
      "Parameters define what a function needs. Return values define what the caller receives.",
      "Printing is an output side effect; returning makes a function reusable and testable.",
      "Dictionaries model relationships between keys and values. Use safe access when a key may be absent.",
      "Comprehensions are compact transformations, but a normal loop is better when the logic becomes difficult to read.",
    ],
    example: `def summarize_orders(orders: list[dict]) -> dict:
    paid = [order for order in orders if order["status"] == "paid"]
    revenue = sum(order["total"] for order in paid)

    return {
        "paid_count": len(paid),
        "revenue": revenue,
    }

result = summarize_orders([
    {"status": "paid", "total": 25.0},
    {"status": "pending", "total": 40.0},
    {"status": "paid", "total": 15.0},
])
print(result)`,
    expectedOutput: "{'paid_count': 2, 'revenue': 40.0}",
    memorize: ["Functions should return useful values", "Local names stay inside the function", "Avoid mutable default arguments", "Use dict.get when absence is expected", "Prefer clarity over clever comprehensions"],
    mistakes: ["Printing instead of returning", "Mutating an argument unexpectedly", "Using a list as a default parameter", "Catching every exception broadly", "Writing nested comprehensions nobody can read"],
    checkpoints: [
      { id: "python-return", prompt: "Why return a value instead of only printing it?", options: ["It runs faster in all cases", "The caller can reuse and test the result", "It changes global scope", "It avoids parameters"], answer: 1, explanation: "Returned data can be composed, asserted in tests, stored, or displayed elsewhere." },
      { id: "python-default", prompt: "Which default parameter is risky?", options: ["limit=10", "name=None", "items=[]", "active=True"], answer: 2, explanation: "The same mutable list is reused across calls." },
      { id: "python-dict", prompt: "How do you safely read an optional key?", options: ["record.optional", "record.get('optional')", "record('optional')", "record::optional"], answer: 1, explanation: "dict.get returns None or a supplied fallback when the key is absent." },
    ],
    project: {
      title: "Build an expense report engine",
      brief: "Write reusable functions that clean transactions and create category summaries.",
      requirements: ["Represent expenses as dictionaries", "Validate required fields", "Return category totals", "Keep printing outside core functions", "Add at least three tests using assert"],
      stretch: "Load expenses from a JSON file and report malformed records.",
    },
  },
  {
    id: "sql-select-filter-aggregate",
    track: "SQL",
    module: "Query Foundations",
    title: "Turn business questions into SELECT queries",
    summary: "Learn the logical flow of SELECT, filtering, sorting, grouping, and aggregate calculations.",
    estimatedMinutes: 35,
    prerequisites: ["Basic table and row concepts"],
    objectives: ["Translate a question into clauses", "Filter before grouping", "Use aggregate functions", "Distinguish WHERE from HAVING"],
    mentalModel: "A query is a pipeline over a table-shaped dataset: choose a source, filter rows, group them when needed, filter groups, calculate output columns, sort, and limit.",
    explanation: [
      "Although SELECT is written first, FROM and WHERE are logically processed earlier. This explains why aliases are not always available in WHERE.",
      "WHERE removes individual rows before grouping. HAVING removes groups after aggregation.",
      "Aggregate functions summarize many rows. GROUP BY defines which rows belong to each summary bucket.",
      "NULL means missing or unknown, so test it with IS NULL rather than = NULL.",
    ],
    example: `SELECT
  category,
  COUNT(*) AS order_count,
  SUM(total) AS revenue
FROM orders
WHERE status = 'paid'
GROUP BY category
HAVING SUM(total) >= 1000
ORDER BY revenue DESC;`,
    memorize: ["WHERE filters rows", "HAVING filters groups", "GROUP BY defines aggregation buckets", "Use IS NULL, not = NULL", "ORDER BY is the only reliable way to request row order"],
    mistakes: ["Selecting non-aggregated columns not in GROUP BY", "Using HAVING for ordinary row filters", "Assuming rows have a natural order", "Comparing NULL with equals", "Using SELECT * when the required columns are known"],
    checkpoints: [
      { id: "sql-where-having", prompt: "Which clause filters groups after SUM or COUNT?", options: ["WHERE", "HAVING", "ORDER BY", "LIMIT"], answer: 1, explanation: "HAVING is evaluated after grouping and can filter aggregate results." },
      { id: "sql-null", prompt: "How should missing shipped_at values be tested?", options: ["shipped_at = NULL", "shipped_at IS NULL", "shipped_at == NULL", "NULL(shipped_at)"], answer: 1, explanation: "NULL comparisons use IS NULL or IS NOT NULL." },
      { id: "sql-order", prompt: "What guarantees result order?", options: ["Primary key", "Insertion order", "ORDER BY", "GROUP BY"], answer: 2, explanation: "Without ORDER BY, a database may return rows in any order." },
    ],
    project: {
      title: "Create an e-commerce reporting pack",
      brief: "Write a set of queries that answer realistic questions from orders, customers, and products.",
      requirements: ["Monthly paid revenue", "Top five products by revenue", "Customers with at least three orders", "Orders not yet shipped", "A short explanation of WHERE versus HAVING"],
      stretch: "Calculate month-over-month revenue growth.",
    },
  },
  {
    id: "sql-joins-modeling",
    track: "SQL",
    module: "Relationships and Joins",
    title: "Join tables without creating accidental duplicates",
    summary: "Understand keys, cardinality, join types, and how to debug duplicated or missing rows.",
    estimatedMinutes: 40,
    prerequisites: ["SELECT and WHERE", "Primary-key basics"],
    objectives: ["Explain one-to-many relationships", "Choose INNER versus LEFT JOIN", "Predict join cardinality", "Diagnose duplicate rows"],
    mentalModel: "A join matches rows using a relationship. The number of output rows depends on how many matches each row has, not merely on the number of input tables.",
    explanation: [
      "A primary key uniquely identifies a row. A foreign key points to a key in another table and protects relationship integrity.",
      "INNER JOIN keeps matching rows. LEFT JOIN keeps every left-side row and fills missing right-side columns with NULL.",
      "One-to-many joins intentionally repeat the one-side row once per matching many-side row. That repetition is not automatically a bug.",
      "Unexpected duplicates often come from an incomplete join condition or joining several one-to-many relationships before aggregating them separately.",
    ],
    example: `SELECT
  customers.id,
  customers.name,
  COUNT(orders.id) AS order_count
FROM customers
LEFT JOIN orders
  ON orders.customer_id = customers.id
GROUP BY customers.id, customers.name
ORDER BY order_count DESC;`,
    memorize: ["Join on real key relationships", "INNER keeps matches", "LEFT preserves the left table", "One-to-many joins repeat the one-side row", "Count a nullable right-side key after LEFT JOIN"],
    mistakes: ["Joining only on similar-looking names", "Turning a LEFT JOIN into an INNER JOIN with a careless WHERE filter", "Counting * when unmatched rows should count as zero", "Ignoring many-to-many relationships", "Using DISTINCT to hide a bad join"],
    checkpoints: [
      { id: "sql-left", prompt: "Which join keeps customers with zero orders?", options: ["INNER JOIN", "LEFT JOIN from customers", "CROSS JOIN", "SELF JOIN"], answer: 1, explanation: "LEFT JOIN preserves all customers and gives NULL order columns for those without matches." },
      { id: "sql-repeat", prompt: "Why can one customer appear three times after joining orders?", options: ["SQL is broken", "The customer has three matching orders", "Primary keys duplicate", "ORDER BY repeats rows"], answer: 1, explanation: "A one-to-many join produces one output row per matching order." },
      { id: "sql-distinct", prompt: "Should DISTINCT be the first fix for unexpected duplicates?", options: ["Always", "No; inspect join cardinality and conditions first", "Only in PostgreSQL", "Only after LIMIT"], answer: 1, explanation: "DISTINCT can hide an incorrect join and produce misleading aggregates." },
    ],
    project: {
      title: "Design and query a project tracker database",
      brief: "Model users, projects, tasks, and assignments, then answer cross-table questions.",
      requirements: ["Define primary and foreign keys", "Model many-to-many task assignments", "List projects with task counts", "List users with no assignments", "Explain the expected cardinality of every join"],
      stretch: "Add labels using a junction table and report the most-used labels.",
    },
  },
];
