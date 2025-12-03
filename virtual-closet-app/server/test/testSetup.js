import chai from "chai";          // <-- use default-style import for chai v4
import chaiHttp from "chai-http"; // <-- chai-http patches THIS instance

chai.use(chaiHttp);

global.chai = chai;
global.expect = chai.expect;
