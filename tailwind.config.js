export default {
    content: ["./index.html", "./src/**/*.{ts,tsx}"],
    theme: {
        extend: {
            colors: {
                background: "#f5f7f2",
                surface: "#ffffff",
                ink: "#1e2b24",
                muted: "#6c776f",
                line: "#dde4db",
                success: "#3d7a57",
                warning: "#d8a03f",
                danger: "#c85b50",
                accent: "#88b09a",
                crossfit: "#ffd9b3",
                gym: "#ccefe7",
                recovery: "#e5f1c7",
                rest: "#f7d1db",
                sky: "#d8e8ff",
                peach: "#ffe8d5",
            },
            boxShadow: {
                card: "0 18px 45px rgba(31, 45, 35, 0.08)",
            },
            fontFamily: {
                sans: ["'Instrument Sans'", "system-ui", "sans-serif"],
                serif: ["'Instrument Sans'", "system-ui", "sans-serif"],
            },
        },
    },
    plugins: [],
};
