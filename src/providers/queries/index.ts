import { QueryClient } from "@tanstack/react-query"


export const initQueryClient = () => {
    return new QueryClient({
        //Query client configurations go here...
    })
}