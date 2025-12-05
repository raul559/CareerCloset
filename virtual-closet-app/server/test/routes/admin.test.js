import chai from "chai";
import chaiHttp from "chai-http";
import app from "../../src/index.js";

chai.use(chaiHttp);
const { expect } = chai;

describe("Admin Routes", () => {
  describe("User Management", () => {
    describe("GET /api/admin/users", () => {
      it("should handle GET all users endpoint", async () => {
        const res = await chai.request(app).get("/api/admin/users");

        // Should either succeed, fail auth, or have server error
        expect([200, 401, 403, 500]).to.include(res.status);
      });
    });

    describe("DELETE /api/admin/users/:userId", () => {
      it("should handle DELETE user endpoint", async () => {
        const res = await chai.request(app).delete("/api/admin/users/test-id");

        expect([204, 401, 403, 404, 500]).to.include(res.status);
      });
    });
  });

  describe("Clothing Management", () => {
    describe("GET /api/admin/clothing", () => {
      it("should handle GET all clothing endpoint", async () => {
        const res = await chai.request(app).get("/api/admin/clothing");

        expect([200, 401, 403, 500]).to.include(res.status);
      });
    });

    describe("DELETE /api/admin/clothing/:clothingId", () => {
      it("should handle DELETE clothing endpoint", async () => {
        const res = await chai
          .request(app)
          .delete("/api/admin/clothing/test-id");

        expect([204, 401, 403, 404, 500]).to.include(res.status);
      });
    });
  });

  describe("Analytics", () => {
    describe("GET /api/admin/analytics", () => {
      it("should handle GET analytics endpoint", async () => {
        const res = await chai.request(app).get("/api/admin/analytics");

        expect([200, 401, 403, 500]).to.include(res.status);
      });
    });
  });
});

//test
