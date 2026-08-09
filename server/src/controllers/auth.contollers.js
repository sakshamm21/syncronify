// import jwt from "jsonwebtoken";
// import otpGenerator from "otp-generator";
// import sendEmail from "../services/mailerService.js";
// import crypto from "crypto";
// import filterObj from "../utils/filterObj.js";

// // Model
// // import User from "../models/user.model";
// const { GeneralUser, AdminUser, ApplicationAdminUser } = require("../models/userModel.js");
// import otp from "../templates/mail/otp.js";
// import resetPasswordMail from "../templates/mail/resetPasswordMail.js";
// // import { promisify } from "util";
// import catchAsync from "../utils/catchAsync.js";

// // this function will return you jwt token
// const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const sendEmail = require("../services/mailerService.js");
const crypto = require("crypto");
const filterObj = require("../utils/filterObj.js");

// Model
const { GeneralUser, AdminUser, ApplicationAdminUser } = require("../models/userModel.js");
const otp = require("../templates/mail/otp.js");
const resetPasswordMail = require("../templates/mail/resetPasswordMail.js");
const catchAsync = require("../utils/catchAsync.js");

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';


const signToken = (userId, userType) => {
  return jwt.sign(
    { userId, userType },
    JWT_SECRET,
    { expiresIn: '1d' } // Token expires in one day
  );
};



// Register New User

exports.register = catchAsync(async (req , res , next ) => {
  
  const { userName, email, password, userType } = req.body;

   // Check for the presence of all required fields
   if (!userName || !email || !password || !userType) {
    return res.status(400).json({
      status: "error",
      message: "All fields must be provided: userName, email, password, userType",
    });
  }

    let UserDiscriminator;

    switch (userType) {
        case 'genUser':
            UserDiscriminator = GeneralUser;
            break;
        case 'adminUser':
            UserDiscriminator = AdminUser;
            break;
        case 'applicationAdminUser':
            UserDiscriminator = ApplicationAdminUser;
            break;
        default:
            return res.status(400).json({
                status: "error",
                message: "Invalid user type specified",
            });
    }

  const filteredBody = filterObj(
    req.body,
    "userName",
    "email",
    "password",
    "userType"
  );

  // check if a verified user with given email exists

  const existing_user = await UserDiscriminator.findOne({ email: email });

  if (existing_user && existing_user.verified) {
    // user with this email already exists, Please login
    return res.status(400).json({
      status: "error",
      message: "Email already in use, Please login.",
    });
  } else if (existing_user) {
    // user exists but is not verified yet — update their details and resend OTP
    await UserDiscriminator.findOneAndUpdate({ email: email }, filteredBody, {
      new: true,
      validateModifiedOnly: true,
    });

    // generate an otp and send to email
    req.userId = existing_user._id;
    req.userType = existing_user.userType;
    next();
  } else {
    // if user is not created before than create a new one
    const new_user = await UserDiscriminator.create(filteredBody);

    // generate an otp and send to email
    req.userId = new_user._id;
    req.userType = new_user.userType;
    next();
  }
});

