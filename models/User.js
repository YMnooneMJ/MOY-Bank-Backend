import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true, // Remove whitespace from both ends of the string
    },

    username: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: function (v) {
          return /^[a-zA-Z0-9]{3,20}$/.test(v); // Validates that the username is alphanumeric and between 3 to 20 characters
        },
        message: (props) =>
          `${props.value} is not a valid username! It should be alphanumeric and between 3 to 20 charcaters.`,
      },
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    dateOfBirth: {
      type: Date,
      required: true,
      trim: true,
      // Validate that the user is at least 18 years old
      validate: {
        validator: function (v) {
          const ageInMs = Date.now() - new Date(v).getTime();
          const ageInYears = ageInMs / (1000 * 60 * 60 * 24 * 365.25);
          return ageInYears >= 18;
        },
        message: () => `User must be at least 18 years old.`,
      },
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false, // Exclude password from queries by default
    },

    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      validate: {
        validator: function (v) {
          return /\d{10}$/.test(v); // validates that the phone number is a 10-digit number
        },
        message: (props) => `${props.value} is not a valid phone number!`,
      },
    },

    // For password reset
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },

    avatar: {
      type: String,
      default: "", // or default image path
    },

    accountNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      validate: {
        validator: function (v) {
          return /\d{10}$/.test(v); // validates that the account number is a 10-digit number
        },
        message: (props) => `${props.value} is not a valid account number!`,
      },
    },

    balance: {
      type: Number,
      default: 0, // Default balance is set to 0
    },

    role: {
      type: String,
      enum: ["user", "admin"], // Role can be either 'user' or 'admin'
      default: "user", // Default role is set to 'user
    },

    isActive: {
      type: Boolean,
      default: true, // Default isctive status is true
      select: false, // Exclude isActive from queries by default
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt fields
  }
);

export default mongoose.model("User", userSchema);
// This schema defines a User model with various fields and validations
// for user registration and management in a banking application.
