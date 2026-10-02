import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    dueDate: { type: Date, required: true },
  },
  { timestamps: true },
);

export default mongoose.model("Assignment", assignmentSchema);
