# Micro Azure Functions

<img src='https://github.com/Albert-Gao/micro-azure-functions/blob/master/logo.png?raw=true' maxWidth="100%" height='auto' />

<p align="center" style="letter-spacing: 8px;">

  <a href="https://www.npmjs.com/package/micro-azure-functions" alt="npm package">
    <img src="https://badgen.net/npm/v/micro-azure-functions?icon=npm"/>
  </a>

  <a href="https://github.com/Albert-Gao/micro-azure-functions/actions" alt="combined checks">
    <img src="https://badgen.net/github/checks/Albert-Gao/micro-azure-functions?label=ci"/>
  </a>

  <a href="https://github.com/Albert-Gao/micro-azure-functions" alt="last commits">
    <img src="https://badgen.net/github/last-commit/Albert-Gao/micro-azure-functions"/>
  </a>

  <a href="https://github.com/Albert-Gao/micro-azure-functions" alt="licence">
    <img src="https://badgen.net/npm/license/micro-azure-functions"/>
  </a>

  <a href='https://coveralls.io/github/Albert-Gao/micro-azure-functions?branch=master'>
    <img src='https://coveralls.io/repos/github/Albert-Gao/micro-azure-functions/badge.svg?branch=master' alt='Coverage Status' />
  </a>

  <a href="https://www.npmjs.com/package/micro-azure-functions" alt="types">
    <img src="https://badgen.net/npm/types/micro-azure-functions"/>
  </a>

  <a href="https://bundlephobia.com/result?p=micro-azure-functions@latest" alt="minified">
    <img src="https://badgen.net/bundlephobia/min/micro-azure-functions"/>
  </a>

  <a href="https://bundlephobia.com/result?p=micro-azure-functions@latest" alt="minified + gzip">
    <img src="https://badgen.net/bundlephobia/minzip/micro-azure-functions"/>
  </a>

  <a href="https://twitter.com/albertgao" alt="twitter">
    <img src="https://badgen.net/twitter/follow/albertgao"/>
  </a>

</p>

## Intro

- Decouple business logic into reusable functions
- Written in Typescript
- Zero runtime dependencies
- Tiny: 5KB after minified
- Rapid middlewares
  - simple reasoning, just running one by one
  - early exit with just `throw` `httpError()` or anything or `context.done()`
  - pass values among middlewares
- Easy debug:
  - log request or any error by just turning one config

## Why do you build this lib

Azure functions is making it a flash to creating an API endpoint. But that's just the infrastructure part. It doesn't mean your business logic can be simplified.

- I need a middleware setup to decouple my business logic without installing a lib that has many dependencies and result in a bigger bundle size as well.
- I want to deal with a simple interface, where the order is just one by one. I don't want to deal with a mental model where a middleware will be invoked twice for both stages, and handle both the `before` and `after` stage in one function.

## What problems does it solve

