### **1. ARG - Accepts values FROM compose.yaml**
```dockerfile
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
```
This says: "I'm expecting to receive these values when Docker builds the image"

### **2. ENV - Makes them available to processes**
```dockerfile
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
```
This says: "Take those ARG values and set them as environment variables so `npm run build` can see them"

## The Flow:

```
.env file
    ↓
compose.yaml reads .env
    ↓
compose.yaml passes values as build args to Dockerfile
    ↓
Dockerfile: ARG receives the values
    ↓
Dockerfile: ENV makes them available to shell
    ↓
npm run build (Vite can now access them via import.meta.env)
    ↓
Vite bundles them into JavaScript
```