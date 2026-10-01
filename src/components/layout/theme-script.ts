// This tiny script runs BEFORE the page is drawn, so the right theme, font and
// text size are used from the very first frame (no white flash in dark mode).
// It reads the settings saved by the store in localStorage.
export const THEME_SCRIPT = `(function(){try{
var raw=localStorage.getItem('rumbo-v1');var s=raw?(JSON.parse(raw).state||{}).settings||{}:{};
var c=document.documentElement.classList;
var dark=s.theme==='dark'||((!s.theme||s.theme==='system')&&window.matchMedia('(prefers-color-scheme: dark)').matches);
if(dark)c.add('dark');
if(s.dyslexiaFont)c.add('dyslexia');
if(s.largeText)c.add('large-text');
if(s.lowData)c.add('low-data');
if(s.locale)document.documentElement.lang=s.locale;
}catch(e){}})();`;
