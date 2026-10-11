import type { AwsRegion } from "@remotion/lambda";
import type { VideoCompositionProps } from "@/remotion/types";

export interface RenderVideoResult {
  videoUrl: string;
  renderId?: string;
  bucketName?: string;
  durationSeconds: number;
  renderedVia: "aws-lambda" | "local-fallback";
}

/**
 * Checks whether all required Remotion AWS Lambda credentials are configured.
 */
export function hasRemotionLambdaConfig(): boolean {
  const hasKeys = Boolean(
    (process.env.REMOTION_AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID) &&
    (process.env.REMOTION_AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY)
  );
  const hasFunction = Boolean(process.env.REMOTION_LAMBDA_FUNCTION_NAME);
  const hasServeUrl = Boolean(process.env.REMOTION_SERVE_URL);

  return hasKeys && hasFunction && hasServeUrl;
}

/**
 * Dispatches and polls an MP4 video render using Remotion on AWS Lambda.
 * Falls back to a local preview video if AWS Lambda credentials are not provisioned yet.
 */
export async function renderCompositionToMp4(
  props: VideoCompositionProps
): Promise<RenderVideoResult> {
  const isConfigured = hasRemotionLambdaConfig();

  if (!isConfigured) {
    console.warn(
      "[REMOTION_LAMBDA_NOTICE] Remotion AWS Lambda environment variables are missing. " +
      "To render MP4 via AWS Lambda, configure REMOTION_AWS_ACCESS_KEY_ID, REMOTION_AWS_SECRET_ACCESS_KEY, " +
      "REMOTION_LAMBDA_FUNCTION_NAME, and REMOTION_SERVE_URL in .env.local. " +
      "Using local player composition URL fallback."
    );

    return {
      videoUrl: props.voiceoverAudioUrl || "https://placeholder.video/sample-render.mp4",
      durationSeconds: props.durationInSeconds,
      renderedVia: "local-fallback",
    };
  }

  const region = (process.env.REMOTION_AWS_REGION ||
    process.env.AWS_REGION ||
    "us-east-1") as AwsRegion;
  const functionName = process.env.REMOTION_LAMBDA_FUNCTION_NAME!;
  const serveUrl = process.env.REMOTION_SERVE_URL!;

  console.log(
    `[REMOTION_LAMBDA] Dispatching render on AWS Lambda in region="${region}", function="${functionName}"...`
  );

  const { renderMediaOnLambda, getRenderProgress } = await import("@remotion/lambda");

  const { renderId, bucketName } = await renderMediaOnLambda({
    region,
    functionName,
    serveUrl,
    composition: "VideoShort",
    inputProps: props as Record<string, unknown>,
    codec: "h264",
    imageFormat: "jpeg",
    maxRetries: 2,
    privacy: "public",
  });

  console.log(`[REMOTION_LAMBDA] Render dispatched. renderId="${renderId}". Polling for MP4 output...`);

  // Poll for completion
  let attempts = 0;
  const maxAttempts = 120; // Up to 4 minutes polling
  while (attempts < maxAttempts) {
    attempts++;
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const progress = await getRenderProgress({
      renderId,
      bucketName,
      functionName,
      region,
    });

    if (progress.fatalErrorEncountered) {
      const err = progress.errors?.[0]?.message || "Fatal error encountered during Lambda render";
      console.error("[REMOTION_LAMBDA_ERROR]", err);
      throw new Error(`Remotion AWS Lambda render failed: ${err}`);
    }

    if (progress.done && progress.outputFile) {
      console.log(`[REMOTION_LAMBDA_SUCCESS] Render complete! MP4 URL: ${progress.outputFile}`);
      return {
        videoUrl: progress.outputFile,
        renderId,
        bucketName,
        durationSeconds: props.durationInSeconds,
        renderedVia: "aws-lambda",
      };
    }

    const pct = Math.round((progress.overallProgress || 0) * 100);
    if (attempts % 5 === 0) {
      console.log(`[REMOTION_LAMBDA_PROGRESS] Rendering... ${pct}%`);
    }
  }

  throw new Error("Remotion AWS Lambda render timed out after 4 minutes.");
}
