/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#faf5ff',
                    100: '#f3e8ff',
                    200: '#e9d5ff',
                    300: '#d8b4fe',
                    400: '#c084fc',
                    500: '#a855f7',
                    600: '#9333ea',
                    700: '#7e22ce',
                    800: '#6b21a8',
                    900: '#581c87',
                },
                secondary: {
                    50: '#f8fafc',
                    100: '#f5f3ff',
                    200: '#ede9fe',
                    300: '#ddd6fe',
                    400: '#c4b5fd',
                    500: '#a78bfa',
                    600: '#8b5cf6',
                    700: '#7c3aed',
                    800: '#6d28d9',
                    900: '#5b21b6',
                },
            },
            backgroundImage: {
                'gradient-auth': 'linear-gradient(135deg, #a855f7 0%, #c084fc 100%)',
                'gradient-auth-dark': 'linear-gradient(135deg, #7e22ce 0%, #8b5cf6 100%)',
            },
            boxShadow: {
                'neon': '0 0 20px rgba(168, 85, 247, 0.5)',
                'neon-dark': '0 0 20px rgba(139, 92, 246, 0.3)',
            },
        },
    },
    plugins: [],
}
