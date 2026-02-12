export async function forwardRequest(
    target: string,
    method: string,
    headers: Record<string, string> = {},
    body: any
) {
    try {
        const fetchOptions: RequestInit = {
            method,
            headers: {
                ...headers,
                // Ensure we don't just blindly copy content-length if body changes, but here we forward body as JSON usually
                "Content-Type": "application/json",
            },
        };

        if (body && (method === "POST" || method === "PUT")) {
            fetchOptions.body = JSON.stringify(body);
        }

        const response = await fetch(target, fetchOptions);

        // Attempt to parse JSON response, fallback to text
        const text = await response.text();
        try {
            return JSON.parse(text);
        } catch {
            return text;
        }
    } catch (error) {
        console.error("Forwarding error:", error);
        throw new Error("Failed to forward request to target");
    }
}
