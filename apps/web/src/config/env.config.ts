import { env } from "./env";

export interface Features {
  pipeline: boolean;
  // Add new feature flags here
  // example: betaFeature: boolean;
}

export interface EnvConfig {
  features: Features;
}

export const getEnvConfig = (): EnvConfig => {
  return {
    features: {
      pipeline: env.featureFlagPipeline,
      // Add new feature implementations here
    },
  };
};

export function validateEnvConfig(): void {
  const requiredFlags: Array<keyof Features> = ["pipeline"];

  for (const flag of requiredFlags) {
    const value = flag === "pipeline" ? env.featureFlagPipeline : false;
    if (value !== true && value !== false) {
      throw new Error(
        `VITE_FEATURE_FLAG_${flag.toUpperCase()} must be either "true" or "false"`,
      );
    }
  }
}

// Type helper for feature-guarded types
export type WhenEnabled<
  Flag extends keyof Features,
  T,
> = Features[Flag] extends true ? T : undefined;
