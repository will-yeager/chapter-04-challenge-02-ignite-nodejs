import { Connection, createConnection } from "typeorm";
import { v4 as uuid } from 'uuid'
import { hash } from "bcryptjs"
import request from 'supertest'
import { app } from "../../../../app";

let connection: Connection
let id: string
describe("get statement operation", () => {

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    id = uuid();
    const password = await hash("userstatementoperation", 8);

    await connection.query(
      `INSERT INTO USERS(id, name, email, password, created_at, updated_at )
      values('${id}', 'userstatementoperation', 'userstatementoperation@finapi.com.br', '${password}', 'now()', 'now()')
    `)
  })

  afterAll(async () => {
    await connection.dropDatabase()
    await connection.close()
  })

  it("should be able to get statements", async () => {
    const responseToken = await request(app).post("/api/v1/sessions")
      .send({
        email: "userstatementoperation@finapi.com.br",
        password: "userstatementoperation"
      })

    const responseDeposit = await request(app).post("/api/v1/statements/deposit")
      .send({
        amount: 100,
        description: "deposit"
      })
      .set('Authorization', `Bearer ${responseToken.body.token}`)

    const responseStatement = await request(app).get(`/api/v1/statements/${responseDeposit.body.id}`).set('Authorization', `Bearer ${responseToken.body.token}`)

    expect(responseStatement.status).toBe(200)
    expect(responseStatement.body).toHaveProperty("id")
  })
})
