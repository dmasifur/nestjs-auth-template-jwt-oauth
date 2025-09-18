import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { JWT_SECRET } from "./constanats";
import type { Request } from "express";
import { UsersService } from "src/users/users.service";


const extractJwtFromCookie = (req:Request) => {
    let token = null;

    if (req && req.cookies){
        token = req.cookies['access_token']
    }
    return token;
}


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy,'jwt'){
    constructor(
      private userServices:UsersService
    ){
        super({
            jwtFromRequest:extractJwtFromCookie,
            ignoreExpiration:false,
            secretOrKey:JWT_SECRET.key ?? "test"
        })
    }


    async validate(payload:{username:string,sub:string}) {
        const user = await this.userServices.findOne({email:payload.username})
        if(!user) throw new UnauthorizedException("User not found")
        return {userId:payload.sub, username:payload.username}
    }
}