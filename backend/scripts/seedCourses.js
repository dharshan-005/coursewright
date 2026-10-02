import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";
import Course from "../models/Course.js";
import Lesson from "../models/Lesson.js";

const courseSeeds = [
  {
    title: "Python Tutorial",
    category: "Programming",
    description:
      "Learn Python fundamentals, from syntax and variables to functions and practical programs.",
    lessons: [
      [
        "Python Setup and First Program",
        "Install Python, use the interactive shell, and write your first program with print().",
      ],
      [
        "Variables and Data Types",
        "Work with names, numbers, strings, booleans, and type conversion.",
      ],
      [
        "Conditions, Loops, and Functions",
        "Control program flow with if statements and loops, then organize code with functions.",
      ],
    ],
  },
  {
    title: "Agentic AI Tutorial",
    category: "Artificial Intelligence",
    description:
      "Explore AI agents, tools, planning, memory, and responsible agent workflows.",
    lessons: [
      [
        "What Is an AI Agent?",
        "Learn how agents use models, instructions, tools, and feedback to complete tasks.",
      ],
      [
        "Tools and Actions",
        "Connect an agent to useful tools and understand how it chooses and invokes actions.",
      ],
      [
        "Planning, Memory, and Safety",
        "Explore task planning, useful memory, human oversight, and safe limits for agents.",
      ],
    ],
  },
  {
    title: "Data Structures Tutorial",
    category: "Computer Science",
    description: "Understand common data structures and when to use them.",
    lessons: [
      [
        "Arrays and Strings",
        "Store ordered data and learn common operations such as searching and iteration.",
      ],
      [
        "Stacks, Queues, and Linked Lists",
        "Compare these structures and practice inserting, removing, and accessing values.",
      ],
      [
        "Trees, Hash Tables, and Big O",
        "Explore efficient lookup structures and reason about algorithm performance.",
      ],
    ],
  },
  {
    title: "Java Tutorial",
    category: "Programming",
    description:
      "Learn Java syntax, object-oriented programming, collections, and exceptions.",
    lessons: [
      [
        "Java Setup and Syntax",
        "Create a Java project and learn its main method, statements, and basic syntax.",
      ],
      [
        "Types, Variables, and Control Flow",
        "Use Java types, variables, conditionals, and loops.",
      ],
      [
        "Classes and Objects",
        "Model data and behavior with classes, constructors, and methods.",
      ],
    ],
  },
  {
    title: "JavaScript Tutorial",
    category: "Programming",
    description: "Build a strong foundation in JavaScript for web development.",
    lessons: [
      [
        "Introduction to JavaScript",
        "Learn where JavaScript runs and write your first statements and expressions.",
      ],
      [
        "Variables and Data Types",
        "Use let and const with strings, numbers, booleans, null, and undefined.",
      ],
      [
        "Functions, Arrays, and Objects",
        "Write reusable functions and organize related data in arrays and objects.",
      ],
    ],
  },
  {
    title: "C Tutorial",
    category: "Programming",
    description:
      "Learn C programming, memory basics, functions, arrays, and pointers.",
    lessons: [
      [
        "C Setup and First Program",
        "Compile and run a small C program and understand its basic structure.",
      ],
      [
        "Variables, Types, and Operators",
        "Work with C data types, declarations, arithmetic, and comparisons.",
      ],
      [
        "Functions, Arrays, and Pointers",
        "Use functions and arrays, then learn how pointers refer to memory.",
      ],
    ],
  },
  {
    title: "C++ Tutorial",
    category: "Programming",
    description:
      "Learn modern C++ fundamentals, classes, containers, and resource management.",
    lessons: [
      [
        "C++ Setup and Fundamentals",
        "Compile a C++ program and practice variables, types, and expressions.",
      ],
      [
        "Functions, References, and Classes",
        "Organize code with functions and model objects with classes.",
      ],
      [
        "STL Containers and Algorithms",
        "Use vectors, maps, and standard algorithms to work with collections.",
      ],
    ],
  },
  {
    title: "DBMS Tutorial",
    category: "Database",
    description:
      "Understand relational databases, SQL, normalization, and transactions.",
    lessons: [
      [
        "Database Fundamentals",
        "Learn tables, records, keys, and how a DBMS stores related information.",
      ],
      [
        "SQL Queries and Joins",
        "Read and change data with SELECT, INSERT, UPDATE, DELETE, and JOIN.",
      ],
      [
        "Normalization and Transactions",
        "Reduce duplicate data and understand reliable multi-step transactions.",
      ],
    ],
  },
  {
    title: "HTML Tutorial",
    category: "Web Development",
    description:
      "Learn semantic HTML and build the structure of accessible web pages.",
    lessons: [
      [
        "HTML Document Structure",
        "Create a valid page with headings, paragraphs, links, and semantic sections.",
      ],
      [
        "Links, Images, and Lists",
        "Add navigation, images with useful alt text, and ordered or unordered lists.",
      ],
      [
        "Forms and Accessible HTML",
        "Build forms with labels and choose semantic elements that support accessibility.",
      ],
    ],
  },
  {
    title: "Operating System (OS) Tutorial",
    category: "Computer Science",
    description:
      "Study operating system concepts including processes, memory, files, and scheduling.",
    lessons: [
      [
        "OS Fundamentals and Processes",
        "Learn the role of an operating system and how processes run.",
      ],
      [
        "Memory and File Systems",
        "Explore memory management, virtual memory, files, and directories.",
      ],
      [
        "Scheduling and Concurrency",
        "Understand CPU scheduling, threads, synchronization, and common race conditions.",
      ],
    ],
  },
];

async function run() {
  await connectDB();

  const preferredEmail =
    process.env.SEED_INSTRUCTOR_EMAIL?.trim().toLowerCase();
  let instructor = preferredEmail
    ? await User.findOne({ email: preferredEmail, isActive: true })
    : null;

  if (preferredEmail && !instructor) {
    throw new Error(
      `No active user found for SEED_INSTRUCTOR_EMAIL=${preferredEmail}`,
    );
  }

  if (!instructor) {
    instructor = await User.findOne({ role: "instructor", isActive: true });
  }

  if (!instructor) {
    instructor = await User.findOne({ role: "admin", isActive: true });
  }

  if (!instructor) {
    throw new Error(
      "No active instructor or admin found. Create an account first, or run npm run seed:admin.",
    );
  }

  for (const seed of courseSeeds) {
    const course = await Course.findOneAndUpdate(
      { title: seed.title, instructor: instructor._id },
      {
        $set: {
          description: seed.description,
          category: seed.category,
          thumbnail: "",
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );

    for (const [index, [title, content]] of seed.lessons.entries()) {
      await Lesson.findOneAndUpdate(
        { course: course._id, title },
        {
          $set: {
            content,
            order: index + 1,
            videoUrl: "",
          },
        },
        { new: true, upsert: true, setDefaultsOnInsert: true },
      );
    }

    console.log(`Seeded: ${seed.title} (${seed.lessons.length} lessons)`);
  }

  console.log(
    `Finished seeding courses and lessons to database "${mongoose.connection.name}".`,
  );
}

run()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
