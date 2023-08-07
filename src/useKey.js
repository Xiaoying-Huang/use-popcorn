import { useEffect } from "react";
export function useKey(key, action) {
    useEffect(function () {
        const handleKeyDown = function (e) {
            if (e.code.toLowerCase() === key.toLowerCase()) {
                action();
            }
        };

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [action, key]);
}