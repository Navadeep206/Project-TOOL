import { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        // Check for saved session on mount
        const storedUser = localStorage.getItem('sys_auth_user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error("Local storage parsing error");
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        // Simulate API call delay
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (email && password.length >= 6) {
                    const fakeUser = {
                        id: 'OP-' + Math.floor(Math.random() * 10000),
                        email,
                        name: email.split('@')[0],
                        clearance: 'LEVEL_4',
                    };
                    setUser(fakeUser);
                    localStorage.setItem('sys_auth_user', JSON.stringify(fakeUser));
                    toast.success(`Uplink established. Welcome, Operative ${fakeUser.name}.`);
                    navigate('/dashboard');
                    resolve(true);
                } else {
                    toast.error('ACCESS DENIED: Invalid credentials or insufficient clearance.');
                    reject(new Error('Invalid credentials'));
                }
            }, 1200);
        });
    };

    const register = async (name, email, password) => {
        // Simulate API call delay
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (name && email && password.length >= 6) {
                    toast.success('Clearance generated. Registration complete.');
                    navigate('/login');
                    resolve(true);
                } else {
                    toast.error('GENERATION FAILED: Invalid data format.');
                    reject(new Error('Invalid data'));
                }
            }, 1200);
        });
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('sys_auth_user');
        toast('Connection severed. Session terminated.');
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
