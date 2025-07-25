import axios from "@/utils/axios";
import { useAuth } from "@/contexts/authProvider";

const useRefreshToken = () => {
    const { setToken } = useAuth();

    const refresh = async () => {
        const response = await axios.get('/auth/refresh-token', {
            withCredentials: true
        });
        setToken(response.data.accessToken);
        return response.data.accessToken;
    }
    return refresh;
};

export default useRefreshToken;