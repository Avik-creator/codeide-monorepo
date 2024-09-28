import React from "react";
import { Button } from "@repo/ui/components/ui/button";
import { GitBranch, AlertCircle, AlertTriangle, Bell, Check } from "lucide-react";

const NextjsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 256 256">
    <path
      fill="currentColor"
      d="M119.616 25.024c-1.008.064-3.456.32-5.44.576c-22.72 2.752-44.8 13.312-62.528 29.888c-10.368 9.792-17.76 19.456-24.32 32.064c-8.768 16.768-13.312 35.2-13.312 53.888c0 19.52 4.736 37.056 14.528 53.824c15.424 26.688 41.344 46.08 71.36 53.376c12.16 2.944 26.688 3.712 38.912 2.048c38.72-5.44 71.936-32.192 86.4-69.376c4.736-12.16 6.784-22.4 7.232-36.416c.704-18.816-2.112-34.88-9.408-52.736c-4.16-10.24-9.088-18.432-16.448-27.52c-10.048-12.352-24.768-23.488-39.936-30.208c-15.36-6.784-31.36-9.984-47.04-9.408Zm22.4 14.784c2.304.512 7.424 1.92 11.392 3.136c17.088 5.376 31.36 14.72 43.52 28.48c2.56 2.88 4.672 5.376 4.672 5.568c0 .128-20.16 14.592-20.416 14.656c-.064 0-1.216-1.472-2.56-3.328c-5.824-8.064-13.824-14.528-22.784-18.368c-5.824-2.496-9.856-3.392-16.832-3.84c-7.04-.384-11.776.384-17.856 2.816c-11.648 4.672-20.736 14.144-24.768 25.792c-1.92 5.504-2.368 8.32-2.368 14.912c0 6.784.384 9.216 2.432 15.104c3.776 10.816 12.096 19.776 22.592 24.384c5.696 2.496 9.856 3.456 16.512 3.84c8.512.448 15.36-.832 22.848-4.352l3.008-1.408l.064 59.904l.128 59.968l-3.776-.832c-5.184-1.152-16.832-1.344-22.592-.384c-32.768 5.312-59.712 28.544-70.336 60.8l-1.92 5.824l-10.688-15.872c-13.504-20.096-22.016-36.864-26.176-51.648c-1.92-6.784-2.112-8.512-2.112-18.368c0-9.984.128-11.52 2.048-18.368c7.232-26.176 26.24-48.512 51.072-60.032c2.944-1.344 5.376-2.56 5.376-2.624c0-.128-1.152-2.048-2.56-4.288c-1.408-2.24-2.56-4.224-2.56-4.416c0-.704 15.36-11.776 22.144-15.936c8.384-5.184 19.648-10.432 28.608-13.376c5.696-1.856 14.976-3.968 20.096-4.544c4.224-.512 15.36-.192 19.968.512Z"
    />
  </svg>
);

export default function Bottombar() {
  return (
    <footer className="h-6 bg-background border-t flex items-center justify-between text-xs px-2">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="sm" className="h-5 px-1" asChild>
          <a href="#" target="_blank" rel="noreferrer noopener" className="flex items-center">
            <GitBranch className="mr-1 h-3 w-3" />
            <span>main</span>
          </a>
        </Button>
        <Button variant="ghost" size="sm" className="h-5 px-1">
          <AlertCircle className="mr-1 h-3 w-3" />
          <span className="mr-2">0</span>
          <AlertTriangle className="mr-1 h-3 w-3" />
          <span>0</span>
        </Button>
      </div>
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="sm" className="h-5 px-1">
          <NextjsIcon />
          <span className="ml-1">Powered by Next.js</span>
        </Button>
        <Button variant="ghost" size="sm" className="h-5 px-1">
          <Check className="mr-1 h-3 w-3" />
          <span>Prettier</span>
        </Button>
        <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
          <Bell className="h-3 w-3" />
        </Button>
      </div>
    </footer>
  );
}
