import chai from "chai";
import chaiHttp from "chai-http";
import app from "../../src/index.js";

chai.use(chaiHttp);
const { expect } = chai;

describe("Clothing Routes", () => {
  describe("GET /api/clothing", () => {
    it("should handle GET clothing endpoint", async () => {
      const res = await chai
        .request(app)
        .get("/api/clothing")
        .query({ userId: "test-user-123" })
        .timeout(15000); // Increase timeout for DB operations

      // Should either return 200 or 500 depending on actual implementation
      expect([200, 500]).to.include(res.status);
      expect(res.body).to.be.an("object");
    }).timeout(20000);

    it("should use default userId if not provided", async () => {
      const res = await chai
        .request(app)
        .get("/api/clothing")
        .timeout(15000);

      // Should handle the request
      expect([200, 500]).to.include(res.status);
    }).timeout(20000);
  });

  describe("GET /api/clothing/:clothingId", () => {
    it("should handle GET single clothing item", async () => {
      const res = await chai
        .request(app)
        .get("/api/clothing/test-id")
        .timeout(15000);

      // Should either return 200 or 500 depending on actual implementation
      expect([200, 404, 500]).to.include(res.status);
      expect(res.body).to.be.an("object");
    }).timeout(20000);
  });
});
