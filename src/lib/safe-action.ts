import {
  createSafeActionClient,
  DEFAULT_SERVER_ERROR_MESSAGE,
} from 'next-safe-action';
import AuthorizationError from './AuthorizationError';
import { Prisma } from '@prisma/client';

export const actionClient = createSafeActionClient({
  handleReturnedServerError(e) {
    // In this case, we can use the 'AuthorizationError` class to unmask errors
    // and return them with their actual messages to the client.
    if (e instanceof AuthorizationError) {
      return e.message;
    }

    // if (e instanceof Prisma.PrismaClientKnownRequestError) {
    //   return e.message;
    // }

    // Every other error that occurs will be masked with the default message.
    // return DEFAULT_SERVER_ERROR_MESSAGE;
    throw e;
  },
});
