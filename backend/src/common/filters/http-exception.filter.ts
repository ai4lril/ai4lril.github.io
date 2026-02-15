import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ErrorResponseBody {
  message: string | string[];
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: 'Internal server error' };

    let message: string | string[];
    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else if (
      exceptionResponse &&
      typeof exceptionResponse === 'object' &&
      'message' in exceptionResponse
    ) {
      message =
        (exceptionResponse as ErrorResponseBody).message || 'An error occurred';
    } else {
      message = 'An error occurred';
    }

    const errorResponse = {
      success: false,
      error: {
        statusCode: status,
        message: Array.isArray(message) ? message : [message],
        error: HttpStatus[status],
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
      },
    };

    // Log only message to avoid exposing passwords, tokens, or request body
    const safeMessage =
      exception instanceof Error ? exception.message : String(exception);
    console.error('Exception:', safeMessage);

    response.status(status).json(errorResponse);
  }
}
