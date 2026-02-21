import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";
import request from "supertest";

vi.mock("../storage", () => ({
  storage: {
    getBrand: vi.fn(),
    getFddIngestionRuns: vi.fn(),
    getFddIngestionRun: vi.fn(),
    createFddIngestionRun: vi.fn(),
    updateFddIngestionRun: vi.fn(),
    updateBrandParameters: vi.fn(),
    updateStartupCostTemplate: vi.fn(),
    getUser: vi.fn(),
  },
}));

vi.mock("../services/fdd-ingestion-service", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../services/fdd-ingestion-service")>();
  return {
    ...actual,
    runFddExtraction: vi.fn(),
    retryFddExtraction: vi.fn(),
  };
});

import { storage } from "../storage";
import fddIngestionRouter from "./fdd-ingestion";
import { runFddExtraction, retryFddExtraction } from "../services/fdd-ingestion-service";

const adminUser: Express.User = {
  id: "a1",
  email: "admin@katgroupinc.com",
  role: "katalyst_admin",
  brandId: null,
  displayName: "Admin",
  profileImageUrl: null,
  onboardingCompleted: true,
  preferredTier: null,
};

const franchiseeUser: Express.User = {
  id: "f1",
  email: "franchisee@test.com",
  role: "franchisee",
  brandId: "b1",
  displayName: "Franchisee",
  profileImageUrl: null,
  onboardingCompleted: true,
  preferredTier: null,
};

function createApp(user?: Express.User) {
  const app = express();
  app.use(express.json());
  app.use((req: any, _res: any, next: any) => {
    if (user) {
      req.user = user;
      req.isAuthenticated = () => true;
      req.session = {};
    } else {
      req.isAuthenticated = () => false;
    }
    next();
  });
  app.use("/api/brands", fddIngestionRouter);
  return app;
}

const mockBrand = {
  id: "b1",
  name: "TestBrand",
  slug: "testbrand",
  brandParameters: null,
  startupCostTemplate: [],
};

