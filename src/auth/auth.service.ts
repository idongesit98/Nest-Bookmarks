import {ForbiddenException, Injectable } from "@nestjs/common";
import { AuthDto } from "./dto";
import { PrismaService } from  "../prisma/prisma.service"                  
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from  "../../generated/prisma/runtime/library"
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AuthService{
    constructor(
        private prisma:PrismaService,
        private jwt:JwtService,
        private config:ConfigService
    ){}
    async signup(dto:AuthDto) {
        //generate the password hash
        const hash = await argon.hash(dto.password);
        //save the new user in the db

        try {
            const user = await this.prisma.user.create({
            data:{
                email:dto.email,
                hash,
            }
        });
            // Clone the user object and remove the hash
            // const { hash: _, ...userWithoutHash } = user;
            // return userWithoutHash;
            const token = this.signToken(user.id,user.email)
            return{
                access_token:token
            }
        } catch (error) {
            if(error instanceof PrismaClientKnownRequestError){
                if (error.code === 'P2002') {
                    throw new ForbiddenException(
                        'Credentials taken'
                    );
                }
            }
            throw error;   
        }
    } 

    async signin(dto:AuthDto){
        //Find the user by email
        const user =
          await this.prisma.user.findUnique({
            where:{
                email:dto.email,
            },
          });

          //If user doesn't exist
          if (!user) {
            throw new ForbiddenException(
                'Credentials incorrect'
            );
          }

          const pwMatches = await argon.verify(
            user.hash,
            dto.password,
          );
          //If password incorrect throw exception
          if (!pwMatches) {
            throw new ForbiddenException(
                'Credentials incorrect'
            )
          }
          const token = await this.signToken(user.id,user.email)
           //const { hash: _, ...userWithoutHash } = user;
         
          return{
            access_token:token,
            //user:userWithoutHash
          };

    }

    signToken (userId:number,email:string){
        const payload = { 
            sub:userId,
            email
        }
        const secret = this.config.get('JWT_SECRET')
        return this.jwt.signAsync(payload,{
            expiresIn:'15m',
            secret:secret
        })
    }
} 