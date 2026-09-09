import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API, User } from "./types";
import api from "@/lib/api";

type SignupInput = {
    name: string;
    email: string;
    password: string;
};

const signupUser = async (data: SignupInput): Promise<any> => {
    const { data: resData } = await api.post(`/signup`, data)
    return resData
};

export function useSignup() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: signupUser,

        onSuccess: (data) => {
            // sync user after signup
            queryClient.setQueryData(["me"], data.data);
        },
    });
}