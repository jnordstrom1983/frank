import { ApiError } from "@/models/api";
import { apiClient } from "../ApiClient";

import { useMutation, useQuery } from "@tanstack/react-query";

import { useRouter } from "next/navigation";
import { UserProfileGetResponse } from "@/app/api/user/profile/get";
import { GetUserResponse } from "@/app/api/user/get";
import { GetUserItemResponse } from "@/app/api/user/[userid]/get";

export function useProfile() {

  const router = useRouter()

  const { data, ...rest } = useQuery(
    ["profile"],
    async () => {

      try {
        const response = await apiClient
          .get<UserProfileGetResponse>({
            path: "/user/profile",
            isAuthRequired: true,
          })
        localStorage.setItem("FRANK_AUTH_TOKEN", response.token)
        return response
      } catch (ex) {
        localStorage.removeItem("FRANK_AUTH_TOKEN")
        router.replace("/login")
        return null
      }

    }

  );

  return {
    profile: data,
    ...rest,
  };
}



export function useUsers(options: {}) {
  const { data, ...rest } = useQuery(
    [["users"]],
    async () => {
      const response = await apiClient.get<GetUserResponse>({
        path: `/user`,
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



export function useUser(userId: string, options: {}) {
  const { data, ...rest } = useQuery(
    [["user", userId]],
    async () => {
      const response = await apiClient.get<GetUserItemResponse>({
        path: `/user/${userId}`,
        isAuthRequired: true,
      })
      return response
    },
    options
  )

  return {
    user: data,
    ...rest,
  }
}