const request = require("supertest");
const app = require("../app");
const db = require("../models");
const { User } = db;
let server, agent;
const cheerio = require("cheerio");

function extractCsrfToken(res) {
  const $ = cheerio.load(res.text);
  return $("[name=_csrf]").val();
}

const login = async (agent, username, password) => {
  let res = await agent.get("/login");
  const csrfToken = extractCsrfToken(res);
  res = await agent.post("/session").send({
    email: username,
    password: password,
    _csrf: csrfToken,
  });
};
describe("Todo Application", function () {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
    server = app.listen(3000, () => {});
    agent = request.agent(server);
  });

  afterAll(async () => {
    await db.sequelize.close();
    server.close();
  });
  test("GET /home should redirect to login page when user is not authenticated", async () => {
    await request(app).get("/home").expect(302).expect("Location", "/login");
  });

  test("GET /signout should log out a user", async () => {
    await User.create({
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      password: "password",
    });
    const agent = request.agent(app);
    await agent
      .post("/session")
      .send({ email: "john@example.com", password: "password" });

    await agent.get("/signout").expect(302);
  });
});
