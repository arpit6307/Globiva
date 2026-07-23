import { doc, setDoc, getDoc, collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { db } from '../firebase/config';

export const REACT_MASTERCLASS_COURSE = {
  id: "react-masterclass-v1",
  title: "The Definitive React.js Masterclass",
  processName: "React Developer Onboarding",
  description: "Learn React core concepts (Virtual DOM, JSX, components, state, hooks, and Concurrent Mode) through interactive mini-games, and prove your knowledge in a final MCQ test.",
  passPercentage: 70,
  isActive: true,
  createdAt: new Date().toISOString(),
  createdBy: "system",
  sections: [
    {
      id: "sec-1",
      title: "Game 1: Interactive Term Flashcard Challenge",
      gameType: "flashcards",
      content: "React is built on a declarative programming model. Instead of mutating the DOM directly, we describe the UI we want, and React uses the Virtual DOM to reconcile changes efficiently. The Virtual DOM is a lightweight, in-memory representation of the real DOM. When state changes, a new Virtual DOM tree is created, compared against the old one (Reconciliation), and the differences are batch-patched to the actual DOM. This minimizes slow layout reflows and improves performance.",
      keyTerms: [
        { term: "Virtual DOM", definition: "In-memory lightweight representation of the real DOM used to minimize direct DOM manipulation" },
        { term: "Reconciliation", definition: "The algorithm React uses to diff one tree with another to determine what needs to be updated" },
        { term: "Declarative", definition: "A paradigm where you describe what the UI should look like based on state, rather than step-by-step DOM mutations" },
        { term: "JSX", definition: "JavaScript XML, a syntax extension allowing HTML-like templates inside JavaScript" }
      ]
    },
    {
      id: "sec-2",
      title: "Game 2: Glitch Elimination Protocol Duel",
      gameType: "match",
      content: "Components accept inputs called Props (properties) as a single object. Props are immutable and read-only; a component must never modify its own props. State represents data that changes over time and triggers re-renders. Hooks are special functions starting with 'use' that let functional components tap into React features. useState hook declares state variables, while useEffect hook handles side effects.",
      keyTerms: [
        { term: "Props", definition: "Read-only input parameters passed into a component from its parent" },
        { term: "useState", definition: "Built-in Hook to declare local reactive state variables inside functional components" },
        { term: "useEffect", definition: "Hook used to perform side effects like fetching data, running timers, or adding event listeners" },
        { term: "Concurrent Mode", definition: "Engine feature enabling non-blocking, interruptible rendering to keep pages interactive" }
      ]
    }
  ],
  mcqs: [
    {
      id: "q1",
      question: "What is the primary purpose of the Virtual DOM in React?",
      options: [
        "To store data in the browser local storage cache",
        "To minimize direct DOM manipulation by diffing virtual trees and batch-updating changes",
        "To render responsive CSS styles across various screen sizes",
        "To create direct backend database connections"
      ],
      correctIndex: 1,
      explanation: "The Virtual DOM is a lightweight, in-memory representation of the real DOM. React uses it to compute UI diffs and only apply the minimal required changes to the real DOM, optimizing render performance."
    },
    {
      id: "q2",
      question: "Which compiler is commonly used to compile JSX syntax into standard React.createElement function calls?",
      options: [
        "Webpack bundler",
        "Vite dev server",
        "Babel compiler",
        "TurboEngine compiler"
      ],
      correctIndex: 2,
      explanation: "Babel is the transpiler that parses JSX code and transforms it into standard JavaScript executable functions like React.createElement()."
    },
    {
      id: "q3",
      question: "What are React Props?",
      options: [
        "Mutable variables that are updated directly within the component",
        "Immutable read-only parameters passed from a parent component to a child",
        "Functions that listen to DOM scroll events",
        "React-specific databases configured inside the client browser"
      ],
      correctIndex: 1,
      explanation: "Props are read-only variables passed down from parent components to child components. A component must never modify its own props."
    },
    {
      id: "q4",
      question: "How should you group elements in JSX without introducing extra container nodes to the DOM tree?",
      options: [
        "Wrap them in a standard HTML <div> block",
        "Use a <span> tag wrapper",
        "Use a React Fragment container (<>...</>)",
        "Nest them under a <section> parent element"
      ],
      correctIndex: 2,
      explanation: "React Fragments allow you to group multiple JSX child elements without rendering a wrapper DOM node like a div."
    },
    {
      id: "q5",
      question: "Which built-in Hook is used to add local reactive state to a functional React component?",
      options: [
        "useEffect",
        "useState",
        "useContext",
        "useReducer"
      ],
      correctIndex: 1,
      explanation: "useState is the React hook that lets you declare local state variables inside a function-based component."
    },
    {
      id: "q6",
      question: "Which Hook is designed to handle side effects such as data fetching, subscription management, or manual DOM adjustments?",
      options: [
        "useMemo",
        "useCallback",
        "useEffect",
        "useRef"
      ],
      correctIndex: 2,
      explanation: "useEffect is used to run side-effect operations after rendering. It runs after layout paints, keeping rendering non-blocking."
    },
    {
      id: "q7",
      question: "According to the Rules of Hooks, where are Hooks allowed to be called?",
      options: [
        "Inside nested function loops, conditionals, or nested functions",
        "Only inside old React class components",
        "Only at the top level of React functional components or custom Hooks",
        "From ordinary JavaScript helper functions anywhere in the code"
      ],
      correctIndex: 2,
      explanation: "Hooks must always be declared at the top level of your React function before any early returns or conditional blocks. They cannot be placed in loops or if-conditions."
    },
    {
      id: "q8",
      question: "What engine capability was introduced in React 18 to support non-blocking, interruptible rendering?",
      options: [
        "Server-Side Rendering (SSR)",
        "Static Site Generation (SSG)",
        "Concurrent Mode / Features",
        "Hot Module Replacement (HMR)"
      ],
      correctIndex: 2,
      explanation: "Concurrent features allow React to pause rendering, execute high-priority tasks (like typing inputs), and resume rendering in the background."
    },
    {
      id: "q9",
      question: "What is the primary benefit of React Server Components (RSC) regarding the client application bundle?",
      options: [
        "They increase the javascript bundle size on the client",
        "They execute on the server, sending static HTML/JSON to the client, reducing client bundle size",
        "They force full client-side hydrations of all scripts",
        "They prevent components from taking any input props"
      ],
      correctIndex: 1,
      explanation: "RSCs run entirely on the server, meaning their library dependencies are not shipped to the client browser, which results in faster initial loads and smaller bundle sizes."
    },
    {
      id: "q10",
      question: "Which wrapper component is used to render a fallback placeholder UI (like a loading spinner) while async components load?",
      options: [
        "<ErrorBoundary>",
        "<Suspense>",
        "<LoadingSpinner>",
        "<FallbackProvider>"
      ],
      correctIndex: 1,
      explanation: "The Suspense component lets you coordinate loading states by rendering fallback UI while its children load resources asynchronously."
    },
    {
      id: "q11",
      question: "What is the key functional difference between Props and State?",
      options: [
        "Props are local and mutable, whereas State is passed down and immutable",
        "Props are passed down and immutable, whereas State is local and mutable",
        "Props and State are identical in how they manage reactivity",
        "Props can only hold strings, while State can store any JavaScript datatype"
      ],
      correctIndex: 1,
      explanation: "Props are external parameters passed by the parent and are immutable to the receiver, while State is managed internally and is mutable."
    },
    {
      id: "q12",
      question: "What does the abbreviation JSX represent?",
      options: [
        "JavaScript eXtensible",
        "JavaScript XML",
        "Joint Script Syntax",
        "Java Standard Extension"
      ],
      correctIndex: 1,
      explanation: "JSX stands for JavaScript XML, which provides XML-like markup within JavaScript source files."
    },
    {
      id: "q13",
      question: "What is the role of the reconciler in the React architecture?",
      options: [
        "To fetch data endpoints from REST APIs",
        "To compile JSX code into JavaScript during build",
        "To diff Virtual DOM trees and compute the minimal updates to push to the real DOM",
        "To automatically compile CSS styles into CSS modules"
      ],
      correctIndex: 2,
      explanation: "Reconciliation is the process React uses to compare virtual DOM trees and determine which DOM node modifications need to be executed."
    },
    {
      id: "q14",
      question: "What occurs automatically in React when a component's state variable is updated?",
      options: [
        "The browser performs a full page refresh",
        "The parent component's props are cleared",
        "The component and its children re-render to reflect the updated state in the UI",
        "The Firestore database is automatically updated"
      ],
      correctIndex: 2,
      explanation: "Changing a state variable triggers a scheduled re-render of the component and its subtree to keep the UI in sync with the state."
    },
    {
      id: "q15",
      question: "In modern React applications, functional components are defined as:",
      options: [
        "Custom tags declared in an HTML file",
        "JavaScript functions that return JSX markup describing the UI",
        "Static JSON config files containing styling nodes",
        "SQL database procedures running client-side"
      ],
      correctIndex: 1,
      explanation: "Functional components are standard JavaScript functions that accept props and return React elements (JSX)."
    },
    {
      id: "q16",
      question: "What is the children prop in React?",
      options: [
        "A list of component keys that link back to the root database",
        "A special prop that passes nested elements into a component from its wrapper tags",
        "An array indexing all child components on the page",
        "A hook used to generate nested component configurations"
      ],
      correctIndex: 1,
      explanation: "The children prop is a special prop available in all React components, containing the nested elements declared inside the component's tags."
    },
    {
      id: "q17",
      question: "Which Hook should you use if you need a mutable reference value that persists across renders but does NOT trigger a re-render when changed?",
      options: [
        "useRef",
        "useState",
        "useMemo",
        "useReducer"
      ],
      correctIndex: 0,
      explanation: "useRef returns a mutable ref object. Mutating its `.current` property does not trigger a component re-render."
    },
    {
      id: "q18",
      question: "What attribute name is used in JSX to apply CSS classes to HTML elements?",
      options: [
        "class",
        "className",
        "classList",
        "styleClass"
      ],
      correctIndex: 1,
      explanation: "Because `class` is a reserved keyword in JavaScript, JSX uses the camelCase attribute `className` instead."
    },
    {
      id: "q19",
      question: "What is the purpose of providing unique 'key' props to items in a mapped list?",
      options: [
        "To help React identify which items have changed, been added, or been removed in the list",
        "To apply custom CSS keyframe transitions to list items",
        "To automatically generate HTML ID tags for the items"
      ],
      correctIndex: 0,
      explanation: "Keys help React identify which items are added, updated, or removed, allowing it to reconcile mapped arrays efficiently."
    },
    {
      id: "q20",
      question: "Is it valid to declare a Hook conditional to an if statement block?",
      options: [
        "Yes, Hooks can be declared anywhere in any code block",
        "No, Hooks must always be declared unconditionally at the top level of the component",
        "Yes, but only in React development environments",
        "No, unless they are native hooks like useState"
      ],
      correctIndex: 1,
      explanation: "Hooks cannot be placed inside conditionals or loops, because React relies on the call order of Hooks across renders to associate state correctly."
    }
  ]
};

/**
 * Seeds the React Masterclass course into Firestore if it does not exist.
 */
export const seedDefaultCourse = async () => {
  try {
    const courseRef = doc(db, 'courses', REACT_MASTERCLASS_COURSE.id);
    const courseSnap = await getDoc(courseRef);
    if (!courseSnap.exists()) {
      await setDoc(courseRef, REACT_MASTERCLASS_COURSE);
      console.log("Successfully seeded React Masterclass course data!");
    } else {
      console.log("React Masterclass course already exists in Firestore.");
    }
  } catch (error) {
    console.error("Error seeding course data:", error);
  }
};

/**
 * Ensures a demo Admin account exists in Auth and Firestore on the fly.
 */
export const ensureDemoAdminExists = async (auth) => {
  const demoEmail = 'admin@globiva.com';
  const demoPassword = 'admin12345';
  
  try {
    // 1. Try to log in first
    const credential = await signInWithEmailAndPassword(auth, demoEmail, demoPassword);
    return credential.user;
  } catch (error) {
    // 2. If user doesn't exist, create them
    if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
      try {
        const credential = await createUserWithEmailAndPassword(auth, demoEmail, demoPassword);
        const user = credential.user;

        // Write Admin profile to Firestore
        const adminData = {
          role: 'admin',
          name: 'Deepak Sharma (Training Lead)',
          email: demoEmail,
          status: 'active',
          createdAt: new Date().toISOString()
        };
        await setDoc(doc(db, 'users', user.uid), adminData);

        // Auto-seed the React masterclass course so they don't see an empty screen
        await seedDefaultCourse();
        return user;
      } catch (createErr) {
        console.error("Error creating demo admin:", createErr);
        throw createErr;
      }
    }
    throw error;
  }
};

