# hvt-history


A Serverless Node lambda (SQSHistoryFunction) for saving a record in the atf history table when an ATF has updated their availability and a notification has been sent to update.

**Note:** This lambda doesn't expose any API endpoint. As a consequence, it doesn't make
sense to start it with `sam local start-api` at development time. If you need to, you
can test this lambda by using the command `npm run invoke`. You can change the event
sent to the lambda by editing the file `events/event.json`.

## Requirements

- [node v14.17.3](https://nodejs.org/en/download/releases/)
- [Docker](https://www.docker.com/get-started)
- [SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html)


## Running locally

1. `npm i`
1. `cp .env.development .env`
1. `npm run build:dev` or `npm run watch:dev`
1. `npm run invoke`


## Debug Locally (VS Code only)

1. Run lambdas in debug mode: `npm run start:dev -- -d 5858`
1. Add a breakpoint to the lambda being tested (`src/handler/index.ts`)
1. Run the debug config from VS Code that corresponds to lambda being tested (`SQSHistoryFunction`)
1. `npm run invoke`


## Tests

- The [Jest](https://jestjs.io/) framework is used to run tests and collect code coverage
- To run the tests, run the following command within the root directory of the project: `npm test`
- Coverage results will be displayed on terminal and stored in the `coverage` directory
    - The coverage requirements can be set in `jest.config.js`


## Build for Production

1. `npm i`
1. add environment variables to `.env`
1. `npm run build:prod`
1.  Zip file can be found in `./dist/`

## Running SQS Locally

The lambda can be ran in isolation using `npm invoke` however if you want to run locally and have the lambda being invoked by a History SQS item (from triggering the Record Handler Lambda) follow these steps:

- Publish the lambda to localstack:
    - `cd .aws-sam/buildSQSHistoryFunction` then zip the files `zip -r ../SQSHistoryFunction.zip * `
    - Make a template.json file to create the lambda - see example below `aws --endpoint-url=http://localhost:8000 lambda create-function --cli-input-json file://<path-to-file>/template.json --zip-file fileb:///<path-to-zip>/SQSHistoryFunction.zip`
    - If it doesn't work, you can delete and try again `aws --endpoint-url=http://localhost:8000 lambda delete-function --function-name SQSHistoryFunction`
- Check it's working by invoking the lambda with the event.json file
    - `aws --endpoint-url=http://localhost:8000 lambda invoke --function-name SQSHistoryFunction --cli-binary-format raw-in-base64-out --payload file:///<path-to-file>/event.json`
- Create the mapping between SQS and the lambda
    - `aws --endpoint-url=http://localhost:8000 lambda create-event-source-mapping --function-name SQSHistoryFunction --batch-size 10 --event-source-arn arn:aws:sqs:eu-west-1:000000000000:hvt-availability-history-sqs`
- To check it's worked, list the event source mappings
    - `aws --endpoint-url=http://localhost:8000 lambda list-event-source-mappings --function-name SQSHistoryFunction --event-source-arn arn:aws:sqs:eu-west-1:000000000000:hvt-availability-history-sqs`
- In the Record Handler repo, invoke the lambda to add items to the queue. The item should now appear in the history table

 ### Example template.json

 ```json
{
    "FunctionName": "SQSHistoryFunction",
    "Runtime": "nodejs12.x",
    "Handler": "app.handler",
    "Description": "History Lambda",
    "Timeout": 30,
    "MemorySize": 500,
    "Publish": true,
    "Role": "",
    "Environment": {
        "Variables" :{
            "NODE_ENV":"development",
            "AWS_DEFAULT_REGION":"eu-west-1",
            "DYNAMO_URL":"http://host.docker.internal:8000",
            "TABLE_NAME":"AvailabilityHistory"
        }
    }
}
 ```

## Logging

By using a utility wrapper (`src/utility/logger`) surrounding `console.log`, the `awsRequestId` and a "correlation ID" is output with every debug/info/warn/error message.

For this pattern to work, every service/lambda must forward their correlation ID to subsequent services via a header e.g. `X-Correlation-Id`. 

In practice, the first lambda invoked by an initial request will not have received the `X-Correlation-Id` header, so its `correlationId` gets defaulted to its `lambdaRequestId`.
This `correlationId` should then be used when invoking subsequent lambdas via the `X-Correlation-Id` header.
Every lambda called subsequently will then check for that `X-Correlation-Id` header and inject it into their logs.

This shows an example of what the log looks like from the first invoked lambda:
```
2020-09-10T17:03:04.891Z	5ff37fce-5ace-114c-9120-a1406cc8d11d	INFO	{"apiRequestId":"c6af9ac6-7b61-11e6-9a41-93e8deadbeef","correlationId":"5ff37fce-5ace-114c-9120-a1406cc8d11d","message":"Here's a gnarly info message from lambda 1 - notice how my correlationId has been set to my lambdaRequestId?"}
```
This shows an example of what the logs look like from the second invoked lambda (called via the first lambda):
```
2020-09-10T17:05:31.627Z	32ff455b-057d-1dd7-98b8-7034bf182dc8	INFO	{"apiRequestId":"d9222e0a-6bd9-49e0-84dd-ffe0680bd141","correlationId":"5ff37fce-5ace-114c-9120-a1406cc8d11d","message":"Here's a gnarly info message from lambda 2 - notice how my correlationId is the same as the lambda 1"}
