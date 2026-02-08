interface HttpMethodBadgeProps {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
}

export default function HttpMethodBadge({ method }: HttpMethodBadgeProps) {
    const colors = {
        GET: 'bg-blue-100 text-blue-800 border-blue-200',
        POST: 'bg-green-100 text-green-800 border-green-200',
        PUT: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        DELETE: 'bg-red-100 text-red-800 border-red-200',
        PATCH: 'bg-purple-100 text-purple-800 border-purple-200',
    };

    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold border ${colors[method]}`}
        >
            {method}
        </span>
    );
}
