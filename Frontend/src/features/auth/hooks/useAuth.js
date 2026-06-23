import { useDispatch } from "react-redux";
import { register, login, getMe } from "../services/auth.api.js";
import { setUser, setLoading, setError } from "../auth.slice.js";



export const useAuth = () => { 
    const dispatch = useDispatch();
    
    const handleRegister = async ({username, email, password}) => { 
        try {
            dispatch(setLoading(true));
            const data = await register({ username, email, password });
        } catch (error) {
            dispatch(setError(error.response?.data?.message || "Registration failed"));
        } finally {
            dispatch(setLoading(false));
        }
    };

    const handleLogin = async ({ email, password }) => { 
        try {
            dispatch(setLoading(true));
            const data = await login({ email, password });
            dispatch(setUser(data.user));
        } catch (error) {
            dispatch(setError(error.response?.data?.message || "Login failed"));
        } finally {
            dispatch(setLoading(false));
        }
    };

    const handleGetMe = async () => {
        try {
            dispatch(setLoading(true));
            const data = await getMe();
            dispatch(setUser(data.user));
        } catch (error) {
            dispatch(setError(error.response?.data?.message || "Fetching user failed"));
        } finally {
            dispatch(setLoading(false));
        }
    };

    return {
        handleRegister,
        handleLogin,
        handleGetMe
    }
};

