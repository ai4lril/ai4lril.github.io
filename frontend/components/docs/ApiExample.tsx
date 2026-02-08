import CodeTabs from './CodeTabs';
import { getExampleBaseUrl, getApiUrlNote } from '@/lib/api-config';

interface ApiExampleProps {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    endpoint: string;
    requiresAuth?: boolean;
    requestBody?: string;
    queryParams?: Record<string, string>;
    description?: string;
}

export default function ApiExample({
    method,
    endpoint,
    requiresAuth = false,
    requestBody,
    queryParams,
    description,
}: ApiExampleProps) {
    const baseUrl = getExampleBaseUrl();
    const fullUrl = queryParams
        ? `${baseUrl}${endpoint}?${new URLSearchParams(queryParams).toString()}`
        : `${baseUrl}${endpoint}`;

    const authHeader = requiresAuth ? 'x-api-key: your-api-key-here' : '';
    const authHeaderJs = requiresAuth ? "'x-api-key': 'your-api-key-here'," : '';
    const authHeaderPy = requiresAuth ? "{'x-api-key': 'your-api-key-here'}," : '';

    const examples = [];

    // cURL example
    if (method === 'GET') {
        examples.push({
            language: 'bash',
            label: 'cURL',
            code: `curl -X GET "${fullUrl}"${authHeader ? ` \\\n  -H "${authHeader}"` : ''}`,
        });
    } else {
        examples.push({
            language: 'bash',
            label: 'cURL',
            code: `curl -X ${method} "${fullUrl}" \\
  -H "Content-Type: application/json"${authHeader ? ` \\
  -H "${authHeader}"` : ''}${requestBody ? ` \\
  -d '${requestBody}'` : ''}`,
        });
    }

    // JavaScript example
    if (method === 'GET') {
        examples.push({
            language: 'javascript',
            label: 'JavaScript',
            code: `const response = await fetch('${fullUrl}', {
  ${authHeaderJs ? `headers: {\n    ${authHeaderJs}\n  }` : ''}
});
const data = await response.json();`,
        });
    } else {
        examples.push({
            language: 'javascript',
            label: 'JavaScript',
            code: `const response = await fetch('${fullUrl}', {
  method: '${method}',
  headers: {
    'Content-Type': 'application/json',${authHeaderJs ? `\n    ${authHeaderJs}` : ''}
  }${requestBody ? `,\n  body: JSON.stringify(${requestBody})` : ''}
});
const data = await response.json();`,
        });
    }

    // Python example
    if (method === 'GET') {
        examples.push({
            language: 'python',
            label: 'Python',
            code: `import requests

response = requests.get(
    '${fullUrl}'${authHeaderPy ? `,\n    headers=${authHeaderPy}` : ''}
)
data = response.json()`,
        });
    } else {
        examples.push({
            language: 'python',
            label: 'Python',
            code: `import requests

response = requests.${method.toLowerCase()}(
    '${fullUrl}',
    headers={'Content-Type': 'application/json'${authHeaderPy ? `, ${authHeaderPy.replace(/[{}]/g, '')}` : ''}}${requestBody ? `,\n    json=${requestBody}` : ''}
)
data = response.json()`,
        });
    }

    return (
        <div>
            {description && <p className="mb-4 text-slate-600">{description}</p>}
            <CodeTabs examples={examples} />
            <div className="mt-2 text-xs text-slate-500">
                <p>{getApiUrlNote()}</p>
            </div>
        </div>
    );
}
