import { useQuery, useQueryClient } from "@tanstack/react-query";
import { User } from "./types";
import api from "@/lib/api";
import { useEffect } from "react";

const fetchMe = async (): Promise<User | null> => {
    const { data: resData } = await api.get(`/users/me`)
    return resData;
};
export function useUser() {
    const queryClient = useQueryClient();

    // listen for logout event from interceptor
    useEffect(() => {
        const handleLogout = () => {
            queryClient.setQueryData(["me"], null); // clear user
        };

        window.addEventListener("auth:logout", handleLogout);
        return () => window.removeEventListener("auth:logout", handleLogout);
    }, [queryClient]);

    const query = useQuery({
        queryKey: ["me"],
        queryFn: fetchMe,
        retry: false,
        staleTime: 1000 * 10, // 10s
    });


    return {
        user: query.data,
        loading: query.isLoading,
        isAuthenticated: !!query.data,
        error: query.error,
        refetch: query.refetch,
    };
}