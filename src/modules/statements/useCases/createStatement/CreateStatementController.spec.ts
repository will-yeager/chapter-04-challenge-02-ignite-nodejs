import { Connection, createConnection } from "typeorm";
import request from 'supertest'
import { v4 as uuid } from 'uuid'
import { hash } from "bcryptjs"
import { app } from "../../../../app";


let connection: Connection
describe("create a statement on post /statements", () => {

  beforeAll( async () => {
    connection = await createConnection()
    await connection.runMigrations()

    const id = uuid();
    const id2 = uuid();

    const password = await hash("userstatement", 8);

    await connection.query(
      `INSERT INTO USERS(id, name, email, password, created_at, updated_at)
        values('${id}', 'userstatement', 'userstatement@finapi.com.br', '${password}', 'now()', 'now()')
      `)

    await connection.query(
      `INSERT INTO USERS(id, name, email, password, created_at, updated_at)
        values('${id2}', 'userstatementwithdraw', 'userstatementwithdraw@finapi.com.br', '${password}', 'now()', 'now()')
      `)
  })

  afterAll( async () => {
    await connection.dropDatabase()
    await connection.close()
  })

  it("should be able create a deposit statement on post", async () => {
    const responseToken = await request(app).post("/api/v1/sessions")
    .send({
      email: "userstatement@finapi.com.br",
      password: "userstatement"
    })

    const responseDeposit = await request(app).post("/api/v1/statements/deposit")
      .send({
        amount: 100,
        description: "deposit"
      })
      .set('Authorization', `Bearer ${responseToken.body.token}`)

    expect(responseDeposit.status).toBe(201)
  })

  it("should not be able create a deposit statement without description", async () => {
    const responseToken = await request(app).post("/api/v1/sessions")
    .send({
      email: "userstatement@finapi.com.br",
      password: "userstatement"
    })

    const responseDeposit = await request(app).post("/api/v1/statements/deposit")
      .send({
        amount: 100,
      })
      .set('Authorization', `Bearer ${responseToken.body.token}`)

    expect(responseDeposit.status).toBe(500)
  })

  it("should not be able create a deposit statement without authentication JWT", async () => {
    const responseDeposit = await request(app).post("/api/v1/statements/deposit")
      .send({
        amount: 100,
        description: "deposit"
      })

    expect(responseDeposit.status).toBe(401)
  })

  it("should be able create a withdraw statement on post", async () => {
    const responseToken = await request(app).post("/api/v1/sessions")
    .send({
      email: "userstatement@finapi.com.br",
      password: "userstatement"
    })

    await request(app).post("/api/v1/statements/deposit")
      .send({
        amount: 200,
        description: "deposit"
      })
      .set('Authorization', `Bearer ${responseToken.body.token}`)

    const responseWithdraw = await request(app).post("/api/v1/statements/withdraw")
      .send({
        amount: 200,
        description: "deposit"
      })
      .set('Authorization', `Bearer ${responseToken.body.token}`)

    expect(responseWithdraw.status).toBe(201)
  })


  it("should not be able create a withdraw statement on post without enough amount", async () => {
    const responseToken = await request(app).post("/api/v1/sessions")
    .send({
      email: "userstatementwithdraw@finapi.com.br",
      password: "userstatement"
    })

    const responseWithdraw = await request(app).post("/api/v1/statements/withdraw")
      .send({
        amount: 800,
        description: "deposit"
      })
      .set('Authorization', `Bearer ${responseToken.body.token}`)

    expect(responseWithdraw.status).toBe(400)
  })
})