Middleware is for decoupling logic. I learned the value of `beforeHooks` and `afterHooks` after adopting [Feathers.JS](https://feathersjs.com/). Which has a beautiful concept of 3 layers for every endpoint, and I found myself start the declarative programming for the backend. No more code for the repeating work. In `micro-azure-functions`'s context, it is just an array of `Middleware`.

Let's say a simple return-a-user endpoint, what does it look like when you are using `micro-azure-functions`

```javascript
import { azureFunctions } from 'micro-azure-functions';

const handler = azureFunctions([
  validateRequestBody(GetUserSchema),
  isStillEmployed,
  verifyPaymentStatus,
  justReturnUserObjectDirectlyFromDB,
  removeFieldsFromResponse('password', 'address'),
  combineUserNames,
  transformResponseToClientSideStructure,
]);
```

Ideally, you can just compose your future Azure functions without writing any code except for an integration test. The logic will be declarative. Every middleware here can be fully tested and ready to reuse.

## Usage

### 1. Install

`npm install micro-azure-functions`

### 2. Quick start

```typescript
import { azureFunctions } from 'micro-azure-functions';

const handler = azureFunctions([
  context => {
    context.res = { status: 200, body: { message: 'it works' } };
  },
]);

// call the API, you will get json response: { message: "it works" }
```

### 3. The type of the middleware

```typescript
export type Middleware<PassDownObjType = any> = (
  context: MiddlewareContext<PassDownObjType>,
  ...args: any[]
) => Promise<void> | void;
```

This is 99.999% identical with the AzureFunctions type from `@azure/functions`, but one thing, it appends a new property to Context named `passDownObj`, which is used to shared value among middlewares.

### 4. Two minutes master

- How to control the flow?

  - `context.done` will STOP the execution
  - `throw` will STOP the execution
  - otherwise, the array of `Middleware` will just be executed one by one

- How can I `return`

  - You just use the `Azure` way, setup `context.res`
  - we have some handy method for you like `success(), badRequest(), internalRequest()`, so you can do `context.res = success()`, just setup the statusCode for you
  - or a `success()` (just a `httpResponse()` with status code set to 200, you can still change it)

- What can you `throw`

  - an `httpError()`
  - an `badRequest()`
  - an `internalError()`
  - or anything else
  - any un-caught exception will be caught at the very top level, and return with 500

- How to check what will be returned as the Http response

  - just check the `context.res`

- How to change the `response`

  - you just update `context.res`

- How to pass something down the chain,

  - use `context.passDownObj`
  - attach your value to it: `context.passDownObj.myValue = 123`, `myValue` could be any name

### 5. About the built-in responses

There are 2 types of response:

#### Built in

- `httpError()` for `throw`
- `httpResponse()` for `return`
- `success()`
- `badRequest()`
- `internalRequest()`

#### Plain JS type

- `throw` a plain `object` | `string` | `number` === (400) response
- custom status code by adding `statusCode` property

The `built-in` one has some shortcuts to use.

All parameters are customizable.

```typescript
import { httpError, httpResponse } from 'micro-azure-functions';

// It gives you an instance of HttpError, which extends from Error
const error = httpError({
  // default status code is 400 if not set
  status: 401,
  body: {
    message: 'test',
  },
  headers: {
    'x-http-header': 'fake-header',
  },
});

// It gives you a plain JS object.
const response = httpResponse({
  // default status code is 200 if not set
  status: 200,
  body: {
    message: 'test',
  },
  headers: {
    'x-http-header': 'fake-header',
  },
});
```

The commons headers are:

- 'Access-Control-Allow-Origin': '\*',
- 'Access-Control-Allow-Credentials': true,
- 'Content-Type': 'application/json',

#### 5.1. Shortcuts

Compare to the above methods, the only difference is the shortcuts just sets the status code, you can still modify them if you want.

- `httpError`:
  - `badRequest()`: 400
  - `internalRequest()`: 500
- `httpResponse`:
  - `success()`: 200

### 6. Config

#### 6.1 logError

It will `context.log` any error caught at the very top level

```javascript
azureFunctions([], { logError: true });
```

#### 6.2 logRequest

It will `context.log` `context.req`:

```javascript
azureFunctions([], { logRequest: true });
```

### 7. Examples

#### 7.1 Validation

In the following case, if the request name is 'albert', only `validateRequest` will be called.

```typescript
import { badRequest, Middleware } from 'micro-azure-functions';

const validateRequest: Middleware = (context, req) => {
  if (req.body.name === 'albert') {
    throw badRequest({
      message: 'bad user, bye bye',
    });
  }
};

// it will return a 400 error { message: 'bad user, bye bye' }
```

Or if you like me, you can write a simple validating middleware with the `yup` schema, you can then reuse from the client side.

```typescript
import { Schema } from 'yup';
import { azureFunctions, Middleware, badRequest } from 'micro-azure-functions';

const validateBodyWithYupSchema = (schema: Schema): Middleware => async ({
  event,
}) => {
  if (!schema.isValid(event.body)) {
    throw badRequest('bad request');
  }
};

const handler = azureFunctions([validateBodyWithYupSchema(myYupSchema)]);
```

#### 7.2 processing Response

```typescript
import { badRequest } from 'micro-azure-functions';

const removeFieldsFromResponse = (fieldsToRemove: string[]): Middleware = (context) => {
    const newResponse = Object.assign({}, response);

    fieldsToRemove.forEach(field => {
      if (context.res[field] != null) {
        delete context.res[field]
      }
    })

    return newResponse;
};

const testHandler = azureFunctions(
  [
    (context) => {
      context.res = {
        status: 200,
        body: {
          name: 'albert',
          password: '123qwe',
          address: 'somewhere on earth'
        }
      }
    },
    removeFieldsFromResponse(['password', 'address'])
   ],
);

// response will be  { name: 'albert' }
```

## Credits

- The initial version is heavily inspired by my favourite REST framework: [Feathers.JS](https://feathersjs.com/)
- This project was bootstrapped with [TSDX](https://github.com/jaredpalmer/tsdx).
