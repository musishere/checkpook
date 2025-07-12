// src/lib/prisma.ts
import { PrismaClient } from "../generated/prisma";

export const prisma = new PrismaClient();
// console.log(Object.keys(prisma));
