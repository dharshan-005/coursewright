import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
  {
    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: { type: String, default: "" },
    fileUrl: { type: String, default: "" },
    status: {
      type: String,
      enum: ["Pending", "Submitted", "Graded"],
      default: "Submitted",
    },
    grade: { type: String, default: "" },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

submissionSchema.index({ assignment: 1, student: 1 }, { unique: true });

export default mongoose.model("Submission", submissionSchema);
