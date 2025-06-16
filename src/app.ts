import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import exp from "constants"
import PrismaClient from "./prismaClient/index"




const app = express()

app.use(cookieParser())

app.use(cors({
    origin: true,
    credentials: true,
}))

app.get("/", (req, res) => {
    res.status(200).send("Hello, Server is running")
}
)


app.use(express.json())
app.use(express.urlencoded({ extended: true, limit: "10mb" }))
app.use(express.static("public"))

// Router import
// import userRouter from "./routers/user.router"


// Roueters
// app.use("/api/v1/user", userRouter)


export default app