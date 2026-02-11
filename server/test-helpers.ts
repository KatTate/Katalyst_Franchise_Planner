import express from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";

export function createTestApp() {
  const app = express();
  app.use(express.json());
  app.use(
    session({
      secret: "test-secret",
      resave: false,
      saveUninitialized: false,
    })
  );

  passport.use(
    "test-local",
    new LocalStrategy(
      { usernameField: "email" },
      (_email, _password, done) => done(null, false)
    )
  );

  passport.serializeUser((user: any, done) => done(null, user.id));
  passport.deserializeUser((id: string, done) => {
    done(null, (app as any).__testUsers?.[id] || null);
  });

  app.use(passport.initialize());
  app.use(passport.session());

  (app as any).__testUsers = {};
  return app;
}

export function loginAs(
  app: express.Express,
  user: Express.User
) {
  (app as any).__testUsers[user.id] = user;

  app.use("/test-login", (req, _res, next) => {
    req.login(user, () => next());
  });
}

export function createMockUser(overrides: Partial<Express.User> = {}): Express.User {
  return {
    id: "test-user-1",
    email: "test@katgroupinc.com",
    role: "katalyst_admin",
    brandId: null,
    displayName: "Test Admin",
    profileImageUrl: null,
    onboardingCompleted: true,
    preferredTier: null,
    ...overrides,
  };
}
