interface ImportMetaEnv {
    readonly SUPABASE_URL: string;
    readonly SUPABASE_ANON_KEY: string;
    readonly BLOB_READ_WRITE_TOKEN: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}