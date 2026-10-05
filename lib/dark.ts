// Dark mode (components/DarkMode.tsx, app/dark.css): on when the visitor's
// device asks for it, or at night in London, whatever the device says.

export const DARK_FROM = 19; // 7pm, London time
export const DARK_UNTIL = 7; // 7am

export const isNightHour = (hour: number) => hour >= DARK_FROM || hour < DARK_UNTIL;

// In <head>, so a page that should be dark is dark from its first paint.
// Plain ES5, no imports; DarkMode keeps it right after that.
export const DARK_SCRIPT = `(function(){try{
var h=Number(new Intl.DateTimeFormat("en-GB",{timeZone:"Europe/London",hour:"2-digit",hourCycle:"h23"}).format(new Date()));
if(matchMedia("(prefers-color-scheme: dark)").matches||h>=${DARK_FROM}||h<${DARK_UNTIL})document.documentElement.classList.add("dark");
}catch(e){}})();`;
