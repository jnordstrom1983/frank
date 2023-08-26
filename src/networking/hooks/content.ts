import { GetContentItemResponse } from "@/app/api/space/[spaceid]/content/[contentid]/get";
import { apiClient } from "../ApiClient";

import { GetContentResponse } from "@/app/api/space/[spaceid]/content/get";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export function useContent(spaceId: string, options: {}) {

  const router = useRouter()

  const { data, ...rest } = useQuery(
    [["content", spaceId]],
    async () => {


      const response = await apiClient
        .get<GetContentResponse>({
          path: `/space/${spaceId}/content`,
          isAuthRequired: true,
        })
      return response.items


    },
    options

  );

  return {
    items: data,
    ...rest,
  };
}



export function useContentItem(spaceId: string, contentId : string, options: {}) {

  const router = useRouter()

  const { data, ...rest } = useQuery(
    [["content", contentId]],
    async () => {


      const response = await apiClient
        .get<GetContentItemResponse>({
          path: `/space/${spaceId}/content/${contentId}`,
          isAuthRequired: true,
        })
      return response


    },
    options

  );

  return {
    item: data,
    ...rest,
  };
}


