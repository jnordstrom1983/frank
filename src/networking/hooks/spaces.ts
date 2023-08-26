import { apiClient } from "../ApiClient"

import { GetAccesskeyResponse } from "@/app/api/space/[spaceid]/accesskey/get"
import { GetSpaceApiUserResponse } from "@/app/api/space/[spaceid]/user/api/get"
import { GetSpaceUserResponse } from "@/app/api/space/[spaceid]/user/get"
import { GetSpaceResponse } from "@/app/api/space/get"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"

export function useSpaces(options: { enabled?: boolean }) {
    const router = useRouter()

    const { data, ...rest } = useQuery(
        ["spaces"],
        async () => {
            const response = await apiClient.get<GetSpaceResponse>({
                path: "/space",
                isAuthRequired: true,
            })
            return response.spaces
        },
        options
    )

    return {
        spaces: data,
        ...rest,
    }
}

export function useSpaceUsers(spaceId: string, options: {}) {
    const { data, ...rest } = useQuery(
        [["space_user", spaceId]],
        async () => {
            const response = await apiClient.get<GetSpaceUserResponse>({
                path: `/space/${spaceId}/user`,
                isAuthRequired: true,
            })
            return response.users
        },
        options
    )

    return {
        users: data,
        ...rest,
    }
}

export function useSpaceApiUsers(spaceId: string, options: {}) {
    const { data, ...rest } = useQuery(
        [["space_api_user", spaceId]],
        async () => {
            const response = await apiClient.get<GetSpaceApiUserResponse>({
                path: `/space/${spaceId}/user/api`,
                isAuthRequired: true,
            })
            return response.users
        },
        options
    )

    return {
        users: data,
        ...rest,
    }
}

export function useSpaceAccesskeys(spaceId: string, options: {}) {
    const { data, ...rest } = useQuery(
        [["space_keys", spaceId]],
        async () => {
            const response = await apiClient.get<GetAccesskeyResponse>({
                path: `/space/${spaceId}/accesskey`,
                isAuthRequired: true,
            })
            return response.keys
        },
        options
    )

    return {
        keys: data,
        ...rest,
    }
}
