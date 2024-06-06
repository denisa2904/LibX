// import { useEffect, useState } from 'react';
// export function getCookie(name: string): string | null{
// 	const nameLenPlus = (name.length + 1);
// 	return document.cookie
// 		.split(';')
// 		.map(c => c.trim())
// 		.filter(cookie => {
// 			return cookie.substring(0, nameLenPlus) === `${name}=`;
// 		})
// 		.map(cookie => {
// 			return decodeURIComponent(cookie.substring(nameLenPlus));
// 		})[0] || null;
// }

// export function useAuth() {
//     const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  
//     useEffect(() => {
//       const token = getCookie('authToken');
//       setIsAuthenticated(!!token);
//     }, []);
  
//     return isAuthenticated;
//   }