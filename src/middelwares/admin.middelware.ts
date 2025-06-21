import ApiError from "../helpers/ApiError"
import asyncHandler from "../helpers/asynchandeler"
import jwt from "jsonwebtoken"
import { Request, Response, NextFunction } from "express"


const verifyJwt = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const accessToken = req.cookies?.token


        if (!accessToken) {
            throw new ApiError(401, "Unauthorized Access")
        }

        if (!process.env.JWT_SECRET) {
            throw new ApiError(500, "JWT secret is not defined")
        }

        const decodedToken: any = jwt.verify(accessToken, process.env.JWT_SECRET)

        const user_id = decodedToken.id



        if (user_id !== "cmc213wx40001umigdqfa0d0s") {
            throw new ApiError(401, "Unauthorized Access. You are not an admin")
        }
        // console.log("Inside Mideel ware---------------------");
        // console.log(user)

        req.user_id = user_id
        next()

    } catch (error) {
        console.log(error)
        throw new ApiError(400, "Invalid Token")
    }

})

export default verifyJwt