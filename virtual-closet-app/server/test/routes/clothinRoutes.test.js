import chaiHttp from "chai-http";
import sinon from "sinon";
import mockImport from "mock-import";

chai.use(chaiHttp);
const { expect } = chai;

describe("GET /api/clothing", () => {
  let restoreMock;

  before(async () => {
    // Mock controller BEFORE importing the app
    restoreMock = mockImport("../../src/controllers/clothingController.js", {
      getAllItems: sinon.stub().resolves({
        success: true,
        count: 1,
        items: [{ name: "Shirt", size: "M" }],
      }),
    });
  });

  after(() => {
    // Restore imports after tests
    restoreMock();
  });

  it("should return clothing items", async () => {
    // Import AFTER mocks applied
    const app = (await import("../../src/index.js")).default;

    const res = await chai
      .request(app)
      .get("/api/clothing?userId=test-user");

    expect(res).to.have.status(200);
    expect(res.body.success).to.equal(true);
    expect(res.body.count).to.equal(1);
    expect(res.body.items[0].name).to.equal("Shirt");
  });
});
