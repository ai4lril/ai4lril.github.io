import CodeBlock from './CodeBlock';

interface ErrorResponse {
    statusCode: number;
    title: string;
    message: string;
    error: string;
    retryAfter?: number;
}

interface ErrorResponsesProps {
    showAll?: boolean;
}

export default function ErrorResponses({ showAll = false }: ErrorResponsesProps) {
    const commonErrors: ErrorResponse[] = [
        {
            statusCode: 400,
            title: 'Bad Request',
            message: 'Invalid languageCode. Must be ISO 639-1 format (e.g., "en", "hi")',
            error: 'Bad Request',
        },
        {
            statusCode: 401,
            title: 'Unauthorized',
            message: 'Authentication required. Please login or provide an API key.',
            error: 'Unauthorized',
        },
        {
            statusCode: 404,
            title: 'Not Found',
            message: 'Resource not found',
            error: 'Not Found',
        },
    ];

    const rateLimitError: ErrorResponse = {
        statusCode: 429,
        title: 'Too Many Requests',
        message: 'Rate limit exceeded. Please try again later.',
        error: 'Too Many Requests',
        retryAfter: 60,
    };

    const serverError: ErrorResponse = {
        statusCode: 500,
        title: 'Internal Server Error',
        message: 'An unexpected error occurred',
        error: 'Internal Server Error',
    };

    const errorsToShow = showAll
        ? [...commonErrors, rateLimitError, serverError]
        : commonErrors;

    return (
        <div>
            <h2>Error Responses</h2>
            <p>The API uses standard HTTP status codes. Common error responses:</p>

            {errorsToShow.map((error) => (
                <div key={error.statusCode} className="my-4">
                    <h3 className="text-lg font-semibold">
                        {error.statusCode} {error.title}
                    </h3>
                    <CodeBlock language="json">{`{
  "statusCode": ${error.statusCode},
  "message": "${error.message}",
  "error": "${error.error}"${error.retryAfter ? `,
  "retryAfter": ${error.retryAfter}` : ''}
}`}</CodeBlock>
                </div>
            ))}

            {!showAll && (
                <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <p className="text-sm text-slate-600">
                        <strong>Note:</strong> The API may also return{' '}
                        <code>429 Too Many Requests</code> for rate limiting and{' '}
                        <code>500 Internal Server Error</code> for server issues.
                    </p>
                </div>
            )}
        </div>
    );
}
