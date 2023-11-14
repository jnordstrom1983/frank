import { GetThemeResponse } from "@/app/api/theme/get";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../ApiClient";


export function useTheme() {
  const { data, ...rest } = useQuery(
    [["theme"]],
    async () => {
      const response = await apiClient
        .get<GetThemeResponse>({
          path: `/theme`,
          isAuthRequired: true,
        })
      return response
    },
    {}
  );

  return {
    theme : data,
    ...rest,
  };
}

