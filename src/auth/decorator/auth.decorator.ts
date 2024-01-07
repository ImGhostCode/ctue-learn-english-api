import { ExecutionContext, createParamDecorator } from "@nestjs/common";

export const GetAccount = createParamDecorator(
    (key: string, context: ExecutionContext) => {
        const request = context.switchToHttp().getRequest()
        const user = request.user
        return key ? user?.[key] : user
    }
)