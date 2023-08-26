import { GetAssetFolderResponse } from "@/app/api/space/[spaceid]/asset/folder/get";
import { GetAssetResponse } from "@/app/api/space/[spaceid]/asset/get";
import { GetAssetItemResponse } from "@/app/api/space/[spaceid]/asset/[assetid]/get";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../ApiClient";


export function useAssets(spaceId: string, options: {}) {
  const { data, ...rest } = useQuery(
    [["asset", spaceId]],
    async () => {


      const response = await apiClient
        .get<GetAssetResponse>({
          path: `/space/${spaceId}/asset`,
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


export function useAsset(spaceId: string, assetId: string, options: {}) {


  const { data, ...rest } = useQuery(
    [["assetitem", assetId]],
    async () => {


      const response = await apiClient
        .get<GetAssetItemResponse>({
          path: `/space/${spaceId}/asset/${assetId}`,
          isAuthRequired: true,
        })
      return response


    },
    options

  );

  return {
    asset: data,
    ...rest,
  };
}



export function useAssetFolders(spaceId: string, options: {}) {
  const { data, ...rest } = useQuery(
    [["asset_folders", spaceId]],
    async () => {
      const response = await apiClient.get<GetAssetFolderResponse>({
        path: `/space/${spaceId}/asset/folder`,
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



// export function useContentItem(spaceId: string, contentId : string, options: {}) {

//   const router = useRouter()

//   const { data, ...rest } = useQuery(
//     [["content", contentId]],
//     async () => {


//       const response = await apiClient
//         .get<GetContentItemResponse>({
//           path: `/space/${spaceId}/content/${contentId}`,
//           isAuthRequired: true,
//         })
//       return response


//     },
//     options

//   );

//   return {
//     item: data,
//     ...rest,
//   };
// }


