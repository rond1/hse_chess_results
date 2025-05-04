import { useEffect } from "react";

export const useHelmetTitle = (title) => {
    useEffect(() => {
        document.title = title;
    }, [title]);
};