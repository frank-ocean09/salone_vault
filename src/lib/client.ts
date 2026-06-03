import { createThirdwebClient } from "thirdweb";

const clientId = import.meta.env.VITE_THIRDWEB_CLIENT_ID || "placeholder-client-id";

if (!import.meta.env.VITE_THIRDWEB_CLIENT_ID) {
    console.warn("⚠️ Missing VITE_THIRDWEB_CLIENT_ID env var. Blockchain features will not work.");
}

export const client = createThirdwebClient({
    clientId: clientId,
});
