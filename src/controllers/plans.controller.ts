import asyncHandler from "../helpers/asynchandeler";
import ApiError from "../helpers/ApiError";
import ApiResponse from "../helpers/ApiResponse";
import { Request, Response } from "express";
import PrismaClient from "../prismaClient/index"
import { z } from "zod"
import { features } from "process";


const Plan = z.object({
    name: z.string().min(3, { message: "Name should be of at least 3 size" }).max(50, { message: "Name should be of at max 50 size" }),
    oldprice: z.number().min(0, { message: "Price should be a positive number" }),
    newprice: z.number().min(0, { message: "Price should be a positive number" }),
    featured: z.array(z.string()).min(1, { message: "At least one feature is required" }),
    type: z.enum(["TRIAL", "MONTHLY", "QUARTERLY", "YEARLY"])
})

const addPlan = asyncHandler(async (req: Request, res: Response) => {
    const { oldprice, newprice, featured, type, name } = req.body;
    const { gymId } = req.params
    console.log(req.body)

    // validated data
    const validatedData = Plan.safeParse({ oldprice, newprice, featured, type, name });
    if (!validatedData.success) {
        throw new ApiError(400, validatedData.error.errors[0].message);
    }


    // create plan
    const newPlan = await PrismaClient.plans.create({
        data: {
            name,
            oldprice,
            newprice,
            featured,
            type,
            gym: {
                connect: {
                    id: gymId
                }
            }
        }
    });

    if (!newPlan) {
        throw new ApiError(500, "Failed to add plan");
    }

    const response = new ApiResponse("200", newPlan, "Plan added successfully");
    return res.status(200).json(response);
})

const getPlans = asyncHandler(async (req: Request, res: Response) => {
    const { gymId } = req.params;

    // get plans
    const plans = await PrismaClient.plans.findMany({
        where: {
            gymId,
            isActive: true // Ensure only active plans are fetched
        }
    });

    if (!plans || plans.length === 0) {
        throw new ApiError(404, "No plans found for this gym");
    }

    const response = new ApiResponse("200", plans, "Plans fetched successfully");
    return res.status(200).json(response);
})

const userEligiblePlans = asyncHandler(async (req: Request, res: Response) => {
    const { gymId } = req.params;
    const user_id = req.user_id;

    // get plans
    const plans = await PrismaClient.plans.findMany({
        where: {
            gymId,
            isActive: true // Ensure only active plans are fetched
        }
    })

    if (!plans || plans.length === 0) {
        throw new ApiError(404, "No plans found for this gym");
    }

    // get bookings of user
    const bookings = await PrismaClient.booking.findMany({
        where: {
            userId: user_id,
            gymId,
            plan: {
                type: "TRIAL"
            }
        },
        select: {
            plan: {
                select: {
                    id: true,
                    name: true,
                    type: true,
                    isActive: true,
                }
            }
        }
    });

    // filter plans that are not booked by user
    if (!bookings || bookings.length === 0 || bookings[0].plan?.type !== "TRIAL") {
        const response = new ApiResponse("200", plans, "Plans fetched successfully");
        return res.status(200).json(response);
    }

    const bookedPlanIds = bookings.map(booking => booking.plan?.id);
    const eligiblePlans = plans.filter(plan => !bookedPlanIds.includes(plan.id));

    if (eligiblePlans.length === 0) {
        throw new ApiError(404, "No eligible plans found for this user");
    }

    const response = new ApiResponse("200", eligiblePlans, "Eligible plans fetched successfully");
    return res.status(200).json(response);


})

const togglePlan = asyncHandler(async (req: Request, res: Response) => {
    const { planId } = req.params;

    // check if plan exists
    const plan = await PrismaClient.plans.findUnique({
        where: {
            id: planId
        }
    });

    if (!plan) {
        throw new ApiError(404, "Plan not found");
    }

    // disable plan
    await PrismaClient.plans.update({
        where: {
            id: planId
        },
        data: {
            isActive: !plan.isActive
        }
    });

    const response = new ApiResponse("200", null, "Plan disabled successfully");
    return res.status(200).json(response);
})




export { addPlan, getPlans, togglePlan, userEligiblePlans }