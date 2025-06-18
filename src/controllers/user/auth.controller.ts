import asyncHandler from "../../helpers/asynchandeler";
import ApiError from "../../helpers/ApiError";
import ApiResponse from "../../helpers/ApiResponse";
import { Request, Response } from "express";
import PrismaClient from "../../prismaClient/index"
import { z } from "zod"
import Mailer from "../../mailSender/sendMail";
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs";

const signUpSchema = z.object({
    name: z.string().min(3, { message: "Name should be of at least 3 size" }).max(50, { message: "Name should be of at max 50 size" }),
    phone_number: z.string().regex(/^\d{10}$/, { message: "Phone number should be of 10 digits" }),
    email: z.string().email({ message: "Invalid email" }).min(5).max(255),
    password: z.string().min(8, { message: "Password should be of at least 8 size" }).max(20, { message: "Password should be of at max 20 size" }),
})


const signup = asyncHandler(async (req: Request, res: Response) => {
    console.log(req.body)
    const { name, phone_number, email, password } = req.body;

    // validated email and password
    const validatedData = signUpSchema.safeParse({ name, phone_number, email, password })
    if (!validatedData.success) {
        throw new ApiError(400, validatedData.error.errors[0].message)
    }

    // check if email and phone_number already exists
    const user = await PrismaClient.user.findUnique({
        where: {
            email,
            phone_number
        }
    })

    if (user) {
        if (user.isVerified) throw new ApiError(400, "Email or Phone number already exists")
        else {
            await PrismaClient.user.delete({
                where: {
                    id: user.id
                }
            })
        }
    }

    // create otp
    const otp = Math.floor(100000 + Math.random() * 900000)

    // bcrypt password
    const hashedPassword = await bcrypt.hash(password, 10)

    // create user
    const newUser = await PrismaClient.user.create({
        data: {
            email,
            phone_number,
            name,
            isVerified: false,
            password: hashedPassword,
            otp: otp,
            otpExpiresAt: new Date(Date.now() + 600000),
        }
    })

    // check error in creating user
    if (!newUser) {
        throw new ApiError(500, "Error in creating user")
    }

    // send otp to email
    const mailResponse = await Mailer(email, email, otp.toString())

    // check error in sending mail
    if (!mailResponse.success) {
        throw new ApiError(500, "Error in sending mail")
    }

    // send response
    const response = new ApiResponse("200", null, "User created successfully. Please verify your email to continue.")

    return res.status(200).json(response)

})

const signIn = asyncHandler(async (req: Request, res: Response) => {

    const { email, password } = req.body;

    //parser email and password
    if (!email || !password) {
        throw new ApiError(400, "Email and password are required")
    }

    //find user with specific email
    const user = await PrismaClient.user.findUnique({
        where: {
            email
        }
    })

    //check if user exists
    if (!user) {
        throw new ApiError(400, "User not found")
    }

    // check is user is verified
    if (!user.isVerified) {
        throw new ApiError(400, "User not verified")
    }

    // check password
    const isPasswordCorrect = await bcrypt.compare(password, user.password)
    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid password")
    }

    // create jsonwebtoken
    if (!process.env.JWT_SECRET) {
        throw new ApiError(500, "JWT secret is not defined")
    }
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1d" })

    //store in cookieParser
    res.cookie("token", token, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        expires: new Date(Date.now() + 86400000), // Expire in 1 day
    })


    const response = new ApiResponse("200", null, "User Signed in Successfully")

    return res.status(200).json(response)

})

// Add number of tries
const verifyUser = asyncHandler(async (req: Request, res: Response) => {

    const { otp, email } = req.body;

    if (!email) {
        throw new ApiError(400, "Invalid email")
    }

    // check if otp is valid
    if (!otp) {
        throw new ApiError(400, "Invalid otp")
    }

    // find user with otp
    const user = await PrismaClient.user.findFirst({
        where: {
            email
        }
    })


    // check if user exists
    if (!user || !user.otpExpiresAt) {
        throw new ApiError(400, "User not found")
    }

    // check if user is already verified
    if (user.isVerified) {
        throw new ApiError(400, "User already verified")
    }

    // check if otp is expired
    if (user.otpExpiresAt < new Date()) {
        throw new ApiError(400, "Otp expired")
    }
    if (Number(user.otp) !== Number(otp)) {
        console.log("jhbhjhj")
        throw new ApiError(400, "Invalid otp")
    }



    // update user
    const updatedUser = await PrismaClient.user.update({
        where: {
            id: user.id
        },
        data: {
            isVerified: true
        }
    })

    // check if user is updated
    if (!updatedUser) {
        throw new ApiError(500, "Error in updating user")
    }

    if (!process.env.JWT_SECRET) {
        throw new ApiError(500, "JWT secret is not defined")
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1d" })

    //store in cookieParser
    res.cookie("token", token, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        expires: new Date(Date.now() + 86400000), // Expire in 1 day
    })

    // send response
    const response = new ApiResponse("200", null, "User verified successfully")

    return res.status(200).json(response)

})

const resendOtp = asyncHandler(async (req: Request, res: Response) => {

    const { email } = req.body;

    // check if email is valid
    if (!email || !z.string().email().safeParse(email).success) {
        throw new ApiError(400, "Invalid email")
    }

    // find user with email
    const user = await PrismaClient.user.findFirst({
        where: {
            email
        }
    })

    // check if user exists
    if (!user) {
        throw new ApiError(400, "User not found")
    }

    // check if user is already verified
    if (user.isVerified) {
        throw new ApiError(400, "User already verified")
    }


    // create otp
    const otp = Math.floor(100000 + Math.random() * 900000)

    // update user with otp,resendCount and lastResend
    const updatedUser = await PrismaClient.user.update({
        where: {
            id: user.id
        },
        data: {
            otp: otp,
            otpExpiresAt: new Date(Date.now() + 600000), // 10 minutes
        }
    })

    // check if user is updated
    if (!updatedUser) {
        throw new ApiError(500, "Error in updating user")
    }

    // send otp to email
    const mailResponse = await Mailer(email, email, otp.toString())

    // check error in sending mail
    if (!mailResponse.success) {
        throw new ApiError(500, "Error in sending mail")
    }

    // send response
    const response = new ApiResponse("200", "Otp sent successfully")

    res.status(200).json(response)

})

const signOut = asyncHandler(async (req: Request, res: Response) => {

    res.clearCookie("token")

    const response = new ApiResponse("200", "User signed out successfully")

    res.status(200).json(response)

})

const isSignedIn = asyncHandler(async (req: Request, res: Response) => {
    const user_id = req.user_id
    if (!user_id) {
        throw new ApiError(400, "Invalid user")
    }

    const user = await PrismaClient.user.findFirst({
        where: {
            id: user_id
        },
        select: {
            email: true,
            isVerified: true
        }
    })

    const response = new ApiResponse("200", user, "User is signed in")

    return res.status(200).json(response)

})





export { signup, signIn, verifyUser, resendOtp, signOut, isSignedIn }