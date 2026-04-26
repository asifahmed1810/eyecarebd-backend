import mongoose from "mongoose";

const testResultSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    testType: {
      type: String,
      enum: ["vision", "color", "pressure"],
      required: true,
    },
    score: Number,
    result: String,
  },
  { timestamps: true }
);

export const TestResult = mongoose.model("TestResult", testResultSchema);