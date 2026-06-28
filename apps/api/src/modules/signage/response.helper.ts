import { ApiResponse } from "@soustools/api-types";

/**
 * Executes a controller action and wraps its return value or thrown error in a standard API response.
 *
 * @param action - A callback function containing the controller logic to execute.
 * @returns A promise resolving to a standard API response containing the result or error.
 */
export async function runControllerAction<T>(
  action: () => Promise<T>
): Promise<ApiResponse<T>> {
  try {
    const data = await action();
    return {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    console.error("[runControllerAction] Exception:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return {
      success: false,
      error: message,
      timestamp: new Date().toISOString(),
    };
  }
}
