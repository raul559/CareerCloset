# Virtual Closet - Test Setup Guide

## Overview

The Virtual Closet application uses **Mocha** as the test framework with **Chai** for assertions and **Sinon** for mocking/stubbing. This guide explains how to run and write tests for the project.

## Testing Framework Stack

- **Mocha** (v11.7.5) - Test framework
- **Chai** (v4.5.0) - Assertion library
- **Chai-HTTP** (v4.3.0) - HTTP testing plugin
- **Sinon** (v21.0.0) - Mocking and stubbing
- **NYC** (v17.1.0) - Code coverage tool

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests with coverage report
```bash
npm run coverage
```

### Run specific test file
```bash
npx mocha --timeout 10000 --require ./test/testSetup.js ./test/routes/clothing.test.js
```

### Run tests in watch mode
```bash
npx mocha --watch --timeout 10000 --require ./test/testSetup.js "./test/**/*.test.js"
```

## Test Files Structure

```
server/test/
├── testSetup.js              # Global test configuration
└── routes/
    ├── clothing.test.js      # Clothing API tests
    ├── appointments.test.js  # Appointment API tests
    ├── admin.test.js         # Admin API tests
    └── health.test.js        # Health check tests
```

## Test Patterns

### Testing an Endpoint with Sinon Stubbing

```javascript
import chai from "chai";
import chaiHttp from "chai-http";
import sinon from "sinon";
import app from "../../src/index.js";
import * as controller from "../../src/controllers/controller.js";

chai.use(chaiHttp);
const { expect } = chai;

describe("API Endpoint", () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("should handle successful request", async () => {
    sandbox.stub(controller, "methodName").resolves({ 
      success: true, 
      data: [] 
    });

    const res = await chai
      .request(app)
      .get("/api/endpoint");

    expect(res).to.have.status(200);
    expect(res.body).to.have.property("success", true);
  });

  it("should handle errors", async () => {
    sandbox
      .stub(controller, "methodName")
      .rejects(new Error("Database error"));

    const res = await chai
      .request(app)
      .get("/api/endpoint");

    expect(res).to.have.status(500);
    expect(res.body).to.have.property("error");
  });
});
```

## Test Configuration

The `test/testSetup.js` file sets up global test utilities:

- Configures Chai HTTP plugin
- Sets up global `chai` and `expect` references
- Sets `NODE_ENV=test` (configured in package.json)

## Example Tests Included

### 1. Clothing Routes (`clothing.test.js`)
- GET all clothing items
- GET single item by ID
- Error handling

### 2. Appointment Routes (`appointments.test.js`)
- GET all appointments
- GET available time slots
- POST create appointment
- PUT update appointment
- PATCH cancel appointment
- DELETE appointment
- Error handling for invalid data

### 3. Admin Routes (`admin.test.js`)
- User management (GET, DELETE)
- Clothing management (GET, DELETE)
- Analytics endpoints

### 4. Health Check (`health.test.js`)
- Verify API health status
- Check environment and timestamp

## Writing New Tests

1. Create a new file in `test/routes/` named `feature.test.js`
2. Import required modules:
   ```javascript
   import chai from "chai";
   import chaiHttp from "chai-http";
   import sinon from "sinon";
   import app from "../../src/index.js";
   ```

3. Set up test suite:
   ```javascript
   chai.use(chaiHttp);
   const { expect } = chai;

   describe("Feature Name", () => {
     let sandbox;
     
     beforeEach(() => { sandbox = sinon.createSandbox(); });
     afterEach(() => { sandbox.restore(); });
     
     it("should test something", async () => {
       // Test implementation
     });
   });
   ```

4. Run the test:
   ```bash
   npm test
   ```

## Common Assertions

```javascript
// Status codes
expect(res).to.have.status(200);

// Response properties
expect(res.body).to.have.property("success");
expect(res.body.data).to.be.an("array");

// Values
expect(res.body.status).to.equal("OK");
expect(res.body.data).to.deep.equal(expectedData);

// Existence
expect(res.body).to.exist;
expect(res.body).to.not.be.null;

// Types
expect(res.body.data).to.be.an("object");
expect(res.body.items).to.be.an("array");
```

## GitHub Actions CI/CD

The workflow file (`.github/workflows/node.js.yml`) runs:

1. Installs Node.js 22.x
2. Starts MongoDB 8.0
3. Installs npm dependencies (`npm ci`)
4. Builds the project (`npm run build`)
5. Runs tests (`npm test`)

Tests run automatically on:
- Push to `main` branch
- Pull requests to `main` branch

## Troubleshooting

### Tests Timeout
- Increase timeout in package.json test script
- Current timeout: 10000ms (10 seconds)
- Change: `--timeout 20000` for 20 seconds

### MongoDB Connection Issues
- Tests run with `NODE_ENV=test` which skips DB connection
- Mock data using Sinon stubs

### Import Errors
- Ensure `"type": "module"` in package.json
- Use `.js` extensions in imports

## Best Practices

1. **Isolate tests** - Use Sinon to stub external dependencies
2. **Clear setup/teardown** - Use `beforeEach`/`afterEach` to manage sandbox
3. **Descriptive names** - Use clear test descriptions
4. **Test edge cases** - Include error scenarios
5. **Mock external services** - Don't rely on database in unit tests
6. **Keep tests fast** - Use appropriate timeouts

## Additional Resources

- [Mocha Documentation](https://mochajs.org/)
- [Chai Assertion Library](https://www.chaijs.com/)
- [Chai-HTTP Plugin](https://github.com/chaijs/chai-http)
- [Sinon.JS](https://sinonjs.org/)
