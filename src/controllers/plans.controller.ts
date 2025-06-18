import asyncHandler from "../helpers/asynchandeler";
import ApiError from "../helpers/ApiError";
import ApiResponse from "../helpers/ApiResponse";
import { Request, Response } from "express";
import PrismaClient from "../prismaClient/index"
import { z } from "zod"

enum PlanType {
    TRIAL,
    MONTHLY,
    QUARTERLY,
    YEARLY
}
const Plan = z.object({
    name: z.string().min(3, { message: "Name should be of at least 3 size" }).max(50, { message: "Name should be of at max 50 size" }),
    price: z.number().min(0, { message: "Price should be a positive number" }),
    description: z.string().max(255, { message: "Description should be of at max 255 size" }),
    type: z.nativeEnum(PlanType)
})

const addPlan = asyncHandler(async (req: Request, res: Response) => {
    const { name, price, description, type } = req.body;
    const { gymId } = req.params

    // validated data
    const validatedData = Plan.safeParse({ name, price, description, type });
    if (!validatedData.success) {
        throw new ApiError(400, validatedData.error.errors[0].message);
    }


    // create plan
    const newPlan = await PrismaClient.plans.create({
        data: {
            name,
            price,
            description,
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
            gymId
        }
    });

    if (!plans || plans.length === 0) {
        throw new ApiError(404, "No plans found for this gym");
    }

    const response = new ApiResponse("200", plans, "Plans fetched successfully");
    return res.status(200).json(response);
})

const disablePlan = asyncHandler(async (req: Request, res: Response) => {
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
            isActive: false
        }
    });

    const response = new ApiResponse("200", null, "Plan disabled successfully");
    return res.status(200).json(response);
})

const enablePlan = asyncHandler(async (req: Request, res: Response) => {
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

    // enable plan
    await PrismaClient.plans.update({
        where: {
            id: planId
        },
        data: {
            isActive: true
        }
    });

    const response = new ApiResponse("200", null, "Plan enabled successfully");
    return res.status(200).json(response);
})