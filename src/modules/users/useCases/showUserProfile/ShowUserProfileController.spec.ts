import { hash } from "bcryptjs"
import { Connection, createConnection } from "typeorm"
import { v4 as uuid } from 'uuid'
import { app } from "../../../../app"
import request from 'supertest'

let connection: Connection
describe("Show User profile test integration", () => {

  beforeAll( async () => {
    connection = await createConnection()
    await connection.runMigrations()

    const id = uuid();
    const password = await hash("admin", 8);

    await connection.query(
      `INSERT INTO USERS(id, name, email, password, created_at, updated_at )
      values('${id}', 'userprofile', 'userprofile@finapi.com.br', '${password}', 'now()', 'now()')
    `)
  })

  afterAll(async () => {
    await connection.dropDatabase()
    await connection.close()
  })

  it("should be able to get /profile", async () => {
    const responseToken = await request(app).post("/api/v1/sessions")
      .send({
        email: "userprofile@finapi.com.br",
        password: "admin"
      })

    const showUserProfileResponse = await request(app).get("/api/v1/profile").set('Authorization', `Bearer ${responseToken.body.token}`)

    expect(showUserProfileResponse.status).toBe(200)
  })


  it("should not be able to get /profile without authorization token", async () => {
    const showUserProfileResponse = await request(app).get("/api/v1/profile")

    expect(showUserProfileResponse.status).toBe(401)
  })
})
