import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { verifyToken } from "@/lib/auth";
import { db } from "@/lib/db";
const schema=z.object({
  sku:z.string().trim().min(2).optional(),
  price:z.number().positive().optional(),
  active:z.boolean().optional(),
  categoryId:z.string().min(1).optional(),
  nameEn:z.string().trim().min(2).optional(),
  nameAr:z.string().trim().min(2).optional(),
  descriptionEn:z.string().trim().optional(),
  descriptionAr:z.string().trim().optional(),
});
async function admin(){
  const token=await verifyToken((await cookies()).get("erp_session")?.value);
  if(token?.role!=="ADMIN")return null;
  const user=await db.user.findUnique({where:{email:token.email},select:{id:true,active:true}});
  return user?.active?{...token,userId:user.id}:null;
}
export async function PATCH(request:NextRequest,{params}:{params:Promise<{id:string}>}){
  const user=await admin();
  if(!user)return NextResponse.json({error:"Forbidden"},{status:403});
  const parsed=schema.safeParse(await request.json().catch(()=>null));
  if(!parsed.success)return NextResponse.json({error:"Invalid product",details:parsed.error.flatten()},{status:400});
  const {id}=await params;
  const {nameEn,nameAr,descriptionEn,descriptionAr,...data}=parsed.data;
  try {
    const product=await db.$transaction(async tx=>{
      await tx.product.update({where:{id},data});
      const translations=[
        {locale:"en",name:nameEn,description:descriptionEn},
        {locale:"ar",name:nameAr,description:descriptionAr},
      ];
      for(const translation of translations){
        if(translation.name===undefined&&translation.description===undefined)continue;
        const existing=await tx.productTranslation.findUnique({where:{productId_locale:{productId:id,locale:translation.locale}}});
        const name=translation.name??existing?.name;
        if(!name)continue;
        await tx.productTranslation.upsert({
          where:{productId_locale:{productId:id,locale:translation.locale}},
          update:{name,description:translation.description},
          create:{productId:id,locale:translation.locale,name,description:translation.description},
        });
      }
      await tx.auditLog.create({data:{userId:user.userId,action:"UPDATE",entityType:"Product",entityId:id}});
      return tx.product.findUniqueOrThrow({where:{id},include:{translations:true,category:true,sizes:true,addons:true}});
    });
    return NextResponse.json(product);
  } catch(error){
    const code=typeof error==="object"&&error&&"code" in error?String(error.code):"";
    if(code==="P2002")return NextResponse.json({error:"SKU already exists"},{status:409});
    if(code==="P2025")return NextResponse.json({error:"Product not found"},{status:404});
    console.error("Product update failed",error);
    return NextResponse.json({error:"Unable to update product"},{status:500});
  }
}
export async function DELETE(_:NextRequest,{params}:{params:Promise<{id:string}>}){const user=await admin();if(!user)return NextResponse.json({error:"Forbidden"},{status:403});const {id}=await params;await db.product.delete({where:{id}});await db.auditLog.create({data:{userId:user.userId,action:"DELETE",entityType:"Product",entityId:id}});return new NextResponse(null,{status:204})}