exports.sendOTP = catchAsync(async (req , res , next ) => {
    // Support both middleware-passed userId (register flow) and direct body payload (resend OTP flow)
    const { userId = req.userId, userType = req.userType } = req.body || {};

    if (!userId || !userType) {
      return res.status(400).json({
        status: "error",
        message: "userId and userType are required",
      });
    }

    let UserDiscriminator;

    switch (userType) {
        case 'genUser':
            UserDiscriminator = GeneralUser;
            break;
        case 'adminUser':
            UserDiscriminator = AdminUser;
            break;
        case 'applicationAdminUser':
            UserDiscriminator = ApplicationAdminUser;
            break;
        default:
            return res.status(400).json({
                status: "error",
                message: "Invalid user type specified",
            });
    }

    const new_otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        specialChars: false,
        lowerCaseAlphabets: false,
        digits: true,
    });
  
    const otp_expiry_time = Date.now() + 10 * 60 * 1000; // 10 Mins after otp is sent
  
    const user = await UserDiscriminator.findByIdAndUpdate(userId, {
      otp_expiry_time: otp_expiry_time,
    }, { new: true }); // Ensure that the updated document is returned
  
    // Check if user exists
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found.",
      });
    }
  
    user.otp = new_otp.toString();
  
    await user.save({ validateModifiedOnly: true });
  
    const mailDetails={
      email: user.email,
      subject:'Syncronify Registration Verification OTP',
      message:`Your OTP for registering to Syncronify is ${new_otp}`
    }

    // Email sending must NEVER crash the API. If SMTP is not configured or
    // unavailable, log the error and still respond successfully — the user
    // can retrieve the OTP via the resend flow / dev logs.
    let emailSkipped = false;
    try {
      const result = await sendEmail(mailDetails);
      emailSkipped = !!(result && result.skipped);
      if (!emailSkipped) console.log(`OTP email sent to ${user.email}`);
    } catch (emailError) {
      emailSkipped = true;
      console.error('Failed to send OTP email:', emailError.message || emailError);
    }

    const responseBody = {
      status: "success",
      message: "OTP Sent Successfully!",
      user: {
        userId,
        userType,
      },
    };

    // DEV-ONLY fallback: when no SMTP is configured, expose the OTP in the
    // response so the frontend can display it. NEVER do this in production.
    if (emailSkipped && process.env.NODE_ENV !== 'production') {
      responseBody.devOtp = new_otp.toString();
    }

    res.status(200).json(responseBody);
});
  

// exports.verifyOTP = catchAsync(async (req, res) => {
//   // verify otp and update user accordingly
//   const { email, otp } = req.body;
//   const user = await GeneralUser.findOne({
//     email,
//     otp_expiry_time: { $gt: Date.now() },
//   });

//   if (!user) {
//     return res.status(400).json({
//       status: "error",
//       message: "Email is invalid or OTP expired",
//     });
//   }

//   if (user.verified) {
//     return res.status(400).json({
//       status: "error",
//       message: "Email is already verified",
//     });
//   }

//   if (!(await user.correctOTP(otp, user.otp))) {
//     res.status(400).json({
//       status: "error",
//       message: "OTP is incorrect",
//     });

//     return;
//   }

//   // OTP is correct

//   user.verified = true;
//   user.otp = undefined;
//   await user.save({ new: true, validateModifiedOnly: true });

//   const token = signToken(user._id);

//   res.status(200).json({
//     status: "success",
//     message: "OTP verified Successfully!",
//     token,
//     user_id: user._id,
//   });
// });

exports.verifyOTP = catchAsync(async (req , res , next ) => {
  // verify otp and update user accordingly
  const { email, otp, userType } = req.body;

  let UserDiscriminator;

    switch (userType) {
        case 'genUser':
            UserDiscriminator = GeneralUser;
            break;
        case 'adminUser':
            UserDiscriminator = AdminUser;
            break;
        case 'applicationAdminUser':
            UserDiscriminator = ApplicationAdminUser;
            break;
        default:
            return res.status(400).json({
                status: "error",
                message: "Invalid user type specified",
            });
    }

  const user = await UserDiscriminator.findOne({
    email,
    otp_expiry_time: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({
      status: "error",
      message: "Email is invalid or OTP expired",
    });
  }

  if (user.verified) {
    return res.status(400).json({
      status: "error",
      message: "Email is already verified",
    });
  }

    if (!(await user.correctOTP(otp, user.otp || ""))) {
        res.status(400).json({
            status: "error",
            message: "OTP is incorrect",
        });

        return;
    }

    // OTP is correct

    user.verified = true;
    user.otp = undefined;
    await user.save({ validateModifiedOnly: true });

    const token = signToken(user._id, user.userType);

    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Set secure to true if in production (HTTPS)
    });
    
    // Send the rest of the response data in the response body
    res.status(200).json({
      status: "success",
      message: "OTP verified successfully!",
      user_id: user._id,
      userType: user.userType,
      token,
    });

});    

