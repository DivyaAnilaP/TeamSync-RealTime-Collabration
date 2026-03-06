import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(process.env.VITE_SUPABASE_URL || "https://fuvwylldpjiovtkrnysv.supabase.co"),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1dnd5bGxkcGppb3Z0a3JueXN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2Nzk3ODAsImV4cCI6MjA4ODI1NTc4MH0.lkpQvsGWkQgS34WzBDbS7Dj2LMahPaonb1PJ8fJA2Ds"),
    'import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY': JSON.stringify(process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1dnd5bGxkcGppb3Z0a3JueXN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2Nzk3ODAsImV4cCI6MjA4ODI1NTc4MH0.lkpQvsGWkQgS34WzBDbS7Dj2LMahPaonb1PJ8fJA2Ds"),
    'import.meta.env.VITE_SUPABASE_PROJECT_ID': JSON.stringify(process.env.VITE_SUPABASE_PROJECT_ID || "fuvwylldpjiovtkrnysv"),
  },
}));
