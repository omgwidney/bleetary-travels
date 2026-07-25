export interface FirebaseClientConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

type PartialFirebaseClientConfig = Partial<FirebaseClientConfig>;

export function validateFirebaseClientConfig(
  config: PartialFirebaseClientConfig,
): FirebaseClientConfig {
  const requiredFields = [
    "apiKey",
    "authDomain",
    "projectId",
    "storageBucket",
    "messagingSenderId",
    "appId",
  ] as const;
  const missing = requiredFields.filter((field) => !config[field]?.trim());

  if (missing.length > 0) {
    throw new Error(
      `Missing Firebase client configuration: ${missing.join(", ")}. Copy .env.example to .env.local and provide the required values.`,
    );
  }

  return config as FirebaseClientConfig;
}

export function getFirebaseClientConfig(): FirebaseClientConfig {
  return validateFirebaseClientConfig({
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId:
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  });
}
