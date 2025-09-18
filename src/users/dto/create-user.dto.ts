import { IsEmail, IsInt, IsOptional, IsString, MinLength } from "class-validator";

export class CreateUserDto {
   @IsString()
   @MinLength(1)
   firstName:string

   @IsString()
   @MinLength(1)
   lastName:string

   @IsEmail()
   email:string

   @IsInt()
   roleId:number

   @IsString()
   @IsOptional()
   imageUrl:string

   @IsString()
   @MinLength(5)
   @IsOptional()
   password?:string
}
