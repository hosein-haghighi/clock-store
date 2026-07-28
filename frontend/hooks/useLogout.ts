import api from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type LogoutResponse = {
    message: string;
};

const logoutUser = async (): Promise<LogoutResponse> => {
    const { data } = await api.post(`/auth/logout`)
    return data;
};

export function useLogout() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: logoutUser,

        onSuccess: () => {
            // پاک کردن user از cache
            queryClient.setQueryData(["me"], null);
            queryClient.invalidateQueries({ queryKey: ["me"] })
            // یا:
            // queryClient.removeQueries({ queryKey: ["me"] })
        },
    });
}