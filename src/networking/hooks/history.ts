import { GetHistoryItemResponse } from "@/app/api/space/[spaceid]/content/[contentid]/history/[historyid]/get"
import { apiClient } from "../ApiClient"

import { useQuery } from "@tanstack/react-query"

export function useHistoryItem(spaceId: string, contentId: string, historyId: string, options: {}) {
    const { data, ...rest } = useQuery(
        [["history", historyId]],
        async () => {
            const response = await apiClient.get<GetHistoryItemResponse>({
                path: `/space/${spaceId}/content/${contentId}/history/${historyId}`,
                isAuthRequired: true,
            })
            return response
        },
        options
    )

    return {
        item: data,
        ...rest,
    }
}
