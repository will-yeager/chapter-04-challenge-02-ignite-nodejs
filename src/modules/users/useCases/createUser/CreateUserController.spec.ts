import { Connection, createConnection } from "typeorm";
import { app } from "../../../../app";
import request from "supertest";

let connection: Connection;
describe("Create a User teste integration", () => {

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to create a user", async () => {
    const responseUser = await request(app).post("/api/v1/users").send({
      name: "user",
      email: "user@finapi.com.br",
      password: "user",
    });

    expect(responseUser.status).toBe(201);
  });

  it("should not be able to create a user with the same email of another user", async () => {
    const responseUser = await request(app).post("/api/v1/users").send({
      name: "user",
      email: "user@finapi.com.br",
      password: "user123",
    });

    expect(responseUser.status).toBe(400);
  });

});