describe("FDD Ingestion Routes", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("GET /:brandId/fdd-ingestion/runs", () => {
    it("returns 401 when not authenticated", async () => {
      const app = createApp();
      const res = await request(app).get("/api/brands/b1/fdd-ingestion/runs");
      expect(res.status).toBe(401);
    });

    it("returns 403 for non-admin user", async () => {
      const app = createApp(franchiseeUser);
      const res = await request(app).get("/api/brands/b1/fdd-ingestion/runs");
      expect(res.status).toBe(403);
    });

    it("returns 404 when brand not found", async () => {
      (storage.getBrand as any).mockResolvedValue(undefined);
      const app = createApp(adminUser);
      const res = await request(app).get("/api/brands/b1/fdd-ingestion/runs");
      expect(res.status).toBe(404);
    });

    it("returns runs for valid brand", async () => {
      (storage.getBrand as any).mockResolvedValue(mockBrand);
      (storage.getFddIngestionRuns as any).mockResolvedValue([
        { id: "r1", brandId: "b1", filename: "test.pdf", status: "completed" },
      ]);
      const app = createApp(adminUser);
      const res = await request(app).get("/api/brands/b1/fdd-ingestion/runs");
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].id).toBe("r1");
    });
  });

  describe("POST /:brandId/fdd-ingestion/extract", () => {
    it("returns 401 when not authenticated", async () => {
      const app = createApp();
      const res = await request(app).post("/api/brands/b1/fdd-ingestion/extract");
      expect(res.status).toBe(401);
    });

    it("returns 403 for non-admin user", async () => {
      const app = createApp(franchiseeUser);
      const res = await request(app).post("/api/brands/b1/fdd-ingestion/extract");
      expect(res.status).toBe(403);
    });

    it("returns 400 when no file uploaded", async () => {
      (storage.getBrand as any).mockResolvedValue(mockBrand);
      const app = createApp(adminUser);
      const res = await request(app).post("/api/brands/b1/fdd-ingestion/extract");
      expect(res.status).toBe(400);
    });

    it("returns 400 for non-PDF file", async () => {
      (storage.getBrand as any).mockResolvedValue(mockBrand);
      const app = createApp(adminUser);
      const res = await request(app)
        .post("/api/brands/b1/fdd-ingestion/extract")
        .attach("file", Buffer.from("not a pdf"), { filename: "test.txt", contentType: "text/plain" });
      expect(res.status).toBe(400);
    });
  });

  describe("POST /:brandId/fdd-ingestion/:runId/retry", () => {
    it("returns 401 when not authenticated", async () => {
      const app = createApp();
      const res = await request(app).post("/api/brands/b1/fdd-ingestion/r1/retry");
      expect(res.status).toBe(401);
    });

    it("returns 403 for non-admin user", async () => {
      const app = createApp(franchiseeUser);
      const res = await request(app).post("/api/brands/b1/fdd-ingestion/r1/retry");
      expect(res.status).toBe(403);
    });

    it("returns 404 when brand not found", async () => {
      (storage.getBrand as any).mockResolvedValue(undefined);
      const app = createApp(adminUser);
      const res = await request(app).post("/api/brands/b1/fdd-ingestion/r1/retry");
      expect(res.status).toBe(404);
    });

    it("returns 400 when run is not failed", async () => {
      (storage.getBrand as any).mockResolvedValue(mockBrand);
      (storage.getFddIngestionRun as any).mockResolvedValue({
        id: "r1",
        brandId: "b1",
        status: "completed",
      });
      const app = createApp(adminUser);
      const res = await request(app).post("/api/brands/b1/fdd-ingestion/r1/retry");
      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Can only retry failed extractions");
    });

    it("retries failed extraction successfully", async () => {
      (storage.getBrand as any).mockResolvedValue(mockBrand);
      const failedRun = { id: "r1", brandId: "b1", status: "failed" };
      (storage.getFddIngestionRun as any).mockResolvedValue(failedRun);
      (retryFddExtraction as any).mockResolvedValue({
        ...failedRun,
        status: "completed",
        extractedData: { parameters: {}, startupCosts: [], confidence: {}, extractionNotes: [] },
      });

      const app = createApp(adminUser);
      const res = await request(app).post("/api/brands/b1/fdd-ingestion/r1/retry");
      expect(res.status).toBe(200);
      expect(res.body.status).toBe("completed");
    });
  });

  describe("POST /:brandId/fdd-ingestion/:runId/apply-parameters", () => {
    it("returns 401 when not authenticated", async () => {
      const app = createApp();
      const res = await request(app).post("/api/brands/b1/fdd-ingestion/r1/apply-parameters");
      expect(res.status).toBe(401);
    });

    it("returns 403 for non-admin user", async () => {
      const app = createApp(franchiseeUser);
      const res = await request(app).post("/api/brands/b1/fdd-ingestion/r1/apply-parameters");
      expect(res.status).toBe(403);
    });

    it("returns 404 when brand not found", async () => {
      (storage.getBrand as any).mockResolvedValue(undefined);
      const app = createApp(adminUser);
      const res = await request(app)
        .post("/api/brands/b1/fdd-ingestion/r1/apply-parameters")
        .send({});
      expect(res.status).toBe(404);
    });

    it("returns 400 when no extracted data available", async () => {
      (storage.getBrand as any).mockResolvedValue(mockBrand);
      (storage.getFddIngestionRun as any).mockResolvedValue({
        id: "r1",
        brandId: "b1",
        status: "completed",
        extractedData: null,
      });
      const app = createApp(adminUser);
      const res = await request(app)
        .post("/api/brands/b1/fdd-ingestion/r1/apply-parameters")
        .send({});
      expect(res.status).toBe(400);
      expect(res.body.message).toBe("No extracted data available");
    });
  });

  describe("POST /:brandId/fdd-ingestion/:runId/apply-startup-costs", () => {
    it("returns 401 when not authenticated", async () => {
      const app = createApp();
      const res = await request(app).post("/api/brands/b1/fdd-ingestion/r1/apply-startup-costs");
      expect(res.status).toBe(401);
    });

    it("returns 403 for non-admin user", async () => {
      const app = createApp(franchiseeUser);
      const res = await request(app).post("/api/brands/b1/fdd-ingestion/r1/apply-startup-costs");
      expect(res.status).toBe(403);
    });
  });
});
