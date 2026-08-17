const currentUrl = () => {
  if (typeof window === "undefined") {
    return new URL("http://localhost/");
  }

  return new URL(window.location.href);
};

export const useRouter = () => ({
  push: (href: string) => window.history.pushState({}, "", href),
  replace: (href: string) => window.history.replaceState({}, "", href),
  prefetch: () => {},
  back: () => window.history.back(),
  forward: () => window.history.forward(),
  refresh: () => window.location.reload(),
});

export const usePathname = () => currentUrl().pathname;
export const useSearchParams = () => currentUrl().searchParams;
