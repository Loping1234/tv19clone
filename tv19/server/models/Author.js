import mongoose from 'mongoose';

const authorSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  role:        { type: String, default: 'author', trim: true },
  email:       { type: String, default: '', trim: true },
  designation: { type: String, default: '', trim: true },
  bio:         { type: String, default: '', trim: true },
  location:    { type: String, default: '', trim: true },
  imageUrl:    { type: String, default: '' },
  status:      { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('Author', authorSchema);
