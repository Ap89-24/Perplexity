import React, { Children } from 'react'
import { useSelector } from 'react-redux';
import LoadingScreen from './LoadingScreen';
import { Navigate } from 'react-router';

const Protected = ({Children}) => {

    const user = useSelector(state => state.auth.user);
    const loading = useSelector(state => state.auth.loading);

    if (loading) {
        return <LoadingScreen />
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }
  
    return Children;
}

export default Protected
