import React, { useEffect } from 'react'
import { useSelector } from 'react-redux';
import { useChat } from '../hooks/useChat.js';


const Dashboard = () => {

  const chat = useChat();
  console.log("Dashboard Rendered");

  const { user } = useSelector((state) => state.auth);
  console.log(user);

  useEffect(() => {
    chat.initSocketConnection();
  }, [])

  return (
    <div>
      Dashboard
    </div>
  )
}

export default Dashboard
