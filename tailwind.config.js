module.exports = {
    darkMode: 'class', // Поддержка темной темы через класс "dark"
    content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
    theme: {
        extend: {
            colors: {
                'dark-bg': '#1a202c', // Фон темной темы
                'dark-text': '#cbd5e0', // Текст темной темы
                'dark-border': '#2d3748', // Бордеры темной темы
                'dark-hover': '#4a5568', // Цвет для hover в темной теме
            },
        },
    },
    plugins: [],
};
