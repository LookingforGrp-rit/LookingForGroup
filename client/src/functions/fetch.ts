/* Takes in an error message. Sets the error message up in html, and
   displays it to the user. Will be hidden by other events that could
   end in an error.
*/
const handleError = (message: string): void => {
  console.log('Error: ', message);
  // const errorElement = document.querySelector('.error');
  // errorElement.textContent = message;
  // errorElement.classList.remove('hidden');
};

/* Generic response type used for result-handling across requests */
interface ServerResponse {
  redirect?: string;
  error?: string;
  data?: unknown;
  [key: string]: unknown;
}

/* Type for standard JSON-safe request data */
type JsonData = Record<string, unknown>;

/* Type for result-handling callbacks */
type ResultHandler = (result: ServerResponse) => void;

/* Sends post requests to the server using fetch. Will look for various
    entries in the response JSON object, and will handle them appropriately.
*/
const sendPost = async (
  url: string,
  data: JsonData = {},
  handler?: ResultHandler
): Promise<void> => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  await responseHandler(response, handler);
};

/* Sends a PUT request to the server using fetch, converting the body into FormData,
    making it suitable for file data transfer.
    MUST BE CONTAINED in a <form> element, using the encType="multipart/form-data"
*/
const sendFile = async (
  url: string,
  data: HTMLFormElement,
  handler?: ResultHandler
): Promise<void> => {
  const response = await fetch(url, {
    method: 'PUT',
    body: new FormData(data),
  });
  await responseHandler(response, handler);
};

/* Sends put requests to the server using fetch. Will look for various
    entries in the response JSON object, and will handle them appropriately.
*/
const sendPut = async (
  url: string,
  data: JsonData = {},
  handler?: ResultHandler
): Promise<void> => {
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  await responseHandler(response, handler);
};

const sendDelete = async (
  url: string,
  handler?: ResultHandler
): Promise<void> => {
  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    }
  });
  await responseHandler(response, handler);
};

const responseHandler = async (
  response: Response,
  handler?: ResultHandler
): Promise<void> => {
  const result: ServerResponse = await response.json();

  if (result.redirect) {
    window.location.href = result.redirect;
    return;
  }

  if (handler) {
    handler(result); // Pass full result, including error if present
  }
};

const sendGet = async (
  url: string,
  handler?: ResultHandler
): Promise<void> => {
  console.log(`URL: ${url}`);

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const result: ServerResponse = await response.json();
  document.querySelector('.error')?.classList.add('hidden');
  console.log(result);

  if (result.redirect) {
    window.location.href = result.redirect;
  }

  if (result.error) {
    handleError(result.error);
  }

  if (handler) {
    handler(result);
  }
};

// removed errorMessage element from login and signup pages
const hideError = (): void => {
  document.getElementById('errorMessage')?.classList.add('hidden');
};

const POST = async (
  url: string,
  data: JsonData
): Promise<ServerResponse | undefined> => {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return await response.json();
  } catch (err) {
    console.log(err);
    return undefined;
  }
};

const GET = async (url: string): Promise<ServerResponse | undefined> => {
  try {
    const response = await fetch(url);
    return await response.json();
  } catch (err) {
    console.log(err);
    return undefined;
  }
};

export {
  POST, GET,
  handleError,
  sendGet,
  sendPost,
  sendPut,
  sendFile,
  sendDelete,
  hideError,
};
