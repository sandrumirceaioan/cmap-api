import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';

@Catch()
export class AnyExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {

    let response = host.switchToHttp().getResponse();
    let status = (exception instanceof HttpException) ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    if (exception.name == 'MongoError') {
        status = 400;
        exception.message = 'Something went wrong!';
    } 
    
    if (exception.name == 'ValidationError') {
      exception.message = [];
      for (let error in exception.errors) {
        exception.message.push(exception.errors[error].message);
      }
    }

    response
      .status(status)
      .json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        message: exception.message
      });
  }
}