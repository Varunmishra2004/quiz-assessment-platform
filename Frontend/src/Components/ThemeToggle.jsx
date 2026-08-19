import React, { useEffect, useState } from "react";

function ThemeToggle() {
    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem("quizportal-theme") === "dark";
    });

    useEffect(() => {
        const root = document.documentElement;

        if (darkMode) {
            root.setAttribute("data-theme", "dark");
            localStorage.setItem("quizportal-theme", "dark");
        } else {
            root.setAttribute("data-theme", "light");
            localStorage.setItem("quizportal-theme", "light");
        }
    }, [darkMode]);

    return (
        <button
            type="button"
            className={`theme-toggle ${darkMode ? "dark" : ""}`}
            onClick={() => setDarkMode((previous) => !previous)}
            aria-label="Toggle theme"
            title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
            <span className="theme-toggle-icon">
                {darkMode ? "☀" : "☾"}
            </span>
        </button>
    );
}

export default ThemeToggle;