import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const GetUser = createParamDecorator(
    (
        data:string | undefined,
        ctx:ExecutionContext
    ) => {
        const request:Express.Request = ctx
           .switchToHttp()
           .getRequest();
           const user = request.user as any;
        if (data) {
            return user[data]
        }
        return request.user;   
    },
)