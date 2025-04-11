import { supabase } from "@/lib/supabaseClient";
import { decode } from "base64-arraybuffer";

/**
 * Generate a UUID that is compatible with React Native
 * This is a simple implementation that should be sufficient for our needs
 */
function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Debug function to check authentication status
 * This helps diagnose why storage bucket access might be failing
 */
export const debugAuthStatus = async () => {
  console.log("---------------- AUTH DEBUG ----------------");
  
  // Check Supabase session
  const { data: session, error: sessionError } = await supabase.auth.getSession();
  console.log("Supabase session present:", session?.session ? "Yes" : "No");
  if (sessionError) {
    console.error("Session error:", sessionError.message);
  }

  // Try to get user ID from JWT claims via RPC
  try {
    const { data: userId, error: userIdError } = await supabase.rpc(
      "requesting_user_id"
    );
    console.log("User ID from JWT claims:", userId || "Not found");
    if (userIdError) {
      console.error("Error getting user ID from JWT:", userIdError.message);
    }
  } catch (error) {
    console.error("Error calling requesting_user_id():", error);
  }

  console.log("-------------------------------------------");
};

/**
 * Uploads an image to storage and returns the public URL
 * Ensures proper handling of file content
 * 
 * @param uri - The image URI to upload
 * @param userId - The user ID for ownership
 * @param retryCount - Current retry attempt (default: 0)
 * @param maxRetries - Maximum number of retry attempts (default: 2)
 * @returns Promise with the public URL of the uploaded image or null if failed
 */
