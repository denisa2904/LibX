import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
    sub: string;
    role: string;
    exp: number;
}

export const getRoleFromToken = (token: string): string | null => {
    try {
        const decoded = jwtDecode<JwtPayload>(token);
        console.log('Decoded role:', decoded.role);
        return decoded.role;
    } catch (error) {
        console.error('Failed to decode JWT', error);
        return null;
    }
};
