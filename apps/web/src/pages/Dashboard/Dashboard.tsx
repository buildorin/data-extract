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
import { useLocation, useNavigate } from "react-router-dom";
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
  const [selectedNav, setSelectedNav] = useState("Tasks");
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const [isNavOpen, setIsNavOpen] = useState(true);
  const [showApiKey, setShowApiKey] = useState(false);

  const location = useLocation();
  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );
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
      params.set("view", "tasks");
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
      setSelectedNav("Tasks");
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
    Tasks: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5C15 6.10457 14.1046 7 13 7H11C9.89543 7 9 6.10457 9 5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 12H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 16H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    Usage: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 20V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 20V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6 20V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  };

  const handleNavigation = useCallback(
    (item: string) => {
      const params = new URLSearchParams();
      const currentParams = new URLSearchParams(searchParams);

      // Set view first (either "tasks" or "usage")
      params.set("view", item.toLowerCase());

      // Always preserve all view-specific parameters EXCEPT taskId when clicking on Tasks
      // For Tasks view
      const tablePageIndex = currentParams.get("tablePageIndex");
      const tablePageSize = currentParams.get("tablePageSize");
      // Only preserve taskId if we're not clicking on Tasks nav item
      const taskId = currentParams.get("taskId");
      if (taskId && item !== "Tasks") {
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
    } else if (view === "tasks") {
      setSelectedNav("Tasks");
    }
  }, [searchParams]);

  const handleHeaderNavigation = useCallback(() => {
    const params = new URLSearchParams();
    const currentParams = new URLSearchParams(searchParams);

    // Set view first
    params.set("view", "tasks");

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
    setSelectedNav("Tasks");
  }, [searchParams, navigate]);

  const handleGithubNav = useCallback(() => {
    window.open("https://github.com/lumina-ai-inc/chunkr", "_blank");
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
      case "tasks":
      default:
        if (taskId) {
          return {
            title: `Tasks > ${taskResponse?.output?.file_name || taskId}`,
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
          title: "Tasks",
          component: (
            <TaskTable key={`task-table-${searchParams.toString()}`} />
          ),
        };
    }
  }, [searchParams, taskId, taskResponse, isLoading, user]);

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  const handleContactClick = (type: "email" | "calendar") => {
    if (type === "email") {
      navigator.clipboard.writeText("mehul@chunkr.ai");
      toast.success("Email copied to clipboard!");
    } else {
      window.open("https://cal.com/mehulc/30min", "_blank");
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
    <div className="main-container">
      <div className={`dashboard-nav-container ${isNavOpen ? "" : "closed"}`}>
        <div className="dashboard-nav-header">
          <div className="logo-container">
            <img src="/logo.svg" alt="Logo" width="32" height="32" />
            <Text size="5" weight="bold">Chunkr</Text>
          </div>
          <div className="dashboard-toggle" onClick={toggleNav}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        <div className="dashboard-nav-body">
          <div className="dashboard-nav-items">
            {Object.entries(navIcons).map(([key, icon]) => (
              <div
                key={key}
                className={`dashboard-nav-item ${selectedNav === key ? "selected" : ""}`}
                onClick={() => handleNavigation(key)}
              >
                {icon}
                <Text size="2">{key}</Text>
              </div>
            ))}
          </div>
        </div>

        <div className="profile-info" ref={profileRef} onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}>
          <div className="profile-avatar">
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div>
            <Text size="2" weight="medium">{user?.name || "User"}</Text>
            <Text size="1" color="gray">{user?.email || ""}</Text>
          </div>
        </div>

        {isProfileMenuOpen && (
          <div className="profile-menu">
            <div className="profile-menu-item" onClick={() => handleBillingNavigation()}>
              <Text size="2">Billing</Text>
            </div>
            <div className="profile-menu-item" onClick={() => setShowApiKey(true)}>
              <Text size="2">API Key</Text>
            </div>
            <div className="profile-menu-item" onClick={() => handleContactClick("email")}>
              <Text size="2">Contact Support</Text>
            </div>
            <div className="profile-menu-item" onClick={() => auth.signoutRedirect()}>
              <Text size="2">Sign Out</Text>
            </div>
          </div>
        )}
      </div>

      <div className="main-container">
        <div className="main-header">
          <div className="main-header-left">
            <Text className="main-header-text">
              {selectedNav}
              {taskResponse?.data?.name && (
                <span className="header-task-tag">{taskResponse.data.name}</span>
              )}
            </Text>
          </div>
          <div className="main-header-right">
            <BetterButton onClick={() => setShowUpload(true)}>
              Upload Document
            </BetterButton>
          </div>
        </div>

        <div className="main-body">
          <Suspense fallback={<Loader />}>
            {searchParams.get("view") === "tasks" ? (
              <TaskTable />
            ) : (
              <Usage />
            )}
          </Suspense>
        </div>
      </div>

      {showUpload && (
        <UploadDialog
          onClose={() => setShowUpload(false)}
          onSuccess={() => {
            setShowUpload(false);
            refetchTasks();
          }}
        />
      )}

      {showApiKey && (
        <ApiKeyDialog
          onClose={() => setShowApiKey(false)}
        />
      )}
    </div>
  );
}
