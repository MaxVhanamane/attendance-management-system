module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        changeBg: {
          "0%, 100%": {  "background-image": "linear-gradient(to left, #0d9488,#d1d5db,#2dd4bf)",
       
          "background-size":"200%",
          "background-position":"right",
      
        },
          "50%": { "background-image": "linear-gradient(to right,#2dd4bf,#d1d5db,#0d9488)",
          "background-size":"200%",
          "background-position":"left"},
         
        }
      },
      
      animation: {
        changeBg: "changeBg 5s ease-in-out infinite",
        changeBg2: "changeBg 5s ease-in-out infinite",
        'pulse': 'pulse 1s ease-in-out 2'


      }
      
    },
  },
  plugins: [],
}
