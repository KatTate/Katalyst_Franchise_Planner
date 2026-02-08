import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import { storage } from "./storage";
import type { User } from "@shared/schema";

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      role: "franchisee" | "franchisor" | "katalyst_admin";
      brandId: string | null;
      displayName: string | null;
      onboardingCompleted: boolean;
      preferredTier: "story" | "normal" | "expert" | null;
    }
  }
}

export const BCRYPT_COST_FACTOR = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_COST_FACTOR);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

passport.use(
  new LocalStrategy(
    { usernameField: "email", passwordField: "password" },
    async (email, password, done) => {
      try {
        const user = await storage.getUserByEmail(email);
        if (!user) {
          return done(null, false, { message: "Invalid email or password." });
        }

        const isValid = await comparePassword(password, user.passwordHash);
        if (!isValid) {
          return done(null, false, { message: "Invalid email or password." });
        }

        return done(null, {
          id: user.id,
          email: user.email,
          role: user.role,
          brandId: user.brandId,
          displayName: user.displayName,
          onboardingCompleted: user.onboardingCompleted,
          preferredTier: user.preferredTier,
        });
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.serializeUser((user: Express.User, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await storage.getUser(id);
    if (!user) {
      return done(null, false);
    }
    done(null, {
      id: user.id,
      email: user.email,
      role: user.role,
      brandId: user.brandId,
      displayName: user.displayName,
      onboardingCompleted: user.onboardingCompleted,
      preferredTier: user.preferredTier,
    });
  } catch (err) {
    done(err);
  }
});

export default passport;
