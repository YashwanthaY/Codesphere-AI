import { useState, useEffect } from "react";

export function useDarkMode() {
  const [isDark, setIsDark] = useState(true);

  // Apply theme on first load
  useEffect(function() {
    const saved = localStorage.getItem("codesphere-theme");
    const startDark = saved !== "light";
    setIsDark(startDark);
    applyTheme(startDark);
  }, []);

  function applyTheme(dark) {
    const html = document.documentElement;
    if (dark) {
      html.classList.add("dark");
      html.classList.remove("light");
    } else {
      html.classList.add("light");
      html.classList.remove("dark");
    }
  }

  function toggle() {
    setIsDark(function(prev) {
      const next = !prev;
      applyTheme(next);
      localStorage.setItem("codesphere-theme", next ? "dark" : "light");
      return next;
    });
  }

  return { isDark, toggle };
}