// User Login
exports.login = catchAsync(async (req , res , next ) => {
  const { email, password, userType } = req.body;

  let UserDiscriminator;

    switch (userType) {
        case 'genUser':
            UserDiscriminator = GeneralUser;
            break;
        case 'adminUser':
            UserDiscriminator = AdminUser;
            break;
        case 'applicationAdminUser':
            UserDiscriminator = ApplicationAdminUser;
            break;
        default:
            return res.status(400).json({
                status: "error",
                message: "Invalid user type specified",
            });
    }
  // console.log(email, password);

  if (!email || !password) {
    res.status(400).json({
      status: "error",
      message: "Both email and password are required",
    });
    return;
  }

  const user = await UserDiscriminator.findOne({ email: email }).select("+password");

  if (!user || !user.password || !(await user.correctPassword(password, user.password))) {
    // Same message for missing user and wrong password to avoid leaking which emails are registered
    return res.status(400).json({
      status: "error",
      message: "Email or password is incorrect",
    });
  }

  if (!user.verified) {
    return res.status(403).json({
      status: "error",
      message: "Email not verified. Please verify your email first.",
    });
  }

  const token = signToken(user._id, user.userType);

  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Set secure to true if in production (HTTPS)
  });
  
  // Send the rest of the response data in the response body
  res.status(200).json({
    status: "success",
    message: "Logged in successfully!",
    user_id: user._id,
    userType: user.userType,
    token,
  });
});

// Protect
// exports.protect = catchAsync(async (req, res, next) => {
//   // 1) Getting token and check if it's there
//   let token;
//   if (
//     req.headers.authorization &&
//     req.headers.authorization.startsWith("Bearer")
//   ) {
//     token = req.headers.authorization.split(" ")[1];
//   } else if (req.cookies.jwt) {
//     token = req.cookies.jwt;
//   }

//   if (!token) {
//       return res.status(401).json({
//           message: "You are not logged in! Please log in to get access.",
//       });
//   }
//   // 2) Verification of token
//   let decoded;
//     try {
//       decoded = jwt.verify(token, JWT_SECRET); // Assuming JWT_SECRET is defined in your environment variables
//     } catch (err) {
//       return res.status(401).json({
//         message: "Invalid token. Please log in again.",
//       });
//     }

//   console.log(decoded);

//   // 3) Check if user still exists

//   const this_user = await User.findById(decoded.userId);
//     if (!this_user) {
//       return res.status(401).json({
//         message: "The user belonging to this token does no longer exists.",
//       });
//     }
//     // 4) Check if user changed password after the token was issued
//     if (this_user.changedPasswordAfter(decoded.iat)) {
//       return res.status(401).json({
//         message: "User recently changed password! Please log in again.",
//       });
//     }

//     // GRANT ACCESS TO PROTECTED ROUTE
//     req.user = this_user;
//     next();
// });

exports.protectGeneralUser = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return res.status(401).json({
      message: 'You are not logged in! Please log in to get access.',
    });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return res.status(401).json({
      message: 'Invalid token. Please log in again.',
    });
  }

  if (!decoded.userId || decoded.userType !== 'genUser') {
    return res.status(403).json({
      message: 'You do not have permission to perform this action.',
    });
  }

  const currentUser = await GeneralUser.findById(decoded.userId);
  if (!currentUser) {
    return res.status(401).json({
      message: 'The user belonging to this token no longer exists.',
    });
  }

  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return res.status(401).json({
      message: 'User recently changed password! Please log in again.',
    });
  }

  req.user = {
    userId: currentUser._id.toString(), // Assuming _id is available and needs conversion to string
    userType: currentUser.userType,
  };

  next();
};

