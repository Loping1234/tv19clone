import mongoose from "mongoose";

const teamMemberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  description: { type: String, default: "" },
  imageUrl: { type: String, default: "" },
  status: { type: Boolean, default: true },
}, { timestamps: true });

const TeamMember = mongoose.model("TeamMember", teamMemberSchema);

export default TeamMember;
