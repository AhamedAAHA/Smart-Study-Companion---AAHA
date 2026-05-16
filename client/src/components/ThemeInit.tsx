/** Prevents flash of wrong theme before React hydrates */
export function ThemeInit() {
  const script = `
(function () {
  try {
    var raw = localStorage.getItem("ssc_theme_v2");
    var t = raw ? JSON.parse(raw) : { mode: "dark", color: "teal" };
    var root = document.documentElement;
    root.classList.toggle("dark", t.mode !== "light");
    if (t.color) root.setAttribute("data-color", t.color);
  } catch (e) {
    document.documentElement.classList.add("dark");
  }
})();
`;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
