import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { verifyToken } from "@/lib/auth";
import { db } from "@/lib/db";

const productSchema=z.object({sku:z.string().min(2),price:z.number().positive(),categoryId:z.string().min(1),nameEn:z.string().min(2),nameAr:z.string().min(2),descriptionEn:z.string().optional(),descriptionAr:z.string().optional()});
async function session(){
  const token=await verifyToken((await cookies()).get("erp_session")?.value);
  if(!token)return null;
  const user=await db.user.findUnique({where:{email:token.email},select:{id:true,active:true}});
  return user?.active?{...token,userId:user.id}:null;
}
export async function GET(){const user=await session();if(!user)return NextResponse.json({error:"Unauthorized"},{status:401});const data=await db.product.findMany({include:{translations:true,category:true,sizes:true,addons:true},orderBy:{createdAt:"desc"}});return NextResponse.json(data)}
export async function POST(request:NextRequest){const user=await session();if(user?.role!=="ADMIN")return NextResponse.json({error:"Forbidden"},{status:403});const parsed=productSchema.safeParse(await request.json());if(!parsed.success)return NextResponse.json({error:"Invalid product",details:parsed.error.flatten()},{status:400});const {nameEn,nameAr,descriptionEn,descriptionAr,...data}=parsed.data;const product=await db.product.create({data:{...data,translations:{create:[{locale:"en",name:nameEn,description:descriptionEn},{locale:"ar",name:nameAr,description:descriptionAr}]}},include:{translations:true}});await db.auditLog.create({data:{userId:user.userId,action:"CREATE",entityType:"Product",entityId:product.id}});return NextResponse.json(product,{status:201})}
