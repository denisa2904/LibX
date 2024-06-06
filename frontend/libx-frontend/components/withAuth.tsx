// import { useRouter } from 'next/router';
// import { useEffect } from 'react';
// import { useAuth } from '@/context/authcontext';

// const withAuth = (WrappedComponent: any) => {
//     return (props : any) => {
//         const router = useRouter();
//         const { user } = useAuth();

//         useEffect(() => {
//             if (!user) {
//                 router.push('/login');
//             }
//         }, [router, user]);

//         return user ? <WrappedComponent {...props} /> : null; 
//     };
// };

// export default withAuth;
