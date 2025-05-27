import axiosInstance from "@/config";
import { useMutation } from "@tanstack/react-query";
import { create } from "zustand"; 
import { useToast } from "../use-toast";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";

export type User = {
    id: string,
    email: string,
    password: string,
    fullname: string,
}

export const useUserStore = create<{
  user?: User;
  setUser: (user: User | undefined) => void;
}>((set) => ({
  user: undefined,
  setUser: (user: User | undefined) => set({ user }),
}));

const useAuth = () => {
    const { setUser, user } = useUserStore();
    const { toast } = useToast();
    const navigate = useNavigate();
    
    const { mutate: signIn, isPending: isSigningIn } = useMutation({
        mutationFn: async (data: { email: string; password: string }) => {
            const response = await axiosInstance.post("/auth/login", data);
            return response.data;
        },
        onSuccess: (data) => {
            setUser(data.user);
            localStorage.setItem("user", JSON.stringify(data.user));
            localStorage.setItem("token", data.access_token);
            toast({
                title: "Login successful",
                description: "Welcome back!",
                variant: "default",
            })
            navigate("/");
        },
        onError: (error) => {
            const axiosError = error as AxiosError<{ error: string }>;
            const errorMessage =
                axiosError.response?.data?.error || "Please check your login information.";

            toast({
                title: "Login failed",
                description: errorMessage,
                variant: "destructive",
            });
        },
    });

    const { mutate: signUp, isPending: isSigningUp } = useMutation({
        mutationFn: async (data: { email: string; password: string; fullname: string }) => {
            const response = await axiosInstance.post("/auth/register", data);
            return response.data;
        },
        onSuccess: (data) => {
            setUser(data.user);
            localStorage.setItem("user", JSON.stringify(data.user));
            localStorage.setItem("token", data.access_token);
            toast({
                title: "Registration successful",
                description: "Welcome to our platform!",
                variant: "default",
            });
            navigate("/");
        },
        onError: (error) => {
            const axiosError = error as AxiosError<{ error: string }>;
            const errorMessage =
                axiosError.response?.data?.error || "Please check your registration information.";

            toast({
                title: "Registration failed",
                description: errorMessage,
                variant: "destructive",
            });
        },
    });

    const logout = (isShowToast: boolean = true) => {
        setUser(undefined);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        if (isShowToast) {
            toast({
                title: "Logout successful",
                description: "You have been logged out of your account.",
                variant: "default",
            });
        }
        navigate("/login");
    }

    return {
        user,
        setUser,
        signIn,
        isSigningIn,
        signUp,
        isSigningUp,
        logout,
    };
};

export default useAuth;
