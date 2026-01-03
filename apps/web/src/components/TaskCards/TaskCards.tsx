import { Flex, Text, Card } from "@radix-ui/themes";
import { useSearchParams } from "react-router-dom";
import { TaskResponse, Status } from "../../models/taskResponse.model";
import { useTasksQuery } from "../../hooks/useTaskQuery";
import { useAuth } from "react-oidc-context";
import Loader from "../../pages/Loader/Loader";
import UploadDialog from "../Upload/UploadDialog";
import "./TaskCards.css";

interface TaskCardsProps {
  context?: "extracts" | "flows";
}

export default function TaskCards({ context = "extracts" }: TaskCardsProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const auth = useAuth();

  const pageIndex = parseInt(searchParams.get("tablePageIndex") || "0");
  const pageSize = parseInt(searchParams.get("tablePageSize") || "20");

  const {
    data: tasks,
    isLoading,
    refetch,
  } = useTasksQuery(pageIndex + 1, pageSize);

  const handleCardClick = (task: TaskResponse) => {
    const newParams = new URLSearchParams(searchParams);
    if (context === "flows") {
      newParams.set("view", "flows");
    }
    newParams.set("taskId", task.task_id);
    
    // If task is completed, go to fact review step
    if (context === "extracts" && task.status === "Succeeded") {
      newParams.set("step", "review");
    } else if (context === "extracts") {
      newParams.set("pageCount", (task.output?.page_count || 10).toString());
    }
    setSearchParams(newParams, { replace: true });
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case Status.Succeeded:
        return "#4CAF50";
      case Status.Processing:
        return "#ffc107";
      case Status.Starting:
        return "#2196F3";
      case Status.Failed:
        return "#f44336";
      default:
        return "#666";
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case Status.Succeeded:
        return "Succeeded";
      case Status.Processing:
        return "Processing";
      case Status.Starting:
        return "Starting";
      case Status.Failed:
        return "Failed";
      default:
        return status;
    }
  };

  const getDocumentType = (task: TaskResponse): string => {
    // Return document name for REIT-specific naming
    const fileName = task.output?.file_name || "";
    if (!fileName) return "Document";
    
    // Remove file extension and return as document type
    const lastDotIndex = fileName.lastIndexOf(".");
    if (lastDotIndex > 0) {
      return fileName.substring(0, lastDotIndex);
    }
    return fileName;
  };

  if (isLoading) {
    return (
      <Flex
        width="100%"
        height="100%"
        align="center"
        justify="center"
        direction="column"
        gap="4"
      >
        <Loader />
      </Flex>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <Flex
        width="90%"
        height="100%"
        align="center"
        justify="center"
        direction="column"
        gap="4"
      >
        <Flex
          width="85%"
          height="85%"
          style={{
            backgroundImage: "url('/pipeline-background.png')",
            backgroundSize: "cover",
            backgroundPosition: "left",
            backgroundRepeat: "no-repeat",
          }}
        />
        <UploadDialog
          auth={auth}
          onUploadComplete={() => {
            refetch();
          }}
        />
      </Flex>
    );
  }

  return (
    <Flex
      direction="column"
      width="100%"
      height="100%"
      style={{ padding: "24px", overflowY: "auto" }}
    >
      <Flex
        gap="20px"
        wrap="wrap"
        style={{ width: "100%" }}
      >
        {tasks.map((task) => {
          const documentType = getDocumentType(task);
          const statusColor = getStatusColor(task.status);
          const statusText = getStatusText(task.status);
          const pageCount = task.output?.page_count || 0;

          return (
            <Card
              key={task.task_id}
              style={{
                flex: "0 1 calc(33.333% - 14px)",
                minWidth: "280px",
                maxWidth: "350px",
                padding: "24px",
                cursor: "pointer",
                border: "1px solid #e0e0e0",
                borderRadius: "12px",
                backgroundColor: "#fff",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)";
                e.currentTarget.style.borderColor = "#545454";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.borderColor = "#e0e0e0";
              }}
              onClick={() => handleCardClick(task)}
            >
              <Flex direction="column" gap="8px">
                <Text
                  size="4"
                  weight="bold"
                  style={{
                    color: "#111",
                    lineHeight: "1.3",
                  }}
                >
                  {documentType}
                </Text>
                <Flex direction="column" gap="8px" style={{ marginTop: "8px" }}>
                  <Text
                    size="2"
                    style={{
                      color: "#999",
                    }}
                  >
                    Status: <span style={{ color: statusColor, fontWeight: 500 }}>{statusText}</span>
                  </Text>
                  {pageCount > 0 && (
                    <Text
                      size="2"
                      style={{
                        color: "#999",
                      }}
                    >
                      Pages: {pageCount}
                    </Text>
                  )}
                </Flex>
              </Flex>
            </Card>
          );
        })}
      </Flex>
    </Flex>
  );
}

