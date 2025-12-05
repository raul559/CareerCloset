import chai from "chai";
import chaiHttp from "chai-http";
import app from "../../src/index.js";

chai.use(chaiHttp);
const { expect } = chai;

describe("Health Check", () => {
  describe("GET /api/health", () => {
    it("should return 200 with health status", async () => {
      const res = await chai.request(app).get("/api/health");

      expect(res).to.have.status(200);
      expect(res.body).to.have.property("status", "OK");
      expect(res.body).to.have.property("message");
      expect(res.body).to.have.property("environment");
      expect(res.body).to.have.property("timestamp");
    });

    it("should indicate test environment", async () => {
      const res = await chai.request(app).get("/api/health");

      expect(res.body.environment).to.equal("test");
    });

    it("should have valid timestamp", async () => {
      const res = await chai.request(app).get("/api/health");

      const timestamp = new Date(res.body.timestamp);
      expect(timestamp).to.be.an.instanceof(Date);
      expect(timestamp.getTime()).to.be.greaterThan(0);
    });
  });
});