exports.protectAdminUser = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return res.status(401).json({
      message: 'You are not logged in! Please log in to get access.',
    });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return res.status(401).json({
      message: 'Invalid token. Please log in again.',
    });
  }

  if (!decoded.userId || decoded.userType !== 'adminUser') {
    return res.status(403).json({
      message: 'You do not have permission to perform this action.',
    });
  }

  const currentUser = await AdminUser.findById(decoded.userId);
  if (!currentUser) {
    return res.status(401).json({
      message: 'The user belonging to this token no longer exists.',
    });
  }

  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return res.status(401).json({
      message: 'User recently changed password! Please log in again.',
    });
  }

  req.user = {
    userId: currentUser._id.toString(), // Assuming _id is available and needs conversion to string
    userType: currentUser.userType,
  };

  next();
};


exports.protectApplicationAdminUser = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return res.status(401).json({
      message: 'You are not logged in! Please log in to get access.',
    });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return res.status(401).json({
      message: 'Invalid token. Please log in again.',
    });
  }

  if (!decoded.userId || decoded.userType !== 'applicationAdminUser') {
    return res.status(403).json({
      message: 'You do not have permission to perform this action.',
    });
  }

  const currentUser = await ApplicationAdminUser.findById(decoded.userId);
  if (!currentUser) {
    return res.status(401).json({
      message: 'The user belonging to this token no longer exists.',
    });
  }

  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return res.status(401).json({
      message: 'User recently changed password! Please log in again.',
    });
  }

  req.user = {
    userId: currentUser._id.toString(), // Assuming _id is available and needs conversion to string
    userType: currentUser.userType,
  };

  next();
};


exports.forgotPassword = catchAsync(async (req , res , next ) => {
  // 1) Get user based on POSTed email
  const { email, userType } = req.body;
  let UserDiscriminator;

    switch (userType) {
        case 'genUser':
            UserDiscriminator = GeneralUser;
            break;
        case 'adminUser':
            UserDiscriminator = AdminUser;
            break;
        case 'applicationAdminUser':
            UserDiscriminator = ApplicationAdminUser;
            break;
        default:
            return res.status(400).json({
                status: "error",
                message: "Invalid user type specified",
            });
    }

  const user = await UserDiscriminator.findOne({ email: email });
  if (!user) {
    return res.status(404).json({
      status: "error",
      message: "There is no user with email address.",
    });
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email
  try {
    const resetURL = `http://localhost:3000/auth/new-password?token=${resetToken}`;

    await sendEmail({
      from: "adityajohri2015@gmail.com",
      to: user.email,
      subject: "Reset Password",
      html: resetPasswordMail(user.firstName, resetURL),
      attachments: [],
    });

    res.status(200).json({
      status: "success",
      message: "Token sent to email!",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return res.status(500).json({
      message: "There was an error sending the email. Try again later!",
    });
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const {password, userType, token: rawToken} = req.body;

  if (!rawToken || !password) {
    return res.status(400).json({
      status: "error",
      message: "Token and password are required",
    });
  }

  let UserDiscriminator;

    switch (userType) {
        case 'genUser':
            UserDiscriminator = GeneralUser;
            break;
        case 'adminUser':
            UserDiscriminator = AdminUser;
            break;
        case 'applicationAdminUser':
            UserDiscriminator = ApplicationAdminUser;
            break;
        default:
            return res.status(400).json({
                status: "error",
                message: "Invalid user type specified",
            });
    }

  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  const user = await UserDiscriminator.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return res.status(400).json({
      status: "error",
      message: "Token is Invalid or Expired",
    });
  }
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) Update changedPasswordAt property for the user
  // 4) Log the user in, send JWT
  const token = signToken(user._id, user.userType);

  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Set secure to true if in production (HTTPS)
  });
  
  // Send the rest of the response data in the response body
  res.status(200).json({
    status: "success",
    message: "Password reset successfully!",
    // Optionally, include other user details as needed but exclude sensitive information
  });
});


exports.logout = catchAsync(async (req, res) => {
  // Clear the jwt cookie
  res.clearCookie('jwt', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
  });

  res.status(200).json({
    status: "success",
    message: "You have been logged out successfully.",
  });
});
