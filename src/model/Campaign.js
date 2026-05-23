import mongoose from "mongoose";

const campaignSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    description: {
      type: String,
      required: true,
    },

    targetAmount: {
      type: Number,
      required: true,
      min: 1,
    },

    raisedAmount: {
      type: Number,
      default: 0,
    },

    media: [
      {
        url: {
          type: String,
          required: true,
        },
        publicID: {
          type: String,
          required: true,
        }
      }
    ],

    status: {
      type: String,
      enum: ["draft", "active", "completed", "paused"],
      default: "draft",
    },

    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);


campaignSchema.virtual("progress").get(function () {
  if (!this.targetAmount || this.targetAmount === 0) return 0;
  return Math.min(
    Math.round((this.raisedAmount / this.targetAmount) * 100),
    100
  );
});

// Ensure virtuals are included in JSON
campaignSchema.set("toJSON", { virtuals: true });
campaignSchema.set("toObject", { virtuals: true });

export default mongoose.models.Campaign ||
  mongoose.model("Campaign", campaignSchema);