export const uploadImage = async (
  uri: string,
  userId: string,
  retryCount = 0,
  maxRetries = 2
): Promise<string | null> => {
  // Debug auth status before attempting upload
  await debugAuthStatus();

  try {
    console.log(`Fetching image data from URI: ${uri}`);

    // For local file URIs, we need to handle them differently
    if (uri.startsWith("file://")) {
      // For local files, we'll use a different approach
      console.log("Using file:// URI approach");

      // Create a unique file path for the image with user_id to enforce ownership
      if (!userId) {
        console.error("No user ID available for upload");
        throw new Error("User ID is required for upload");
      }

      // Extract file extension from URI
      let fileExt = uri.split(".").pop()?.toLowerCase();
      if (!fileExt || fileExt.length > 5 || !fileExt.match(/^[a-z0-9]+$/)) {
        fileExt = "jpg"; // Default to jpg if extension is invalid
      }

      const fileName = `${generateUUID()}.${fileExt}`;
      const filePath = `plant-images/${userId}/${fileName}`;

      console.log(`Uploading local file to: ${filePath}`);

      // For React Native, we need to use base64 encoding for reliable uploads
      // First, we need to read the file as a blob
      const fileResponse = await fetch(uri);
      const fileBlob = await fileResponse.blob();

      console.log(`Local file blob size: ${fileBlob.size} bytes`);

      if (fileBlob.size === 0) {
        throw new Error("Local file blob has 0 bytes - file may be invalid");
      }

      // Convert blob to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const base64String = reader.result as string;
          // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
          const base64Data = base64String.split(",")[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
      });

      reader.readAsDataURL(fileBlob);
      const base64Data = await base64Promise;

      console.log(`Converted to base64, length: ${base64Data.length}`);

      // Convert base64 to ArrayBuffer for Supabase
      const arrayBuffer = decode(base64Data);
      console.log(
        `Converted to ArrayBuffer, size: ${arrayBuffer.byteLength} bytes`
      );

      // Upload using ArrayBuffer
      const { data, error: uploadError } = await supabase.storage
        .from("user-uploads")
        .upload(filePath, arrayBuffer, {
          contentType: `image/${fileExt}`,
          upsert: true,
        });

      if (uploadError) {
        console.error("Error uploading local file:", uploadError);
        throw uploadError;
      }

      console.log(`Local file upload successful! Path: ${filePath}`);

      // Instead of using getPublicUrl, we'll create a signed URL with a long expiration
      // This is more reliable for React Native
      const { data: signedUrlData, error: signedUrlError } =
        await supabase.storage
          .from("user-uploads")
          .createSignedUrl(filePath, 315360000); // ~10 years in seconds

      if (signedUrlError) {
        console.error("Error creating signed URL:", signedUrlError);
        throw signedUrlError;
      }

      // Verify URL was created
      console.log(
        `Signed URL created: ${signedUrlData?.signedUrl ? "Yes" : "No"}`
      );

      return signedUrlData?.signedUrl || null;
    } else {
      // For remote URLs, use the existing approach
      // More robust fetch with timeout and explicit response handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch(uri, {
        method: "GET",
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch image: ${response.status} ${response.statusText}`
        );
      }

      // Log response details for debugging
      console.log(
        `Response status: ${response.status}, type: ${response.headers.get(
          "content-type"
        )}`
      );

      // Create blob properly ensuring content type is preserved
      const contentType =
        response.headers.get("content-type") || "image/jpeg";
      const blob = await response.blob();

      // Verify blob has content
      console.log(
        `Created blob of size: ${blob.size} bytes, type: ${blob.type}`
      );

      if (blob.size === 0) {
        throw new Error(
          "Image blob has 0 bytes - source image may be invalid"
        );
      }

      // Create a unique file path for the image with user_id to enforce ownership
      if (!userId) {
        console.error("No user ID available for upload");
        throw new Error("User ID is required for upload");
      }

      // Extract file extension from content type if not available in URI
      let fileExt = uri.split(".").pop()?.toLowerCase();
      if (!fileExt || fileExt.length > 5 || !fileExt.match(/^[a-z0-9]+$/)) {
        // Extract from mime type as fallback
        fileExt = contentType.split("/")[1] || "jpg";
      }

      const fileName = `${generateUUID()}.${fileExt}`;
      const filePath = `plant-images/${userId}/${fileName}`;

      console.log(`Uploading image to: ${filePath}`);
      console.log(`Content type: ${contentType}, Size: ${blob.size} bytes`);

      // For remote URLs, we'll also use base64 encoding for consistency
      // Convert blob to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const base64String = reader.result as string;
          // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
          const base64Data = base64String.split(",")[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
      });

      reader.readAsDataURL(blob);
      const base64Data = await base64Promise;

      console.log(`Converted to base64, length: ${base64Data.length}`);

      // Convert base64 to ArrayBuffer for Supabase
      const arrayBuffer = decode(base64Data);
      console.log(
        `Converted to ArrayBuffer, size: ${arrayBuffer.byteLength} bytes`
      );

      // Upload using ArrayBuffer
      const { data, error: uploadError } = await supabase.storage
        .from("user-uploads")
        .upload(filePath, arrayBuffer, {
          contentType: contentType,
          upsert: true,
        });

      if (uploadError) {
        console.error("Error uploading image:", uploadError);
        throw uploadError;
      }

      console.log(`Upload successful! Path: ${filePath}`);

      // Instead of using getPublicUrl, we'll create a signed URL with a long expiration
      // This is more reliable for React Native
      const { data: signedUrlData, error: signedUrlError } =
        await supabase.storage
          .from("user-uploads")
          .createSignedUrl(filePath, 315360000); // ~10 years in seconds

      if (signedUrlError) {
        console.error("Error creating signed URL:", signedUrlError);
        throw signedUrlError;
      }

      // Verify URL was created
      console.log(
        `Signed URL created: ${signedUrlData?.signedUrl ? "Yes" : "No"}`
      );

      return signedUrlData?.signedUrl || null;
    }
  } catch (error) {
    console.error(
      `Error in uploadImage (attempt ${retryCount + 1}/${maxRetries}):`,
      error
    );

    if (retryCount < maxRetries - 1) {
      console.log(
        `Retrying image upload (attempt ${retryCount + 1}/${maxRetries})...`
      );
      await new Promise((resolve) => setTimeout(resolve, 1000 * retryCount));
      return uploadImage(uri, userId, retryCount + 1, maxRetries);
    }

    return null;
  }
}; 