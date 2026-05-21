declare namespace NodeJS {
  interface ProcessEnv {
    EXPO_PUBLIC_SUPABASE_URL?: string;
    EXPO_PUBLIC_SUPABASE_ANON_KEY?: string;
    EXPO_PUBLIC_DUMMY_PASSWORD?: string;
  }
}

declare var process: {
  env: NodeJS.ProcessEnv;
};
