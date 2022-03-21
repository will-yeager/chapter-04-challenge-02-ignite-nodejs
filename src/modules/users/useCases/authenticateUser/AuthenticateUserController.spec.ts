import { Connection, createConnection } from "typeorm";
import request from "supertest"
import { app } from "../../../../app";
import { hash } from "bcryptjs";
import { v4 as uuid } from 'uuid'

let connection: Connection
describe("Authenticate an user", () => {

  beforeAll( async () => {
    connection = await createConnection()
    await connection.runMigrations()

    const id = uuid();
    const password = await hash("userauth", 8);

    await connection.query(
      `INSERT INTO USERS(id, name, email, password, created_at, updated_at )
      values('${id}', 'userauth', 'userauth@finapi.com.br', '${password}', 'now()', 'now()')
    `)
  })

  afterAll(async () => {
    await connection.dropDatabase()
    await connection.close()
  })


  it("should be able authenticate an user", async () => {
    const responseToken = await request(app).post("/api/v1/sessions")
      .send({
        email: "userauth@finapi.com.br",
        password: "userauth"
      })

      expect(responseToken.status).toBe(200)
      expect(responseToken.body).toHaveProperty("token")
  })

  it("should not be able authenticate an user with an wrong password", async () => {
    const responseToken = await request(app).post("/api/v1/sessions")
      .send({
        email: "userauth@finapi.com.br",
        password: "senhaerrada"
      })

      expect(responseToken.status).toBe(401)
  })

  it("should not be able authenticate an user with an not existing user", async () => {
    const responseToken = await request(app).post("/api/v1/sessions")
      .send({
        email: "userautherrado@finapi.com.br",
        password: "senhaerrada"
      })

      expect(responseToken.status).toBe(401)
  })

})
