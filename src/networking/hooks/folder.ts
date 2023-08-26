import { GetHistoryItemResponse } from "@/app/api/space/[spaceid]/content/[contentid]/history/[historyid]/get"
import { apiClient } from "../ApiClient"

import { useQuery } from "@tanstack/react-query"
import { GetFolderResponse } from "@/app/api/space/[spaceid]/folder/get"

export function useFolders(spaceId: string,  options: {}) {
    const { data, ...rest } = useQuery(
        [["folders", spaceId]],
        async () => {
            const response = await apiClient.get<GetFolderResponse>({
                path: `/space/${spaceId}/folder`,
                isAuthRequired: true,
            })
            return response.folders
        },
        options
    )

    return {
        folders: data,
        ...rest,
    }
}
