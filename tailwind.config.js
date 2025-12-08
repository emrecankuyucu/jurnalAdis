/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: '#0f0f13',
                surface: '#1a1a20',
                primary: '#d4af37', // Gold
                'primary-hover': '#b5952f',
                secondary: '#2d2d35',
                text: '#e0e0e0',
                'text-muted': '#a0a0a0',
                danger: '#ef4444',
                success: '#22c55e',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
