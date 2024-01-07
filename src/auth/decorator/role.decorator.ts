import { SetMetadata } from "@nestjs/common";
import { ACCOUNT_TYPES } from "../../global/globalEnum";

export const Roles = (...roles: ACCOUNT_TYPES[]) => SetMetadata('roles', roles)