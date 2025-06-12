import { Code, Play, Book, Zap } from "lucide-react";

export const topicsData = [
  {
    id: "typescript-basics",
    title: "TypeScript Basics",
    icon: Code,
    snippets: [
      {
        id: "variables-types",
        title: "Variables and Type Annotations",
        explanation: "TypeScript adds static type checking to JavaScript. Let's explore type annotations and basic data types.",
        code: `// Type annotations for variables
let name: string = "Alice";
const age: number = 25;
let isStudent: boolean = true;

// Arrays with type annotations
let numbers: number[] = [1, 2, 3, 4, 5];
let fruits: string[] = ["apple", "banana", "orange"];

// Object with type annotation
let person: { name: string; age: number; city: string } = {
  name: "Bob",
  age: 30,
  city: "New York"
};

console.log("Name:", name);
console.log("Age:", age);
console.log("Is Student:", isStudent);
console.log("Numbers:", numbers);
console.log("Person:", person);`,
        language: "typescript"
      },
      {
        id: "interfaces-functions",
        title: "Interfaces and Typed Functions",
        explanation: "Interfaces define the shape of objects, and we can add types to function parameters and return values.",
        code: `// Interface definition
interface User {
  id: number;
  name: string;
  email: string;
  isActive?: boolean; // Optional property
}

// Typed function with interface
function createUser(name: string, email: string): User {
  return {
    id: Math.floor(Math.random() * 1000),
    name,
    email,
    isActive: true
  };
}

// Arrow function with types
const greetUser = (user: User): string => {
  return \`Hello, \${user.name}! Your email is \${user.email}\`;
};

// Using the functions
const newUser = createUser("John Doe", "john@example.com");
console.log("Created user:", newUser);
console.log(greetUser(newUser));`,
        language: "typescript"
      },
      {
        id: "generics-unions",
        title: "Generics and Union Types",
        explanation: "Generics provide flexibility while maintaining type safety, and union types allow variables to be one of several types.",
        code: `// Generic function
function getFirstItem<T>(items: T[]): T | undefined {
  return items.length > 0 ? items[0] : undefined;
}

// Union types
type Status = "pending" | "completed" | "failed";
type ID = string | number;

interface Task {
  id: ID;
  title: string;
  status: Status;
}

// Using generics and union types
const stringArray = ["hello", "world", "typescript"];
const numberArray = [1, 2, 3, 4, 5];

const firstString = getFirstItem(stringArray);
const firstNumber = getFirstItem(numberArray);

console.log("First string:", firstString);
console.log("First number:", firstNumber);

// Creating tasks with union types
const tasks: Task[] = [
  { id: 1, title: "Learn TypeScript", status: "completed" },
  { id: "abc", title: "Build an app", status: "pending" }
];

console.log("Tasks:", tasks);`,
        language: "typescript"
      }
    ]
  },
  {
    id: "dom-manipulation",
    title: "DOM Manipulation",
    icon: Play,
    snippets: [
      {
        id: "dom-basics",
        title: "DOM Selection and Manipulation",
        explanation: "The Document Object Model (DOM) allows us to interact with HTML elements. Note: This won't work in this demo environment, but shows the syntax.",
        code: `// Selecting elements (demo syntax)
// const element = document.getElementById('myId');
// const elements = document.querySelectorAll('.myClass');

// Creating and modifying elements
const demoElement = {
  textContent: "Hello World",
  style: { color: "blue" },
  classList: { add: () => {}, remove: () => {} }
};

// Simulating DOM manipulation
console.log("Original text:", demoElement.textContent);
demoElement.textContent = "Hello JavaScript!";
console.log("Modified text:", demoElement.textContent);

// Simulating style changes
demoElement.style.color = "red";
console.log("New color:", demoElement.style.color);`,
        language: "javascript"
      },
      {
        id: "event-handling",
        title: "Event Handling",
        explanation: "Events allow us to respond to user interactions. Here's how event listeners work in JavaScript.",
        code: `// Event handling simulation
const button = {
  addEventListener: function(event, callback) {
    console.log(\`Event listener added for: \${event}\`);
    // Simulate the event being triggered
    setTimeout(() => {
      console.log(\`\${event} event triggered!\`);
      callback();
    }, 1000);
  }
};

// Adding event listeners
button.addEventListener('click', function() {
  console.log('Button was clicked!');
});

button.addEventListener('mouseover', () => {
  console.log('Mouse is over the button');
});

console.log("Event listeners set up. Events will trigger in 1 second...");`,
        language: "javascript"
      }
    ]
  },
  {
    id: "async-programming",
    title: "Async Programming",
    icon: Zap,
    snippets: [
      {
        id: "promises",
        title: "Promises",
        explanation: "Promises help us handle asynchronous operations. They represent a value that may be available now, later, or never.",
        code: `// Creating a simple promise
const fetchData = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const success = Math.random() > 0.3;
      if (success) {
        resolve("Data fetched successfully!");
      } else {
        reject("Failed to fetch data");
      }
    }, 1000);
  });
};

// Using the promise
console.log("Fetching data...");
fetchData()
  .then(data => {
    console.log("Success:", data);
  })
  .catch(error => {
    console.log("Error:", error);
  });

console.log("Promise created - waiting for result...");`,
        language: "javascript"
      },
      {
        id: "async-await",
        title: "Async/Await",
        explanation: "Async/await makes working with promises more readable by allowing us to write asynchronous code that looks synchronous.",
        code: `// Async function with await
async function fetchUserData() {
  try {
    console.log("Starting async operation...");
    
    // Simulate API call
    const userData = await new Promise(resolve => {
      setTimeout(() => {
        resolve({
          id: 1,
          name: "John Doe",
          email: "john@example.com"
        });
      }, 800);
    });
    
    console.log("User data received:", userData);
    return userData;
  } catch (error) {
    console.log("Error:", error);
  }
}

// Call the async function
fetchUserData();
console.log("Async function called - execution continues...");`,
        language: "javascript"
      }
    ]
  },
  {
    id: "array-methods",
    title: "Array Methods",
    icon: Book,
    snippets: [
      {
        id: "array-basics",
        title: "Essential Array Methods",
        explanation: "Arrays come with many useful methods for manipulation and transformation. Let's explore the most common ones.",
        code: `const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// Filter - get only even numbers
const evenNumbers = numbers.filter(num => num % 2 === 0);
console.log("Even numbers:", evenNumbers);

// Map - double each number
const doubledNumbers = numbers.map(num => num * 2);
console.log("Doubled numbers:", doubledNumbers);

// Reduce - sum all numbers
const sum = numbers.reduce((total, num) => total + num, 0);
console.log("Sum of all numbers:", sum);

// Find - get first number greater than 5
const firstLarge = numbers.find(num => num > 5);
console.log("First number > 5:", firstLarge);`,
        language: "javascript"
      },
      {
        id: "advanced-arrays",
        title: "Advanced Array Operations",
        explanation: "More complex array operations including chaining methods and working with objects in arrays.",
        code: `const users = [
  { name: "Alice", age: 25, city: "New York" },
  { name: "Bob", age: 30, city: "London" },
  { name: "Charlie", age: 35, city: "Tokyo" },
  { name: "Diana", age: 28, city: "New York" }
];

// Chaining methods - get names of users over 27 in uppercase
const result = users
  .filter(user => user.age > 27)
  .map(user => user.name.toUpperCase())
  .sort();

console.log("Filtered and transformed users:", result);

// Group by city
const groupedByCity = users.reduce((groups, user) => {
  const city = user.city;
  if (!groups[city]) {
    groups[city] = [];
  }
  groups[city].push(user.name);
  return groups;
}, {});

console.log("Users grouped by city:", groupedByCity);`,
        language: "javascript"
      }
    ]
  }
];
