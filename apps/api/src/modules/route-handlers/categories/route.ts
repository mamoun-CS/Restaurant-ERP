import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { verifyToken } from "@/lib/auth";
import { db } from "@/lib/db";
const schema=z.object({nameEn:z.string().min(2),nameAr:z.string().min(2),sortOrder:z.number().int().default(0),active:z.boolean().default(true)});
async function auth(){return verifyToken((await cookies()).get("erp_session")?.value)}
export async function GET(){if(!await auth())return NextResponse.json({error:"Unauthorized"},{status:401});return NextResponse.json(await db.category.findMany({include:{_count:{select:{products:true}}},orderBy:{sortOrder:"asc"}}))}
export async function POST(request:Request){const user=await auth();if(user?.role!=="ADMIN")return NextResponse.json({error:"Forbidden"},{status:403});const parsed=schema.safeParse(await request.json().catch(()=>null));if(!parsed.success)return NextResponse.json({error:"Invalid category",details:parsed.error.flatten()},{status:400});const item=await db.category.create({data:parsed.data});await db.auditLog.create({data:{userId:user.userId,action:"CREATE",entityType:"Category",entityId:item.id}});return NextResponse.json(item,{status:201})}

