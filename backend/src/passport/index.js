import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../models/apps/auth/user.models.js";
import { UserLoginType, UserRolesEnum } from "../constants.js";
import { ApiError } from "../utils/ApiError.js";


try {
  passport.serializeUser((user, next) => {
    next(null, user._id);
  });

  passport.deserializeUser(async (id, next) => {
    try {
      const user = await User.findById(id);
      if (user) next(null, user); // return user of exist
      else next(new ApiError(404, "User does not exist"), null); // throw an error if user does not exist
    } catch (error) {
      next(
        new ApiError(
          500,
          "Something went wrong while deserializing the user. Error: " + error
        ),
        null
      );
    }
  });

} catch (error) {
  console.error("PASSPORT ERROR: ", error);
}
