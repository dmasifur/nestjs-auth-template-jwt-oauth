import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
    private readonly redisClient: Redis

    constructor(){
        this.redisClient = new Redis({
            host:process.env.REDIDS_HOST || 'localhost',
            port:parseInt(process.env.REDIS_PORT || '6379',10),
            password:process.env.REDIS_PASSWORD || undefined 
        })

        this.redisClient.on('error',(err)=>console.error('redis client error: ', err))
        this.redisClient.on('connect',()=> console.log('redis client connected'))
    }


    async set(key:string, value:string, ttlSeconds?:number){
        if(ttlSeconds){
            await this.redisClient.setex(key,ttlSeconds,value)
        } else {
            await this.redisClient.set(key,value)
        }
    }


    async get(key:string){
        return await this.redisClient.get(key)
    }

    async del(key:string){
        await this.redisClient.del(key)
    }

    async onModuleDestroy() {
        await this.redisClient.quit()
    }
}
