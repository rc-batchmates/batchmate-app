import { createClient, DEV_API_URL, PROD_API_URL } from "@batchmate/api-client"

export const api = createClient(__DEV__ ? DEV_API_URL : PROD_API_URL)
