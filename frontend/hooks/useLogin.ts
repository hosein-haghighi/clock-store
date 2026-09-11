import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";


type LoginInput = {
    email: string;
    password: string;
};
type Res = {
    data: any,
    message: string,
    status: string
}
const loginUser = async (data: LoginInput): Promise<Res> => {
    const { data: resData } = await api.post("/auth/login", data);
    return resData;
};

export function useLogin() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: loginUser,

        onSuccess: (data: Res) => {
            // sync user in cache
            queryClient.setQueryData(["me"], data.data);
        },
    });
}