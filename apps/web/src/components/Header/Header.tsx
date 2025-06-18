import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AuthContextProps } from "react-oidc-context";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { getRepoStats } from "../../services/githubApi";
import { env } from "../../config/env";
import "./Header.css";

const isSelfHost = env.isSelfHost;
const DOCS_URL = env.docsUrl;

interface HeaderProps {
  auth?: AuthContextProps;
}

export default function Header({ auth }: HeaderProps) {
  const isAuthenticated = auth?.isAuthenticated;
  const [repoStats, setRepoStats] = useState({ stars: 0, forks: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const stats = await getRepoStats();
      setRepoStats(stats);
    };
    fetchStats();
  }, []);

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="30"
                height="30"
                viewBox="0 0 30 30"
                fill="none"
                className="text-secondary"
              >
                <path
                  d="M7.35 12.225C8.03148 12.4978 8.77803 12.5646 9.4971 12.4171C10.2162 12.2695 10.8761 11.9142 11.3952 11.3952C11.9142 10.8761 12.2695 10.2162 12.4171 9.4971C12.5646 8.77803 12.4978 8.03148 12.225 7.35C13.0179 7.13652 13.7188 6.6687 14.2201 6.01836C14.7214 5.36802 14.9954 4.57111 15 3.75C17.225 3.75 19.4001 4.4098 21.2502 5.64597C23.1002 6.88213 24.5422 8.63914 25.3936 10.6948C26.2451 12.7505 26.4679 15.0125 26.0338 17.1948C25.5998 19.3771 24.5283 21.3816 22.955 22.955C21.3816 24.5283 19.3771 25.5998 17.1948 26.0338C15.0125 26.4679 12.7505 26.2451 10.6948 25.3936C8.63914 24.5422 6.88213 23.1002 5.64597 21.2502C4.4098 19.4001 3.75 17.225 3.75 15C4.57111 14.9954 5.36802 14.7214 6.01836 14.2201C6.6687 13.7188 7.13652 13.0179 7.35 12.225Z"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="ml-2 text-xl font-semibold text-text-dark">chunkr</span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <a
              href="https://github.com/buildorin/data-extract"
              target="_blank"
              className="flex items-center text-text-light hover:text-text-dark"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="currentColor"
                className="mr-2"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M8.97318 0C4.01125 0 0 4.04082 0 9.03986C0 13.0359 2.57014 16.4184 6.13561 17.6156C6.58139 17.7056 6.74467 17.4211 6.74467 17.1817C6.74467 16.9722 6.72998 16.2538 6.72998 15.5053C4.23386 16.0442 3.71406 14.4277 3.71406 14.4277C3.31292 13.3801 2.71855 13.1108 2.71855 13.1108C1.90157 12.557 2.77806 12.557 2.77806 12.557C3.68431 12.6169 4.15984 13.4849 4.15984 13.4849C4.96194 14.8618 6.25445 14.4727 6.77443 14.2332C6.84863 13.6495 7.08649 13.2454 7.33904 13.021C5.3482 12.8114 3.25359 12.0332 3.25359 8.56084C3.25359 7.57304 3.60992 6.76488 4.17453 6.13635C4.08545 5.9119 3.77339 4.9838 4.2638 3.74161C4.2638 3.74161 5.02145 3.5021 6.7298 4.66953C7.4612 4.47165 8.21549 4.37099 8.97318 4.37014C9.73084 4.37014 10.5032 4.47502 11.2164 4.66953C12.9249 3.5021 13.6826 3.74161 13.6826 3.74161C14.173 4.9838 13.8607 5.9119 13.7717 6.13635C14.3511 6.76488 14.6928 7.57304 14.6928 8.56084C14.6928 12.0332 12.5982 12.7963 10.5924 13.021C10.9194 13.3053 11.2015 13.844 11.2015 14.6972C11.2015 15.9094 11.1868 16.8823 11.1868 17.1816C11.1868 17.4211 11.3503 17.7056 11.7959 17.6158C15.3613 16.4182 17.9315 13.0359 17.9315 9.03986C17.9462 4.04082 13.9202 0 8.97318 0Z"
                />
              </svg>
              <span className="text-sm font-medium">
                {repoStats.stars >= 1000
                  ? `${(repoStats.stars / 1000).toFixed(1)}K`
                  : repoStats.stars}
              </span>
            </a>

            {!isSelfHost && (
              <Link
                to="/blog"
                className="text-sm font-medium text-text-light hover:text-text-dark"
              >
                Blog
              </Link>
            )}

            <a
              href="https://cal.com/useorin/orin-harish-sync-up"
              target="_blank"
              className="text-sm font-medium text-text-light hover:text-text-dark"
            >
              Contact
            </a>

            <a
              href="/#pricing"
              className="text-sm font-medium text-text-light hover:text-text-dark"
            >
              Pricing
            </a>

            <a
              href={DOCS_URL}
              target="_blank"
              className="text-sm font-medium text-text-light hover:text-text-dark"
            >
              Docs
            </a>

            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="text-sm font-medium text-text-light hover:text-text-dark"
              >
                Dashboard
              </Link>
            ) : (
              <button
                onClick={() => {
                  auth?.signinRedirect({
                    state: { returnTo: "/dashboard" },
                  });
                }}
                className="text-sm font-medium text-secondary hover:text-secondary-dark"
              >
                Login
              </button>
            )}
          </nav>

          <div className="md:hidden flex items-center">
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="p-2 rounded-md text-text-light hover:text-text-dark hover:bg-gray-100">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content
                className="w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
                sideOffset={5}
              >
                <DropdownMenu.Item className="px-4 py-2 text-sm text-text-light hover:bg-gray-100">
                  <a
                    href="https://github.com/buildorin/data-extract"
                    target="_blank"
                    className="block"
                  >
                    Github
                  </a>
                </DropdownMenu.Item>
                <DropdownMenu.Item className="px-4 py-2 text-sm text-text-light hover:bg-gray-100">
                  <a
                    href="https://cal.com/useorin/orin-harish-sync-up"
                    target="_blank"
                    className="block"
                  >
                    Contact
                  </a>
                </DropdownMenu.Item>
                <DropdownMenu.Item className="px-4 py-2 text-sm text-text-light hover:bg-gray-100">
                  <a href="/#pricing" className="block">
                    Pricing
                  </a>
                </DropdownMenu.Item>
                <DropdownMenu.Item className="px-4 py-2 text-sm text-text-light hover:bg-gray-100">
                  <a href={DOCS_URL} target="_blank" className="block">
                    Docs
                  </a>
                </DropdownMenu.Item>
                {isAuthenticated ? (
                  <DropdownMenu.Item className="px-4 py-2 text-sm text-text-light hover:bg-gray-100">
                    <Link to="/dashboard" className="block">
                      Dashboard
                    </Link>
                  </DropdownMenu.Item>
                ) : (
                  <DropdownMenu.Item className="px-4 py-2 text-sm text-text-light hover:bg-gray-100">
                    <button
                      onClick={() => {
                        auth?.signinRedirect({
                          state: { returnTo: "/dashboard" },
                        });
                      }}
                      className="block w-full text-left"
                    >
                      Login
                    </button>
                  </DropdownMenu.Item>
                )}
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          </div>
        </div>
      </div>
    </header>
  );
}
