import { createThirdwebClient } from "thirdweb";

const clientId = import.meta.env.VITE_THIRDWEB_CLIENT_ID;

if (!clientId) {
    throw new Error("Missing VITE_THIRDWEB_CLIENT_ID env var");
}

export const client = createThirdwebClient({
    clientId: clientId,
});
