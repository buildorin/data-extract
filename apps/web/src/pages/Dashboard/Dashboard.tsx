import { Flex, Text } from "@radix-ui/themes";
import "./Dashboard.css";
import BetterButton from "../../components/BetterButton/BetterButton";
import TaskTable from "../../components/TaskTable/TaskTable";
import { useAuth } from "react-oidc-context";
import useUser from "../../hooks/useUser";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useTaskQuery } from "../../hooks/useTaskQuery";
import { Suspense, lazy } from "react";
import Loader from "../Loader/Loader";
import Usage from "../../components/Usage/Usage";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import UploadDialog from "../../components/Upload/UploadDialog";
import { useTasksQuery } from "../../hooks/useTaskQuery";
import ApiKeyDialog from "../../components/ApiDialog/ApiKeyDialog";
import { toast } from "react-hot-toast";
import { getBillingPortalSession } from "../../services/stripeService";

// Lazy load components
const Viewer = lazy(() => import("../../components/Viewer/Viewer"));

const DOCS_URL = import.meta.env.VITE_DOCS_URL;

export default function Dashboard() {
  const auth = useAuth();
  const user = useUser();
  const [selectedNav, setSelectedNav] = useState("Extracts");
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const [isNavOpen, setIsNavOpen] = useState(true);
  const [showApiKey, setShowApiKey] = useState(false);

  const location = useLocation();
  const [searchParams] = useSearchParams();
  const taskId = searchParams.get("taskId");

  const { data: taskResponse, isLoading } = useTaskQuery(taskId || "");

  const navigate = useNavigate();

  const { refetch: refetchTasks } = useTasksQuery(
    parseInt(searchParams.get("tablePageIndex") || "0") + 1,
    parseInt(searchParams.get("tablePageSize") || "20")
  );

  useEffect(() => {
    if (!searchParams.has("view")) {
      const params = new URLSearchParams(searchParams);
      params.set("view", "extracts");
      navigate({
        pathname: "/dashboard",
        search: params.toString(),
      });
    }
  }, [navigate, searchParams]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setIsProfileMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (location.pathname === "/dashboard") {
      setSelectedNav("Extracts");
    }
  }, [location.pathname]);

  useEffect(() => {
    if (location.state?.selectedNav) {
      setSelectedNav(location.state.selectedNav);
      // Clear the state after using it
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const navIcons = {
    Extracts: (
      <g>
        <rect x="6" y="4" width="10" height="14" rx="2" stroke="#222" strokeWidth="1.7" fill="none" />
        <line x1="9" y1="7" x2="13" y2="7" stroke="#222" strokeWidth="1.2" />
        <line x1="9" y1="10" x2="13" y2="10" stroke="#222" strokeWidth="1.2" />
        <line x1="9" y1="13" x2="13" y2="13" stroke="#222" strokeWidth="1.2" />
        <path d="M11 15V11" stroke="#222" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M9.5 13.5L11 15L12.5 13.5" stroke="#222" strokeWidth="1.5" strokeLinecap="round" />
      </g>
    ),
    Flows: (
      <g>
        <path d="M12.75 7.5H21.25" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12.75 16.5H21.25" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="2.75" y="4.75" width="5.5" height="5.5" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="2.75" y="13.75" width="5.5" height="5.5" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    ),
    Connectors: (
      <g>
        <circle cx="6" cy="12" r="2" stroke="#222" strokeWidth="1.5" fill="none" />
        <circle cx="16" cy="8" r="2" stroke="#222" strokeWidth="1.5" fill="none" />
        <circle cx="16" cy="16" r="2" stroke="#222" strokeWidth="1.5" fill="none" />
        <line x1="7.5" y1="12" x2="14" y2="8.5" stroke="#222" strokeWidth="1.2" />
        <line x1="7.5" y1="12" x2="14" y2="15.5" stroke="#222" strokeWidth="1.2" />
        <line x1="16" y1="10" x2="16" y2="14" stroke="#222" strokeWidth="1.2" />
      </g>
    ),
    Usage: (
      <g>
        <svg
          width="22"
          height="22"
          viewBox="0 0 22 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clipPath="url(#clip0_113_1401)">
            <path
              d="M5.25 20.25H6.75C7.30228 20.25 7.75 19.8023 7.75 19.25L7.75 13.75C7.75 13.1977 7.30228 12.75 6.75 12.75H5.25C4.69772 12.75 4.25 13.1977 4.25 13.75L4.25 19.25C4.25 19.8023 4.69772 20.25 5.25 20.25Z"
              stroke="#222"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M18.25 20.25H19.75C20.3023 20.25 20.75 19.8023 20.75 19.25V9.75C20.75 9.19772 20.3023 8.75 19.75 8.75H18.25C17.6977 8.75 17.25 9.19771 17.25 9.75V19.25C17.25 19.8023 17.6977 20.25 18.25 20.25Z"
              stroke="#222"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M11.75 20.25H13.25C13.8023 20.25 14.25 19.8023 14.25 19.25L14.25 5.75C14.25 5.19771 13.8023 4.75 13.25 4.75H11.75C11.1977 4.75 10.75 5.19771 10.75 5.75L10.75 19.25C10.75 19.8023 11.1977 20.25 11.75 20.25Z"
              stroke="#222"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
          <defs>
            <clipPath id="clip0_113_1401">
              <rect
                width="24"
                height="24"
                fill="white"
                transform="translate(0.5)"
              />
            </clipPath>
          </defs>
        </svg>
      </g>
    ),
  };

  const handleNavigation = useCallback(
    (item: string) => {
      const params = new URLSearchParams();
      const currentParams = new URLSearchParams(searchParams);

      // Set view first (either "extracts", "flows", or "usage")
      params.set("view", item.toLowerCase());

      // Always preserve all view-specific parameters EXCEPT taskId when clicking on Extracts or Flows
      // For Extracts and Flows views
      const tablePageIndex = currentParams.get("tablePageIndex");
      const tablePageSize = currentParams.get("tablePageSize");
      // Only preserve taskId if we're not clicking on Extracts or Flows nav items
      const taskId = currentParams.get("taskId");
      if (taskId && item !== "Extracts" && item !== "Flows") {
        params.set("taskId", taskId);
      }

      if (tablePageIndex) params.set("tablePageIndex", tablePageIndex);
      if (tablePageSize) params.set("tablePageSize", tablePageSize);

      // For Usage view
      const timeRange = currentParams.get("timeRange");
      if (timeRange) params.set("timeRange", timeRange);
      else if (item === "Usage" && !timeRange) {
        params.set("timeRange", "week"); // Set default only if switching to Usage and no timeRange exists
      }

      navigate({
        pathname: "/dashboard",
        search: params.toString(),
      });
      setSelectedNav(item);
    },
    [searchParams, navigate]
  );

  // Update initial selected nav based on URL params
  useEffect(() => {
    const view = searchParams.get("view");
    if (view === "usage") {
      setSelectedNav("Usage");
    } else if (view === "extracts") {
      setSelectedNav("Extracts");
    } else if (view === "flows") {
      setSelectedNav("Flows");
    }
  }, [searchParams]);

  const handleHeaderNavigation = useCallback(() => {
    const params = new URLSearchParams();
    const currentParams = new URLSearchParams(searchParams);

    // Set view first
    params.set("view", "extracts");

    // Preserve all view-specific parameters
    for (const [key, value] of currentParams.entries()) {
      if (key !== "view" && key !== "taskId") {
        // Don't preserve taskId when clicking header
        params.set(key, value);
      }
    }

    navigate({
      pathname: "/dashboard",
      search: params.toString(),
    });
    setSelectedNav("Extracts");
  }, [searchParams, navigate]);

  const handleGithubNav = useCallback(() => {
    window.open("https://github.com/buildorin/data-extract", "_blank");
  }, []);

  const handleDocsNav = useCallback(() => {
    window.open(DOCS_URL, "_blank");
  }, []);

  const userDisplayName =
    user?.data?.first_name && user?.data?.last_name
      ? `${user.data.first_name} ${user.data.last_name}`
      : user?.data?.email || "User";

  // Format the tier display name
  const rawTier = user?.data?.tier || "Free";
  const displayTier = rawTier === "SelfHosted" ? "Self Hosted" : rawTier;

  const showProfilePopup = user?.data && isProfileMenuOpen;

  const content = useMemo(() => {
    const view = searchParams.get("view");

    switch (view) {
      case "usage":
        return {
          title: "Usage",
          component: (
            <Usage key="usage-view" customerId={user.data?.customer_id || ""} />
          ),
        };
      case "connectors":
        return {
          title: "Application Connectors",
          component: (
            <div style={{ width: "100%", height: "100vh", background: "#111", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <img
                src="/connectors.png"
                alt="Connectors"
                style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
              />
            </div>
          ),
        };
      case "flows":
        if (taskId) {
          return {
            title: "Flows",
            component: (
              <img
                src="/flow-template.png"
                alt="Flow Template"
                style={{ width: "100%", height: "auto", padding: "24px" }}
              />
            ),
          };
        }
        return {
          title: "Data Flows",
          component: (
            <TaskTable
              key={`flows-table-${searchParams.toString()}`}
              context="flows"
            />
          ),
        };
      case "extracts":
      default:
        if (taskId) {
          return {
            title: `Extract > ${taskResponse?.output?.file_name || taskId}`,
            component: (
              <Suspense fallback={<Loader />}>
                {isLoading ? (
                  <Loader />
                ) : taskResponse?.output &&
                  taskResponse?.output?.pdf_url &&
                  taskResponse?.output ? (
                  <Viewer key={`viewer-${taskId}`} task={taskResponse} />
                ) : null}
              </Suspense>
            ),
          };
        }
        return {
          title: "Extract Documents",
          component: (
            <TaskTable key={`task-table-${searchParams.toString()}`} context="extracts" />
          ),
        };
    }
  }, [searchParams, taskId, taskResponse, isLoading, user]);

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  const handleContactClick = (type: "email" | "calendar") => {
    if (type === "email") {
      navigator.clipboard.writeText("harish@useorin.com");
      toast.success("Email copied to clipboard!");
    } else {
      window.open("https://cal.com/useorin/orin-harish-sync-up", "_blank");
    }
  };

  const handleBillingNavigation = async () => {
    if (user?.data?.tier === "Free") {
      navigate("/");
      setTimeout(() => {
        window.location.hash = "pricing";
      }, 100);
      return;
    }

    try {
      const { url } = await getBillingPortalSession(
        auth.user?.access_token || "",
        user?.data?.customer_id || ""
      );
      window.location.href = url;
    } catch (error) {
      console.error("Error redirecting to billing portal:", error);
    }
  };

  return (
    <Flex
      direction="row"
      width="100%"
      height="100%"
      minWidth="1156px"
      minHeight="700px"
    >
      <Flex
        className={`dashboard-nav-container ${isNavOpen ? "" : "closed"}`}
        align="start"
        direction="column"
      >
        <Flex className="dashboard-nav-header">
          <Flex
            gap="8px"
            align="center"
            justify="center"
            onClick={() => navigate("/")}
            style={{ cursor: "pointer" }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 22 22"
              fill="none"
            >
              <path
                d="M5.39 8.965C5.88975 9.16504 6.43722 9.21401 6.96454 9.10584C7.49186 8.99767 7.97584 8.73711 8.35648 8.35648C8.73711 7.97584 8.99767 7.49186 9.10584 6.96454C9.21401 6.43722 9.16504 5.88975 8.965 5.39C9.54645 5.23345 10.0604 4.89038 10.4281 4.41346C10.7957 3.93655 10.9966 3.35215 11 2.75C12.6317 2.75 14.2267 3.23385 15.5835 4.14038C16.9402 5.0469 17.9976 6.33537 18.622 7.84286C19.2464 9.35035 19.4098 11.0092 19.0915 12.6095C18.7732 14.2098 17.9874 15.6798 16.8336 16.8336C15.6798 17.9874 14.2098 18.7732 12.6095 19.0915C11.0092 19.4098 9.35035 19.2464 7.84286 18.622C6.33537 17.9976 5.0469 16.9402 4.14038 15.5835C3.23385 14.2267 2.75 12.6317 2.75 11C3.35215 10.9966 3.93655 10.7957 4.41346 10.4281C4.89038 10.0604 5.23345 9.54645 5.39 8.965Z"
                stroke="url(#paint0_linear_293_747)"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <defs>
                <linearGradient
                  id="paint0_linear_293_747"
                  x1="11"
                  y1="2.75"
                  x2="11"
                  y2="19.25"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="white" />
                  <stop offset="1" stopColor="#DCE4DD" />
                </linearGradient>
              </defs>
            </svg>
            <Text size="5" weight="bold" mb="2px" style={{ color: "#111" }}>
              Orin
            </Text>
          </Flex>
          <Flex className="dashboard-toggle" onClick={toggleNav}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M21.97 15V9C21.97 4 19.97 2 14.97 2H8.96997C3.96997 2 1.96997 4 1.96997 9V15C1.96997 20 3.96997 22 8.96997 22H14.97C19.97 22 21.97 20 21.97 15Z"
                stroke="#111"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M7.96997 2V22"
                stroke="#111"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M14.97 9.43994L12.41 11.9999L14.97 14.5599"
                stroke="#111"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Flex>
        </Flex>
        <Flex
          className="dashboard-nav-body"
          direction="column"
          justify="between"
        >
          <Flex direction="column">
            <Flex className="dashboard-nav-items" direction="column">
              <Flex
                className={`dashboard-nav-item ${selectedNav === "Extracts" ? "selected" : ""}`}
                onClick={() => handleNavigation("Extracts")}
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 22 22"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {navIcons.Extracts}
                </svg>
                <Text
                  size="3"
                  weight="medium"
                  style={{ color: selectedNav === "Extracts" ? "rgb(2, 5, 6)" : "#111" }}
                >
                  Extract
                </Text>
              </Flex>
              <Flex
                className={`dashboard-nav-item ${selectedNav === "Flows" ? "selected" : ""}`}
                onClick={() => handleNavigation("Flows")}
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 22 22"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {navIcons.Flows}
                </svg>
                <Text
                  size="3"
                  weight="medium"
                  style={{ color: selectedNav === "Flows" ? "rgb(2, 5, 6)" : "#111" }}
                >
                  Data Flows
                </Text>
              </Flex>
              <Flex
                className={`dashboard-nav-item ${selectedNav === "Connectors" ? "selected" : ""}`}
                onClick={() => handleNavigation("Connectors")}
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 22 22"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {navIcons.Connectors}
                </svg>
                <Text
                  size="3"
                  weight="medium"
                  style={{ color: selectedNav === "Connectors" ? "rgb(2, 5, 6)" : "#111" }}
                >
                  Connectors
                </Text>
              </Flex>
              <Flex
                className={`dashboard-nav-item ${selectedNav === "Usage" ? "selected" : ""}`}
                onClick={() => handleNavigation("Usage")}
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 22 22"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {navIcons.Usage}
                </svg>
                <Text
                  size="3"
                  weight="medium"
                  style={{ color: selectedNav === "Usage" ? "rgb(2, 5, 6)" : "#111" }}
                >
                  Usage
                </Text>
              </Flex>
            </Flex>
          </Flex>

          <Flex className="profile-section" direction="column">
            <Flex
              ref={profileRef}
              className="profile-info"
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              style={{ position: "relative" }}
            >
              <Flex gap="12px" align="center">
                <Flex direction="column" gap="4px">
                  <Text size="3" weight="bold" style={{ color: "#111" }}>
                    {userDisplayName}
                  </Text>
                  <Text size="1" style={{ color: "#111" }}>
                    {displayTier}
                  </Text>
                </Flex>
              </Flex>
              {showProfilePopup && (
                <Flex className="profile-popup">
                  <Flex className="profile-menu" direction="column">
                    <Flex
                      className="profile-menu-item"
                      onClick={handleBillingNavigation}
                      style={{ cursor: "pointer" }}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 21.25C17.1086 21.25 21.25 17.1086 21.25 12C21.25 6.89137 17.1086 2.75 12 2.75C6.89137 2.75 2.75 6.89137 2.75 12C2.75 17.1086 6.89137 21.25 12 21.25Z"
                          stroke="#FFFFFF"
                          strokeWidth="1.5"
                          strokeMiterlimit="10"
                        />
                        <path
                          d="M9.88012 14.36C9.88012 15.53 10.8301 16.25 12.0001 16.25C13.1701 16.25 14.1201 15.53 14.1201 14.36C14.1201 13.19 13.3501 12.75 11.5301 11.66C10.6701 11.15 9.87012 10.82 9.87012 9.64C9.87012 8.46 10.8201 7.75 11.9901 7.75C13.1601 7.75 14.1101 8.7 14.1101 9.87"
                          stroke="#FFFFFF"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <Text size="2" weight="medium" style={{ color: "#111" }}>
                        {user?.data?.tier === "Free"
                          ? "Upgrade Plan"
                          : "Manage Billing"}
                      </Text>
                    </Flex>
                    <Flex
                      className="profile-menu-item"
                      onClick={() => handleContactClick("email")}
                      style={{ cursor: "pointer" }}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g clipPath="url(#clip0_305_31838)">
                          <path
                            d="M20.25 4.75H3.75C3.19772 4.75 2.75 5.19771 2.75 5.75V18.25C2.75 18.8023 3.19772 19.25 3.75 19.25H20.25C20.8023 19.25 21.25 18.8023 21.25 18.25V5.75C21.25 5.19772 20.8023 4.75 20.25 4.75Z"
                            stroke="#FFF"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M21.25 7.25L13.9625 13.5527C12.8356 14.5273 11.1644 14.5273 10.0375 13.5527L2.75 7.25"
                            stroke="#FFF"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </g>
                        <defs>
                          <clipPath id="clip0_305_31838">
                            <rect width="24" height="24" fill="white" />
                          </clipPath>
                        </defs>
                      </svg>
                      <Text size="2" weight="medium" style={{ color: "#111" }}>
                        Email Us
                      </Text>
                    </Flex>

                    <Flex
                      className="profile-menu-item"
                      onClick={() => handleContactClick("calendar")}
                      style={{ cursor: "pointer" }}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g clipPath="url(#clip0_305_31814)">
                          <path
                            d="M19.2499 14.93V18.23C19.2499 19.46 18.1599 20.4 16.9399 20.23C9.59991 19.21 3.78991 13.4 2.76991 6.06C2.59991 4.84 3.53991 3.75 4.76991 3.75H8.06991C8.55991 3.75 8.97991 4.1 9.05991 4.58L9.44991 6.77C9.58991 7.54 9.26991 8.32 8.62991 8.77L7.73991 9.4C9.16991 11.81 11.1999 13.82 13.6199 15.24L14.2299 14.37C14.6799 13.73 15.4599 13.41 16.2299 13.55L18.4199 13.94C18.8999 14.03 19.2499 14.44 19.2499 14.93V14.93Z"
                            stroke="#FFF"
                            strokeWidth="1"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M15.75 3.75H20.25V8.25"
                            stroke="#FFF"
                            strokeWidth="1"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M20.22 3.77979L14.75 9.24979"
                            stroke="#FFF"
                            strokeWidth="1"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </g>
                        <defs>
                          <clipPath id="clip0_305_31814">
                            <rect width="24" height="24" fill="white" />
                          </clipPath>
                        </defs>
                      </svg>
                      <Text size="2" weight="medium" style={{ color: "#111" }}>
                        Book a Call
                      </Text>
                    </Flex>
                    <Flex
                      className="profile-menu-item"
                      onClick={() => auth.signoutRedirect()}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g clipPath="url(#clip0_305_27927)">
                          <path
                            d="M16 16.25L20.25 12L16 7.75"
                            stroke="#FFFFFF"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M20.25 12H8.75"
                            stroke="#FFFFFF"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M13.25 20.25H5.75C4.65 20.25 3.75 19.35 3.75 18.25V5.75C3.75 4.65 4.65 3.75 5.75 3.75H13.25"
                            stroke="#FFFFFF"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </g>
                        <defs>
                          <clipPath id="clip0_305_27927">
                            <rect width="24" height="24" fill="white" />
                          </clipPath>
                        </defs>
                      </svg>
                      <Text size="2" weight="medium" style={{ color: "#111" }}>
                        Logout
                      </Text>
                    </Flex>
                  </Flex>
                </Flex>
              )}
            </Flex>
          </Flex>
        </Flex>
      </Flex>
      <Flex direction="column" className="main-container">
        <Flex className="main-header">
          <Flex gap="8px" align="center">
            <div className="main-header-toggle" onClick={toggleNav}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M21.97 15V9C21.97 4 19.97 2 14.97 2H8.96997C3.96997 2 1.96997 4 1.96997 9V15C1.96997 20 3.96997 22 8.96997 22H14.97C19.97 22 21.97 20 21.97 15Z"
                  stroke="#111"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M14.97 2V22"
                  stroke="#111"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M7.96997 9.43994L10.53 11.9999L7.96997 14.5599"
                  stroke="#111"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <Flex
              onClick={handleHeaderNavigation}
              style={{ cursor: "pointer" }}
            >
              <Text size="5" weight="bold" className="main-header-text" style={{ color: "#111" }}>
                {taskId ? "Document Extract" : content.title}
              </Text>
            </Flex>
            {taskId && taskResponse?.output?.file_name && (
              <>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 6L15 12L9 18"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <Flex className="header-task-tag">
                  <Text size="2" weight="medium" style={{ color: "#FFF" }}>
                    {taskResponse?.output?.file_name || taskId}
                  </Text>
                </Flex>
              </>
            )}
          </Flex>
          <Flex gap="24px">
            <UploadDialog
              auth={auth}
              onUploadComplete={() => {
                refetchTasks();
              }}
            />
            {user.data && (
              <ApiKeyDialog
                user={user.data}
                showApiKey={showApiKey}
                setShowApiKey={setShowApiKey}
              />
            )}
            <BetterButton onClick={handleDocsNav}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 25 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clipPath="url(#clip0_113_1419)">
                  <path
                    d="M9.25 6.75H15.75"
                    stroke="#FFF"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M8 15.75H19.75V21.25H8C6.48 21.25 5.25 20.02 5.25 18.5C5.25 16.98 6.48 15.75 8 15.75Z"
                    stroke="#FFF"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M5.25 18.5V5.75C5.25 4.09315 6.59315 2.75 8.25 2.75H18.75C19.3023 2.75 19.75 3.19772 19.75 3.75V16"
                    stroke="#FFF"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_113_1419">
                    <rect
                      width="24"
                      height="24"
                      fill="white"
                      transform="translate(0.5)"
                    />
                  </clipPath>
                </defs>
              </svg>

              <Text size="2" weight="medium" style={{ color: "#FFF" }}>
                Help
              </Text>
            </BetterButton>
            <BetterButton onClick={handleGithubNav}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 192 192"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
              >
                <path
                  stroke="#FFFFFF"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="12"
                  d="M120.755 170c.03-4.669.059-20.874.059-27.29 0-9.272-3.167-15.339-6.719-18.41 22.051-2.464 45.201-10.863 45.201-49.067 0-10.855-3.824-19.735-10.175-26.683 1.017-2.516 4.413-12.63-.987-26.32 0 0-8.296-2.672-27.202 10.204-7.912-2.213-16.371-3.308-24.784-3.352-8.414.044-16.872 1.14-24.785 3.352C52.457 19.558 44.162 22.23 44.162 22.23c-5.4 13.69-2.004 23.804-.987 26.32C36.824 55.498 33 64.378 33 75.233c0 38.204 23.149 46.603 45.2 49.067-3.551 3.071-6.719 9.138-6.719 18.41 0 6.416.03 22.621.059 27.29M27 130c9.939.703 15.67 9.735 15.67 9.735 8.834 15.199 23.178 23.178 10.803 28.815 8.265"
                />
              </svg>
              <Text size="2" weight="medium" style={{ color: "#FFF" }}>
                Github
              </Text>
            </BetterButton>
          </Flex>
        </Flex>
        <Flex className="main-body">{auth && user && content.component}</Flex>
      </Flex>
    </Flex>
  );
}
