const mongoose = require('mongoose');

const familySchema = new mongoose.Schema({
  head: {
    name: String,
    dob: String,
    phone: String,
    address: String,
    photo: { type: Buffer },
    photoContentType: { type: String }
  },
  spouse: {
    name: String,
    dob: String,
    phone: String,
    address: String,
    photo: { type: Buffer },
    photoContentType: { type: String }
  },
  father: {
    name: String,
    dob: String,
    phone: String,
    address: String,
    photo: { type: Buffer },
    photoContentType: { type: String }
  },
  mother: {
    name: String,
    dob: String,
    phone: String,
    address: String,
    photo: { type: Buffer },
    photoContentType: { type: String }
  },
  fatherInLaw: {
    name: String,
    dob: String,
    phone: String,
    address: String,
    photo: { type: Buffer },
    photoContentType: { type: String }
  },
  motherInLaw: {
    name: String,
    dob: String,
    phone: String,
    address: String,
    photo: { type: Buffer },
    photoContentType: { type: String }
  },
  sons: [{
    name: String,
    dob: String,
    phone: String,
    address: String,
    photo: { type: Buffer },
    photoContentType: { type: String }
  }],
  daughters: [{
    name: String,
    dob: String,
    phone: String,
    address: String,
    photo: { type: Buffer },
    photoContentType: { type: String }
  }]
});

const Family = mongoose.model('Family', familySchema);  // Define the Family model
