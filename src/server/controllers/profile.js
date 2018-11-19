// Load Profile Model
const Profile = require("../models/profile");
const User = require("../models/user");

// Load Validation
const validateProfileInput = require("../validation/profile");
const validateExperienceInput = require("../validation/experience");
const validateEducationInput = require("../validation/education");


exports.currentUserProfile = (req, res) => {
  const errors = {};

  Profile.findOne({
      user: req.user.id
    })

    .then(profile => {
      if (!profile) {
        errors.noprofile = "There is no profile for this user";
        return res.status(404).json(errors);
      }
      res.json(profile);
    })
    .catch(err => res.status(404).json(err));
}


exports.allProfile = (req, res) => {
  const errors = {};

  Profile.find()
    .populate("user", ["name", "avatar"])
    .then(profile => {
      if (!profile) {
        errors.noprofile = "There is no profile";
        res.status(400).json(errors);
      }
      res.json(profile);
    })
    .catch(err =>
      res.status(400).json({
        profile: "There is no profile"
      })
    );
}


exports.getProfileByHandle = (req, res) => {
  const errors = {};

  Profile.findOne({
      handle: req.params.handle
    })
    .populate("user", ["name", "avatar"])
    .then(profile => {
      if (!profile) {
        errors.noprofile = "There is no profile for this user";
        res.status(400).json(errors);
      }
      res.json(profile);
    })
    .catch(err => res.status(400).json(err));
}


exports.getProfileByUserId = (req, res) => {
  const errors = {};

  Profile.findOne({
      user: req.params.user_id
    })
    .populate("user", ["name", "avatar"])
    .then(profile => {
      if (!profile) {
        errors.noprofile = "There is no profile for this user";
        res.status(400).json(errors);
      }
      res.json(profile);
    })
    .catch(err =>
      res.status(400).json({
        profile: "There is no profile for this user"
      })
    );
}


exports.createOrEditUserProfile = (req, res) => {
  const {
    errors,
    isValid
  } = validateProfileInput(req.body);

  // Check Validation
  if (!isValid) {
    // Return any errors with 400 status
    return res.status(400).json(errors);
  }

  // Get fields
  const profileFields = {};
  profileFields.user = req.user.id;
  if (req.body.handle) profileFields.handle = req.body.handle;
  if (req.body.company) profileFields.company = req.body.company;
  if (req.body.website) profileFields.website = req.body.website;
  if (req.body.location) profileFields.location = req.body.location;
  if (req.body.bio) profileFields.bio = req.body.bio;
  if (req.body.status) profileFields.status = req.body.status;
  if (req.body.githubusername)
    profileFields.githubusername = req.body.githubusername;
  // Skills - Spilt into array
  if (typeof req.body.skills !== "undefined") {
    profileFields.skills = req.body.skills.split(",");
  }

  // Social
  profileFields.social = {};
  if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
  if (req.body.twitter) profileFields.social.twitter = req.body.twitter;
  if (req.body.facebook) profileFields.social.facebook = req.body.facebook;
  if (req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
  if (req.body.email) profileFields.social.email = req.body.email;

  Profile.findOne({
    user: req.user.id
  }).then(profile => {
    if (profile) {
      // Update
      Profile.findOneAndUpdate({
        user: req.user.id
      }, {
        $set: profileFields
      }, {
        new: true
      }).then(profile => res.json(profile));
    } else {
      // Create

      // Check if handle exists
      Profile.findOne({
        handle: profileFields.handle
      }).then(profile => {
        if (profile) {
          errors.handle = "That handle already exists";
          res.status(400).json(errors);
        }

        // Save Profile
        new Profile(profileFields).save().then(profile => res.json(profile));
      });
    }
  });
}




exports.adduserExperience = (req, res) => {
  const {
    errors,
    isValid
  } = validateExperienceInput(req.body);

  // Check Validation
  if (!isValid) {
    // Return any errors with 400 status
    return res.status(400).json(errors);
  }

  Profile.findOne({
    user: req.user.id
  }).then(profile => {
    const newExp = {
      title: req.body.title,
      company: req.body.company,
      location: req.body.location,
      from: req.body.from,
      to: req.body.to,
      current: req.body.current,
      description: req.body.description
    };
    //Add to exp array
    profile.experience.unshift(newExp);

    profile.save().then(profile => res.json(profile));
  });
}




exports.addUserEducation = (req, res) => {
  const {
    errors,
    isValid
  } = validateEducationInput(req.body);

  // Check Validation
  if (!isValid) {
    // Return any errors with 400 status
    return res.status(400).json(errors);
  }

  Profile.findOne({
    user: req.user.id
  }).then(profile => {
    const newEdu = {
      school: req.body.school,
      degree: req.body.degree,
      fieldofstudy: req.body.fieldofstudy,
      from: req.body.from,
      to: req.body.to,
      current: req.body.current,
      description: req.body.description
    };
    //Add to exp array
    profile.education.unshift(newEdu);

    profile.save().then(profile => res.json(profile));
  });
}


exports.deleteExperience = (req, res) => {
  Profile.findOne({
      user: req.user.id
    })
    .then(profile => {
      //get remove index
      const removeIndex = profile.experience
        .map(item => item.id)
        .indexOf(req.params.exp_id);

      // splice experience array
      profile.experience.splice(removeIndex, 1);

      //Save
      profile.save().then(profile => res.json(profile));
    })
    .catch(err => res.status(404).json(err));
}


exports.deleteUserEducation = (req, res) => {
  Profile.findOne({
      user: req.user.id
    })
    .then(profile => {
      //get remove index
      const removeIndex = profile.education
        .map(item => item.id)
        .indexOf(req.params.edu_id);

      // splice experience array
      profile.education.splice(removeIndex, 1);

      //Save
      profile.save().then(profile => res.json(profile));
    })
    .catch(err => res.status(404).json(err));
}


exports.deleteUserProfile = (req, res) => {
  Profile.findOneAndRemove({
    user: req.user.id
  }).then(() => {
    User.findOneAndRemove({
      _id: req.user.id
    }).then(() =>
      res.json({
        Success: true
      })
    );
  });
}