import request from "supertest";
import app, { startServer } from "../../server";

describe("GET /", () => {
  let server: any;

  beforeAll((done) => {
    server = startServer(done);
  });

  afterAll((done) => {
    server.close(done);
  });

  it("should return a welcome message", async () => {
    const response = await request(app).get("/");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "Hello, World!" });
  });
});
