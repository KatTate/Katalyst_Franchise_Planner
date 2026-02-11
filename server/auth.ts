import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import { storage } from "./storage";

declare module "express-session" {
  interface SessionData {
    impersonating_user_id?: string;
    impersonation_started_at?: string;
    return_brand_id?: string;
  }
}

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      role: "franchisee" | "franchisor" | "katalyst_admin";
      brandId: string | null;
      displayName: string | null;
      profileImageUrl: string | null;
      onboardingCompleted: boolean;
      preferredTier: "planning_assistant" | "forms" | "quick_entry" | null;
    }
  }
}

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.warn(
    "GOOGLE_CLIENT_ID and/or GOOGLE_CLIENT_SECRET not set — Google OAuth will not work until these are configured"
  );
}

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/api/auth/google/callback",
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(null, false, { message: "No email found in Google profile" });
          }

          const hd = (profile as any)._json?.hd;
          if (hd !== "katgroupinc.com" || !email.endsWith("@katgroupinc.com")) {
            return done(null, false, {
              message: "Only @katgroupinc.com accounts are allowed",
            });
          }

          const user = await storage.upsertUserFromGoogle({
            email,
            displayName: profile.displayName || email.split("@")[0],
            profileImageUrl: profile.photos?.[0]?.value || null,
          });

          return done(null, {
            id: user.id,
            email: user.email,
            role: user.role,
            brandId: user.brandId,
            displayName: user.displayName,
            profileImageUrl: user.profileImageUrl,
            onboardingCompleted: user.onboardingCompleted,
            preferredTier: user.preferredTier,
          });
        } catch (err) {
          return done(err as Error);
        }
      }
    )
  );
}

passport.use(
  new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      try {
        const user = await storage.getUserByEmail(email);
        if (!user || !user.passwordHash) {
          return done(null, false, { message: "Invalid email or password" });
        }
        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
          return done(null, false, { message: "Invalid email or password" });
        }
        return done(null, {
          id: user.id,
          email: user.email,
          role: user.role,
          brandId: user.brandId,
          displayName: user.displayName,
          profileImageUrl: user.profileImageUrl,
          onboardingCompleted: user.onboardingCompleted,
          preferredTier: user.preferredTier,
        });
      } catch (err) {
        return done(err as Error);
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
      profileImageUrl: user.profileImageUrl,
      onboardingCompleted: user.onboardingCompleted,
      preferredTier: user.preferredTier,
    });
  } catch (err) {
    done(err);
  }
});

export default passport;
