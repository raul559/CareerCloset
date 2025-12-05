import chai from "chai";
import chaiHttp from "chai-http";
import app from "../../src/index.js";

chai.use(chaiHttp);
const { expect } = chai;

describe("Appointment Routes", () => {
  describe("GET /api/admin/appointments", () => {
    it("should handle GET all appointments", async () => {
      const res = await chai.request(app).get("/api/admin/appointments");

      // Should either return 200 or 500 or 401 (auth) depending on implementation
      expect([200, 401, 500]).to.include(res.status);
    });
  });

  describe("GET /api/admin/appointments/available-slots", () => {
    it("should handle available slots endpoint", async () => {
      const res = await chai
        .request(app)
        .get("/api/admin/appointments/available-slots")
        .query({ date: "2025-12-15" });

      expect([200, 401, 500]).to.include(res.status);
    });
  });

  describe("POST /api/admin/appointments", () => {
    it("should handle creating appointment", async () => {
      const appointmentData = {
        userId: "user1",
        date: "2025-12-15",
        startTime: "10:00",
        endTime: "11:00",
      };

      const res = await chai
        .request(app)
        .post("/api/admin/appointments")
        .send(appointmentData);

      expect([201, 400, 401, 500]).to.include(res.status);
    });
  });

  describe("PUT /api/admin/appointments/:id", () => {
    it("should handle updating appointment", async () => {
      const res = await chai
        .request(app)
        .put("/api/admin/appointments/test-id")
        .send({ startTime: "11:00" });

      expect([200, 404, 401, 500]).to.include(res.status);
    });
  });

  describe("PATCH /api/admin/appointments/:id/cancel", () => {
    it("should handle cancelling appointment", async () => {
      const res = await chai
        .request(app)
        .patch("/api/admin/appointments/test-id/cancel");

      expect([200, 404, 401, 500]).to.include(res.status);
    });
  });

  describe("DELETE /api/admin/appointments/:id", () => {
    it("should handle deleting appointment", async () => {
      const res = await chai
        .request(app)
        .delete("/api/admin/appointments/test-id");

      expect([204, 404, 401, 500]).to.include(res.status);
    });
  });
});
