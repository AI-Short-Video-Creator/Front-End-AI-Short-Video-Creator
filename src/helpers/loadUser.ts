import { User } from "@/hooks/data/useAuth";

export const loadUserFromLocalStorage = () => {
    const user = localStorage.getItem("user");
    if (user) {
        return JSON.parse(user) as User;
    }
    return null;
}