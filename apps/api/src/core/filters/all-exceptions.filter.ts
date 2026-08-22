import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from "@nestjs/common";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof Error ? exception.message : "Internal server error";

    if (status >= 500) {
      console.error(
        `[HTTP ${status}] ${request?.method || "GET"} ${request?.url}: ${message}`,
        (exception as Error)?.stack,
      );
    } else if (status !== 404) {
      console.warn(
        `[HTTP ${status}] ${request?.method || "GET"} ${request?.url}: ${message}`,
      );
    }

    if (response && typeof response.status === "function") {
      response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request?.url,
        message,
      });
    }
  }
}
