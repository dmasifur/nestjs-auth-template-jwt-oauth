import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma.service';
import { Prisma } from 'generated/prisma';

@Injectable()
export class UsersService {

  constructor(
    private prisma:PrismaService
  ){}

  async create(createUserDto: CreateUserDto) {
    return await this.prisma.user.create({
      data:{
        first_name:createUserDto.firstName,
        last_name:createUserDto.lastName,
        email:createUserDto.email,
        role_id:createUserDto.roleId,
        password:createUserDto.password,
        image_url:createUserDto.imageUrl
      }
    })
  }

  async findAll(params:{
    skip?:number;
    take?:number;
    cursor?:Prisma.UserWhereUniqueInput,
    where?:Prisma.UserWhereInput,
    orderBy?:Prisma.UserOrderByWithRelationInput
  }) {

    const {skip,take,cursor,where,orderBy} = params

    return await this.prisma.user.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy
    })
  }

  async findOne(userWhereUniqueInput: Prisma.UserWhereUniqueInput) {
    return await this.prisma.user.findUnique({where:userWhereUniqueInput})
  }

  async update(id: Prisma.UserWhereUniqueInput, updateUserDto: UpdateUserDto) {
    return await this.prisma.user.update({
      where:id,
      data:{
        first_name:updateUserDto.firstName,
        last_name:updateUserDto.lastName,
        email:updateUserDto.email,
        password:updateUserDto.password,
        image_url:updateUserDto.imageUrl,
        role_id:updateUserDto.roleId
      }
    })
  }

  async remove(userWhereUniqueInput: Prisma.UserWhereUniqueInput) {
    return await this.prisma.user.delete({
      where:userWhereUniqueInput
    });
  }
}
