import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';  

@Injectable()
export class ApiClientAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header is required');
    }

    const token = authHeader.replace('Bearer ', '');
    const apiToken = process.env.BACKEND_API_TOKEN;

    if (!apiToken) {
      throw new UnauthorizedException('API token not configured');
    }

    if (token !== apiToken) {
      throw new UnauthorizedException('Invalid API token');
    }

    return true;
  }
}
