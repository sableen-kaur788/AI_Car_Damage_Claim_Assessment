module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        surface: "#0f172a",
        panel: "#111c34",
        border: "#223150",
        accent: "#4ade80",
      },
      boxShadow: {
        glow: "0 20px 50px rgba(15, 23, 42, 0.45)",
      },
    },
  },
  plugins: [],
};
