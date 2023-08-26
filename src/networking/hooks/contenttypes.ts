import { apiClient } from "../ApiClient"

import { useQuery } from "@tanstack/react-query"

import { GetContentTypeItemResponse } from "@/app/api/space/[spaceid]/contenttype/[contenttypeid]/get"

import { useRouter } from "next/navigation"
import { GetContentTypeResponse } from "@/app/api/space/[spaceid]/contenttype/get"

export function useContentypes(spaceId: string, options: {}) {
    const router = useRouter()

    const { data, ...rest } = useQuery(
        [["contenttypes", spaceId]],
        async () => {
            const response = await apiClient.get<GetContentTypeResponse>({
                path: `/space/${spaceId}/contenttype`,
                isAuthRequired: true,
            })
            return response.contenttypes
        },
        options
    )

    return {
        contenttypes: data,
        ...rest,
    }
}

export function useContenttype(spaceId: string, contentTypeId: string, options: { disabled?: boolean }) {
    const router = useRouter()

    const { data, ...rest } = useQuery(
        [["contenttype", spaceId, contentTypeId]],
        async () => {
            const response = await apiClient.get<GetContentTypeItemResponse>({
                path: `/space/${spaceId}/contenttype/${contentTypeId}`,
                isAuthRequired: true,
            })
            return response
        },
        {
            enabled: !options.disabled,
        }
    )

    return {
        contenttype: data,
        ...rest,
    }
}
