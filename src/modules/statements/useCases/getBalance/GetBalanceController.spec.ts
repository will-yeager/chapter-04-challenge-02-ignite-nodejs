import { Connection, createConnection } from "typeorm";
import request from 'supertest'
import { hash } from "bcryptjs"
import { v4 as uuid } from 'uuid'
import { app } from "../../../../app";

let connection: Connection
describe("Get Balance ", () => {

  beforeAll( async () => {
    connection = await createConnection()
    await connection.runMigrations()

    const id = uuid();
    const password = await hash("userbalance", 8);

    await connection.query(
      `INSERT INTO USERS(id, name, email, password, created_at, updated_at)
        values('${id}', 'userbalance', 'userbalance@finapi.com.br', '${password}', 'now()', 'now()')`
    )
  })

  afterAll(async () => {
    await connection.dropDatabase()
    await connection.close()
  })

  it("should be able to get /balance", async () => {
    const responseToken = await request(app).post("/api/v1/sessions")
      .send({
        email: 'userbalance@finapi.com.br',
        password: 'userbalance'
      })

    const balanceResponse = await request(app).get("/api/v1/statements/balance")
      .set('Authorization', `Bearer ${responseToken.body.token}`)

      expect(balanceResponse.status).toBe(200)
  })
})
