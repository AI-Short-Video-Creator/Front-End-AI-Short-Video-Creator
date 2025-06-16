import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/config";

const useSuggestion = (keyword: string, limit: number, source: string) => {

    const { data: suggestions, refetch: getSuggestions } = useQuery({
        queryKey: ["suggestions", keyword, limit],
        queryFn: async () => {
            const res = await axiosInstance.get(`/script/topics/${source}`, {
                params: {
                    keyword,
                    limit,
                },
            });
            return res.data;
        },
        enabled: !!keyword && limit > 0,
    });

    return { suggestions, getSuggestions };
};

export default useSuggestion;