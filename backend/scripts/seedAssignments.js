import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import Course from "../models/Course.js";
import Assignment from "../models/Assignment.js";

const assignmentSeeds = [
  {
    course: "Python Tutorial",
    title: "Build a Command-Line Calculator",
    description:
      "Write a Python program that asks for two numbers and an operation, performs the calculation, and displays the result. Handle division by zero.",
  },
  {
    course: "Agentic AI Tutorial",
    title: "Plan an AI Agent Workflow",
    description:
      "Describe a small task an AI agent could perform. Identify its goal, the tools it needs, the steps it should follow, and where a human should review its work.",
  },
  {
    course: "Data Structures Tutorial",
    title: "Count Word Frequencies",
    description:
      "Write a program that counts how many times each word appears in a paragraph. Explain which data structure you chose and why.",
  },
  {
    course: "Java Tutorial",
    title: "Create a Bank Account Class",
    description:
      "Create a Java BankAccount class with an owner, balance, deposit method, and withdraw method. Prevent withdrawals that exceed the available balance.",
  },
  {
    course: "JavaScript Tutorial",
    title: "Build a Form Validator",
    description:
      "Write JavaScript that checks a form's name and email fields before submission. Show a useful error message when either value is missing or invalid.",
  },
  {
    course: "C Tutorial",
    title: "Calculate a Class Average",
    description:
      "Write a C program that reads several grades into an array, calculates their average, and prints the highest and lowest grade.",
  },
  {
    course: "C++ Tutorial",
    title: "Build a Library Catalog",
    description:
      "Use a C++ vector to store book titles. Add options to list the books, add a book, and search for a title.",
  },
  {
    course: "DBMS Tutorial",
    title: "Design a Course Registration Database",
    description:
      "Propose tables for students, courses, and enrollments. Identify primary and foreign keys, then write a query that lists each student and their courses.",
  },
  {
    course: "HTML Tutorial",
    title: "Create a Semantic Portfolio Page",
    description:
      "Build a single-page portfolio using semantic HTML. Include a header, navigation, about section, project list, and contact form with labels.",
  },
  {
    course: "Operating System (OS) Tutorial",
    title: "Compare CPU Scheduling Strategies",
    description:
      "Using three sample processes, compare FCFS and Round Robin scheduling. Show the execution order and explain which strategy gives the better response time for your example.",
  },
];

async function run() {
  await connectDB();

  const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  for (const seed of assignmentSeeds) {
    const course = await Course.findOne({ title: seed.course });

    if (!course) {
      console.warn(
        `Skipped "${seed.title}": course "${seed.course}" was not found.`,
      );
      continue;
    }

    await Assignment.findOneAndUpdate(
      { course: course._id, title: seed.title },
      {
        $set: {
          description: seed.description,
          dueDate,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    console.log(`Seeded assignment: ${seed.title}`);
  }

  console.log(
    `Finished seeding assignments to database "${mongoose.connection.name}".`,
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