/**
 * Ensures a demo Employee account exists in Auth and Firestore, and has the course assigned.
 */
export const ensureDemoEmployeeExists = async (auth) => {
  const demoEmail = 'agent@globiva.com';
  const demoPassword = 'agent12345';

  try {
    // 1. Try to log in first
    const credential = await signInWithEmailAndPassword(auth, demoEmail, demoPassword);
    return credential.user;
  } catch (error) {
    // 2. If user doesn't exist, create them
    if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
      try {
        const credential = await createUserWithEmailAndPassword(auth, demoEmail, demoPassword);
        const user = credential.user;

        // Write Employee profile to Firestore
        const employeeData = {
          role: 'employee',
          name: 'Arun Kumar (QA Associate)',
          email: demoEmail,
          employeeId: 'GLB1001',
          department: 'Customer Support',
          status: 'active',
          createdAt: new Date().toISOString()
        };
        await setDoc(doc(db, 'users', user.uid), employeeData);

        // Auto-seed the React masterclass course
        await seedDefaultCourse();

        // Check if assignment exists, if not write it
        const assignmentId = 'demo-assignment-glb1001';
        const assignmentRef = doc(db, 'assignments', assignmentId);
        const assignmentSnap = await getDoc(assignmentRef);
        
        if (!assignmentSnap.exists()) {
          await setDoc(assignmentRef, {
            courseId: 'react-masterclass-v1',
            employeeId: user.uid,
            assignedBy: 'system',
            assignedAt: new Date().toISOString(),
            dueDate: null,
            status: 'pending'
          });
        }
        
        return user;
      } catch (createErr) {
        console.error("Error creating demo employee:", createErr);
        throw createErr;
      }
    }
    throw error;
  }
};
