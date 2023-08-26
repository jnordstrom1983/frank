import { apiClient } from "../ApiClient"

import { GetWebhookEventItemResponse } from "@/app/api/space/[spaceid]/webhook/[webhookid]/event/[eventid]/get"
import { GetWebhookEventResponse } from "@/app/api/space/[spaceid]/webhook/[webhookid]/event/get"
import { GetWebhookResponse } from "@/app/api/space/[spaceid]/webhook/get"
import { useQuery } from "@tanstack/react-query"

export function useWebhooks(spaceId: string, options: {}) {
    const { data, ...rest } = useQuery(
        [["webhooks", spaceId]],
        async () => {
            const response = await apiClient.get<GetWebhookResponse>({
                path: `/space/${spaceId}/webhook`,
                isAuthRequired: true,
            })
            return response.webhooks
        },
        options
    )

    return {
        webhooks: data,
        ...rest,
    }
}


export function useWebhookEvents(spaceId: string, webhookId : string, options: {}) {
    const { data, ...rest } = useQuery(
        [["webhookevents", webhookId]],
        async () => {
            const response = await apiClient.get<GetWebhookEventResponse>({
                path: `/space/${spaceId}/webhook/${webhookId}/event`,
                isAuthRequired: true,
            })
            return response.events
        },
        options
    )

    return {
        events: data,
        ...rest,
    }
}


export function useWebhookEvent(spaceId: string, webhookId : string, eventId : string, options: {}) {
    const { data, ...rest } = useQuery(
        [["webhookevent", eventId]],
        async () => {
            const response = await apiClient.get<GetWebhookEventItemResponse>({
                path: `/space/${spaceId}/webhook/${webhookId}/event/${eventId}`,
                isAuthRequired: true,
            })
            return response
        },
        options
    )

    return {
        event: data,
        ...rest,
    }
}
