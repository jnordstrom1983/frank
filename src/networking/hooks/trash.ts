import { apiClient } from "../ApiClient"
import { useQuery } from "@tanstack/react-query"
import { GetTrashResponse } from "@/app/api/space/[spaceid]/trash/get"

export function useTrash(spaceId: string,  options: {}) {
    const { data, ...rest } = useQuery(
        [["trash", spaceId]],
        async () => {
            const response = await apiClient.get<GetTrashResponse>({
                path: `/space/${spaceId}/trash`,
                isAuthRequired: true,
            })
            return response.items
        },
        options
    )

    return {
        items: data,
        ...rest,
    }
}
