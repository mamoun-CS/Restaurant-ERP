import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { verifyToken } from "@/lib/auth";
import { db } from "@/lib/db";
const schema=z.object({price:z.number().positive().optional(),active:z.boolean().optional(),categoryId:z.string().optional()});
async function admin(){const user=await verifyToken((await cookies()).get("erp_session")?.value);return user?.role==="ADMIN"?user:null}
export async function PATCH(request:NextRequest,{params}:{params:Promise<{id:string}>}){const user=await admin();if(!user)return NextResponse.json({error:"Forbidden"},{status:403});const parsed=schema.safeParse(await request.json());if(!parsed.success)return NextResponse.json({error:"Invalid product"},{status:400});const {id}=await params;const product=await db.product.update({where:{id},data:parsed.data});await db.auditLog.create({data:{userId:user.userId,action:"UPDATE",entityType:"Product",entityId:id}});return NextResponse.json(product)}
export async function DELETE(_:NextRequest,{params}:{params:Promise<{id:string}>}){const user=await admin();if(!user)return NextResponse.json({error:"Forbidden"},{status:403});const {id}=await params;await db.product.delete({where:{id}});await db.auditLog.create({data:{userId:user.userId,action:"DELETE",entityType:"Product",entityId:id}});return new NextResponse(null,{status:204})}

