import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AUTH_TYPES } from "../../global/globalEnum";


@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const roles = this.reflector.getAllAndOverride<AUTH_TYPES[]>('roles', [
            context.getHandler(),
            context.getClass()
        ])
        if (!roles) return true;
        const request = context.switchToHttp().getRequest();
        const user = request.user
        return roles.some(role => role == user.accountType)
    }
}