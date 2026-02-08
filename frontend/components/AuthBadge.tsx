interface AuthBadgeProps {
    required: boolean;
}

export default function AuthBadge({ required }: AuthBadgeProps) {
    if (required) {
        return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-orange-100 text-orange-800 border border-orange-200">
                🔒 Authentication Required
            </span>
        );
    }
    return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-200">
            🔓 Public Access
        </span>
    );
}
