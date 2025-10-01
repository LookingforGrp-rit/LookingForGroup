// Master list of all possible error messages that a service can have, expand as needed
type ServiceError =
  | 'INTERNAL_ERROR'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'FORBIDDEN'
  | 'CONTENT_TOO_LARGE'
  | 'BAD_REQUEST';

// This utility allows us to use ServiceError as a list of all possible output values
// while making subtypes that only have some of the values which is then enforced by TypeScript
type ServiceErrorSubset<T extends ServiceError> = T;

// Master list of all possible success messages that a service can have, expand as needed
type ServiceSuccess = 'OK' | 'CREATED' | 'NO_CONTENT';

// This utility allows us to use ServiceSuccess as a list of all possible output values
// while making subtypes that only have some of the values which is then enforced by TypeScript
type ServiceSuccessSusbet<T extends ServiceSuccess> = T;

export { type ServiceErrorSubset, type ServiceSuccessSusbet };
