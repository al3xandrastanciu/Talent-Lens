import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();

    if (loading) return <div>Loading...</div>;

    if (!user) {
        return <Navigate to="/login" />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Trimitem user-ul la dashboard-ul specific rolului său dacă a greșit ruta
        return <Navigate to={user.role === 'RECRUITER' ? '/dashboard' : '/jobs'} />;
    }

    return children;
};

export default ProtectedRoute;