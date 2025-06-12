'use client'
import { usePathname, useSearchParams } from "next/navigation";
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
import { useEffect } from "react";

const PUBLIC_POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const PUBLIC_POSTHOG_HOST = "https://e.craigsmith.dev"

if (typeof window !== 'undefined' && PUBLIC_POSTHOG_KEY) {
    posthog.init(PUBLIC_POSTHOG_KEY, {
        api_host: PUBLIC_POSTHOG_HOST,
        capture_pageview: false, // Disable automatic pageview capture, as we capture manually
        persistence: 'memory'
    })
} else {
  console.log("NO PUBLIC_POSTHOG_KEY");
}

export function PostHogPageview(): JSX.Element {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (pathname) {
            let url = window.origin + pathname;
            if (searchParams && searchParams.toString()) {
                url = url + `?${searchParams.toString()}`;
            }
            posthog.capture("$pageview", {
                $current_url: url,
            });
        }
    }, [pathname, searchParams]);

    return <></>;
}

export function PHProvider({
    children,
}: {
    children: React.ReactNode
}) {
    return <PostHogProvider client={posthog}>{children}</PostHogProvider>
}