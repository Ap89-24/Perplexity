import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const isDark = true;

    useEffect(() => {
        const htmlElement = document.documentElement;
        htmlElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    }, []);

    const toggleTheme = () => {};

    return (
        <ThemeContext.Provider value={{ isDark, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};
