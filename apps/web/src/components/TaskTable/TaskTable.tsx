import { useMemo, useState, useEffect } from "react";
import {
  MaterialReactTable,
  type MRT_ColumnDef,
  type MRT_PaginationState,
  type MRT_Row,
} from "material-react-table";
import { IconButton, Tooltip, createTheme, ThemeProvider } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import FolderIcon from "@mui/icons-material/Folder";
import DescriptionIcon from "@mui/icons-material/Description";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import { useSearchParams } from "react-router-dom";
import { TaskResponse } from "../../models/taskResponse.model";
import { useTasksQuery } from "../../hooks/useTaskQuery";
import useUser from "../../hooks/useUser";
import { useAuth } from "react-oidc-context";
import "./TaskTable.css";
import { Flex, Text } from "@radix-ui/themes";
import { deleteTasks, cancelTasks, updateTask } from "../../services/crudApi";
import toast from "react-hot-toast";
import { Box } from "@mui/material";
import { Status } from "../../models/taskResponse.model";
import BetterButton from "../BetterButton/BetterButton";
import ReactJson from "react-json-view";
import UploadDialog from "../Upload/UploadDialog";
import Loader from "../../pages/Loader/Loader";

// Extended interface for folder-like structure
interface PackageItem {
  id: string;
  type: 'package' | 'files' | 'records';
  packageName?: string;
  task?: TaskResponse;
  isExpanded?: boolean;
  parentId?: string;
}

const TaskTable = ({ context = "extracts" }: { context?: "extracts" | "flows" }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [expandedPackages, setExpandedPackages] = useState<Record<string, boolean>>({});

  // Set default values if params don't exist
  if (!searchParams.has("tablePageIndex"))
    searchParams.set("tablePageIndex", "0");
  if (!searchParams.has("tablePageSize"))
    searchParams.set("tablePageSize", "20");

  // Update URL with default params if needed
  useEffect(() => {
    let madeChange = false;
    if (!searchParams.has("tablePageIndex")) {
      searchParams.set("tablePageIndex", "0");
      madeChange = true;
    }
    if (!searchParams.has("tablePageSize")) {
      searchParams.set("tablePageSize", "20");
      madeChange = true;
    }
    if (madeChange) {
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const tablePageIndex = parseInt(searchParams.get("tablePageIndex") || "0");
  const tablePageSize = parseInt(searchParams.get("tablePageSize") || "20");

  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: tablePageIndex,
    pageSize: tablePageSize,
  });

  // Add effect to update URL when pagination changes
  useEffect(() => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("tablePageIndex", pagination.pageIndex.toString());
    newParams.set("tablePageSize", pagination.pageSize.toString());
    setSearchParams(newParams, { replace: true });
  }, [pagination, setSearchParams]);

  const { data: user } = useUser();
  const auth = useAuth();
  const totalTasks = user?.task_count || 0;

  const {
    data: tasks,
    isError,
    isRefetching,
    isLoading,
    refetch,
  } = useTasksQuery(pagination.pageIndex + 1, pagination.pageSize);

  // Transform tasks into hierarchical package structure
  const packageItems = useMemo(() => {
    if (!tasks) return [];
    
    const items: PackageItem[] = [];
    
    tasks.forEach((task) => {
      const packageName = task.output?.file_name || `Package ${task.task_id.substring(0, 8)}`;
      const packageId = `package-${task.task_id}`;
      
      // Add package row
      items.push({
        id: packageId,
        type: 'package',
        packageName,
        task,
        isExpanded: expandedPackages[packageId] || false,
      });
      
      // Add sub-items if package is expanded
      if (expandedPackages[packageId]) {
        items.push({
          id: `${packageId}-files`,
          type: 'files',
          task,
          parentId: packageId,
        });
        
        items.push({
          id: `${packageId}-records`,
          type: 'records',
          task,
          parentId: packageId,
        });
      }
    });
    
    return items;
  }, [tasks, expandedPackages]);

  const togglePackage = (packageId: string) => {
    setExpandedPackages(prev => ({
      ...prev,
      [packageId]: !prev[packageId]
    }));
  };

  const handleTaskClick = (task: TaskResponse) => {
    const newParams = new URLSearchParams(searchParams);
    if (context === "flows") {
      newParams.set("view", "flows");
    }
    newParams.set("taskId", task.task_id);

    if (context === "extracts") {
      newParams.set("pageCount", (task.output?.page_count || 10).toString());
    }
    
    setSearchParams(newParams, { replace: true });
  };

  const columns = useMemo<MRT_ColumnDef<PackageItem>[]>(
    () => [
      {
        accessorKey: "packageName",
        header: context === "flows" ? "Flow Name" : "Name",
        Cell: ({ row }) => {
          const item = row.original;
          const paddingLeft = item.type === 'package' ? 0 : 32;
          
          if (item.type === 'package') {
            return (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePackage(item.id);
                  }}
                  sx={{ p: 0.5 }}
                >
                  {item.isExpanded ? <ExpandMoreIcon /> : <ChevronRightIcon />}
                </IconButton>
                <FolderIcon sx={{ color: "#f39c12", fontSize: 20 }} />
                <Tooltip arrow title={item.packageName}>
                  <div
                    style={{
                      maxWidth: "200px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.packageName}
                  </div>
                </Tooltip>
              </Box>
            );
          } else if (item.type === 'files') {
            return (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, pl: `${paddingLeft}px` }}>
                <DescriptionIcon sx={{ color: "#3498db", fontSize: 18 }} />
                <Text size="2">Borrower Files</Text>
              </Box>
            );
          } else if (item.type === 'records') {
            return (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, pl: `${paddingLeft}px` }}>
                <AccountBalanceIcon sx={{ color: "#27ae60", fontSize: 18 }} />
                <Text size="2">Transaction Records</Text>
              </Box>
            );
          }
          return null;
        },
      },
      {
        accessorKey: "task.task_id",
        header: context === "flows" ? "Flow ID" : "Package Id",
        Cell: ({ row }) => {
          const item = row.original;
          if (item.type === 'package' && item.task) {
            const fullId = item.task.task_id;
            return (
              <Tooltip arrow title={fullId}>
                <div>{fullId.substring(0, 8)}...</div>
              </Tooltip>
            );
          }
          return item.type === 'package' ? null : '-';
        },
      },
      {
        accessorKey: "task.output.page_count",
        header: context === "flows" ? "Components" : "Pages",
        Cell: ({ row }) => {
          const item = row.original;
          if (item.type === 'package') {
            if (context === "flows") {
              return 8;
            }
            return item.task?.output?.page_count || 0;
          } else if (item.type === 'files') {
            return item.task?.output?.page_count || 0;
          } else if (item.type === 'records') {
            return 'Integration Data';
          }
          return null;
        },
      },
      {
        accessorKey: "task.status",
        header: "Status",
        Cell: ({ row }) => {
          const item = row.original;
          if (item.type === 'package' && item.task) {
            return (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    backgroundColor:
                      item.task.status === Status.Starting
                        ? "#3498db" // blue
                        : item.task.status === Status.Processing
                        ? "#f39c12" // orange
                        : item.task.status === Status.Failed
                        ? "#e74c3c" // red
                        : "transparent",
                    display:
                      item.task.status === Status.Succeeded ? "none" : "block",
                  }}
                />
                {item.task.status}
              </Box>
            );
          } else if (item.type === 'files') {
            return 'Available';
          } else if (item.type === 'records') {
            return 'Connected';
          }
          return null;
        },
      },
      {
        accessorKey: "task.created_at",
        header: "Created At",
        Cell: ({ row }) => {
          const item = row.original;
          if (item.type === 'package' && item.task) {
            return new Date(item.task.created_at).toLocaleString();
          }
          return item.type === 'package' ? null : '-';
        },
      },
      {
        accessorKey: "task.finished_at",
        header: "Finished At",
        Cell: ({ row }) => {
          const item = row.original;
          if (item.type === 'package' && item.task) {
            const dateValue = item.task.finished_at;
            return (item.task.status === Status.Succeeded ||
              item.task.status === Status.Failed) &&
              dateValue
              ? new Date(dateValue).toLocaleString()
              : "N/A";
          }
          return item.type === 'package' ? null : '-';
        },
      },
      {
        accessorKey: "task.expires_at",
        header: "Expires At",
        Cell: ({ row }) => {
          const item = row.original;
          if (item.type === 'package' && item.task) {
            const dateValue = item.task.expires_at;
            return dateValue && dateValue !== "Null"
              ? new Date(dateValue).toLocaleString()
              : "N/A";
          }
          return item.type === 'package' ? null : '-';
        },
      },
    ],
    [context, togglePackage]
  );

  const renderDetailPanel = ({ row }: { row: MRT_Row<PackageItem> }) => {
    const item = row.original;
    if (item.type === 'package' && item.task) {
      return (
        <div
          style={{
            padding: "16px",
            backgroundColor: "rgb(255, 255, 255, 0.05)",
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <ReactJson
            src={item.task.configuration}
            theme="monokai"
            displayDataTypes={false}
            enableClipboard={false}
            style={{ backgroundColor: "transparent" }}
            collapsed={1}
            name={false}
          />
        </div>
      );
    } else if (item.type === 'records') {
      return (
        <div
          style={{
            padding: "16px",
            backgroundColor: "rgb(255, 255, 255, 0.05)",
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <Text size="2" style={{ color: "#666" }}>
            Integration records pulled from finance systems would be displayed here.
            This includes data from selected providers like Plaid, Experian, Pinwheel, etc.
          </Text>
        </div>
      );
    }
    return null;
  };

  const tableTheme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: "light",
          primary: {
            main: "#545454",
          },
          info: {
            main: "#545454",
          },
          background: {
            default: "#ffffff",
            paper: "#ffffff",
          },
        },
        typography: {
          button: {
            textTransform: "none",
            fontSize: "14px",
            fontWeight: 500,
          },
        },
        components: {
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: "none",
                boxShadow: "none",
                backdropFilter: "none",
                height: "100%",
                zIndex: 1000,
                backgroundColor: "#ffffff !important",
                border: "none",
              },
            },
          },
          MuiTableHead: {
            styleOverrides: {
              root: {
                "& .MuiTableCell-head": {
                  color: "#545454",
                  backgroundColor: "#ffffff",
                  fontSize: "16px",
                  fontWeight: 600,
                  borderBottom: "1px solid rgba(84, 84, 84, 0.1)",
                  padding: "14px",
                  paddingBottom: "16px",
                  paddingTop: "18px",
                  alignContent: "center",
                },
              },
            },
          },
          MuiTableBody: {
            styleOverrides: {
              root: {
                "& .MuiTableRow-root": {
                  backgroundColor: "#ffffff !important",
                  "&:hover": {
                    backgroundColor: "#f8f8f8 !important",
                    backdropFilter: "blur(8px)",
                  },
                  transition: "all 0.2s ease",
                },
                "& .MuiTableCell-body": {
                  color: "#545454",
                  fontSize: "14px",
                  padding: "16px 14px",
                  borderBottom: "1px solid rgba(84, 84, 84, 0.1)",
                },
              },
            },
          },
          MuiIconButton: {
            styleOverrides: {
              root: {
                color: "#545454",
                padding: "8px",
                borderRadius: "6px",
                backgroundColor: "#545454",
                "&:hover": {
                  backgroundColor: "#545454",
                },
                transition: "all 0.2s ease",
              },
            },
          },
          MuiSvgIcon: {
            styleOverrides: {
              root: {
                color: "#222",
                height: "20px",
                width: "20px",
              },
            },
          },
          MuiTableContainer: {
            styleOverrides: {
              root: {
                backgroundColor: "#ffffff",
              },
            },
          },
          MuiTablePagination: {
            styleOverrides: {
              root: {
                color: "#545454",
                "& .MuiTablePagination-select": {
                  color: "#545454",
                },
                "& .MuiTablePagination-selectIcon": {
                  color: "#545454",
                },
                "& .MuiIconButton-root": {
                  backgroundColor: "#545454",
                  color: "#ffffff",
                  "&:hover": {
                    backgroundColor: "#545454",
                  },
                },
                "& .MuiIconButton-root .MuiSvgIcon-root": {
                  color: "#ffffff",
                },
              },
              select: {
                color: "#545454",
              },
              selectIcon: {
                color: "#545454",
              },
            },
          },
          MuiTooltip: {
            styleOverrides: {
              tooltip: {
                fontSize: "14px",
                background: "#545454",
                backdropFilter: "blur(8px)",
                padding: "8px 12px",
                borderRadius: "6px",
                height: "fit-content",
                color: "#ffffff",
              },
            },
          },
          MuiToolbar: {
            styleOverrides: {
              root: {
                padding: "24px",
              },
            },
          },
          MuiCheckbox: {
            styleOverrides: {
              root: {
                borderRadius: "6px",
                color: "#222",
                '&.Mui-checked': {
                  color: "#222",
                },
                '& .MuiSvgIcon-root': {
                  color: "#222",
                },
              },
            },
          },
          MuiList: {
            styleOverrides: {
              root: {
                padding: "4px 8px",
              },
            },
          },
          MuiMenuItem: {
            styleOverrides: {
              root: {
                fontSize: "14px !important",
                color: "#545454 !important",
                padding: "8px 12px !important",
                borderRadius: "6px",
                margin: "4px 0px !important",
                "&:hover": {
                  backgroundColor: "rgba(84, 84, 84, 0.05)",
                },
              },
            },
          },
          MuiStack: {
            styleOverrides: {
              root: {
                color: "#545454",
              },
            },
          },
          MuiPopover: {
            styleOverrides: {
              paper: {
                backgroundColor: "#ffffff !important",
                border: "none",
              },
            },
          },
          MuiMenu: {
            styleOverrides: {
              paper: {
                backgroundColor: "#ffffff !important",
                border: "none",
              },
            },
          },
        },
      }),
    []
  );

  const handleDeleteSelected = async () => {
    const selectedItemIds = Object.keys(rowSelection);
    if (selectedItemIds.length === 0) return;

    const deletableTaskIds = selectedItemIds
      .map((itemId) => {
        const item = packageItems.find((item) => item.id === itemId);
        return item?.type === 'package' && item.task ? item.task.task_id : null;
      })
      .filter((taskId): taskId is string => taskId !== null)
      .filter((taskId) => {
        const task = tasks?.find((t) => t.task_id === taskId);
        return (
          task?.status === Status.Succeeded ||
          task?.status === Status.Failed ||
          task?.status === Status.Cancelled
        );
      });

    if (deletableTaskIds.length === 0) {
      toast.error("Only Succeeded, Failed, or Cancelled packages can be deleted.");
      return;
    }

    const nonDeletableCount = selectedItemIds.length - deletableTaskIds.length;

    try {
      setRowSelection({});
      await deleteTasks(deletableTaskIds);

      toast.success(
        `Successfully deleted ${deletableTaskIds.length} package${
          deletableTaskIds.length === 1 ? "" : "s"
        }` +
          (nonDeletableCount > 0
            ? `. ${nonDeletableCount} item${
                nonDeletableCount === 1 ? " was" : "s were"
              } skipped as ${
                nonDeletableCount === 1 ? "it wasn't" : "they weren't"
              } a completed package.`
            : "")
      );

      refetch();
    } catch (error) {
      console.error("Error deleting packages:", error);
      toast.error("Failed to delete packages. Please try again.");
    }
  };

  const handleCancelSelected = async () => {
    const selectedItemIds = Object.keys(rowSelection);
    if (selectedItemIds.length === 0) return;

    const cancellableTaskIds = selectedItemIds
      .map((itemId) => {
        const item = packageItems.find((item) => item.id === itemId);
        return item?.type === 'package' && item.task ? item.task.task_id : null;
      })
      .filter((taskId): taskId is string => taskId !== null)
      .filter((taskId) => {
        const task = tasks?.find((t) => t.task_id === taskId);
        return task?.status === Status.Starting;
      });

    const nonCancellableTaskDetails = selectedItemIds
      .map((itemId) => {
        const item = packageItems.find((item) => item.id === itemId);
        return item?.type === 'package' && item.task ? item.task.task_id : null;
      })
      .filter((taskId): taskId is string => taskId !== null)
      .filter((taskId) => !cancellableTaskIds.includes(taskId))
      .map((taskId) => {
        const task = tasks?.find((t) => t.task_id === taskId);
        return task?.status === Status.Processing ? "processing" : "completed";
      });

    if (cancellableTaskIds.length === 0) {
      const statusMessage =
        nonCancellableTaskDetails[0] === "processing"
          ? "already processing"
          : "already completed";
      toast.error(
        `Cannot cancel ${
          selectedItemIds.length === 1 ? "this package" : "these packages"
        } as ${
          selectedItemIds.length === 1 ? "it is" : "they are"
        } ${statusMessage}.`
      );
      return;
    }

    try {
      await cancelTasks(cancellableTaskIds);
      setRowSelection({});

      toast.success(
        `Successfully cancelled ${cancellableTaskIds.length} package${
          cancellableTaskIds.length === 1 ? "" : "s"
        }` +
          (nonCancellableTaskDetails.length > 0
            ? `. ${nonCancellableTaskDetails.length} package${
                nonCancellableTaskDetails.length === 1 ? " was" : "s were"
              } skipped as ${
                nonCancellableTaskDetails.length === 1 ? "it was" : "they were"
              } already ${nonCancellableTaskDetails[0]}.`
            : "")
      );

      refetch();
    } catch (error) {
      console.error("Error cancelling packages:", error);
      toast.error("Failed to cancel packages. Please try again.");
    }
  };

  const handleRetrySelected = async () => {
    const selectedItemIds = Object.keys(rowSelection);
    if (selectedItemIds.length === 0) return;

    const retryableTaskIds = selectedItemIds
      .map((itemId) => {
        const item = packageItems.find((item) => item.id === itemId);
        return item?.type === 'package' && item.task ? item.task.task_id : null;
      })
      .filter((taskId): taskId is string => taskId !== null)
      .filter((taskId) => {
        const task = tasks?.find((t) => t.task_id === taskId);
        return task?.status === Status.Failed;
      });

    if (retryableTaskIds.length === 0) {
      toast.error("No packages can be retried. Only Failed packages can be retried.");
      return;
    }

    const nonRetryableCount = selectedItemIds.length - retryableTaskIds.length;

    try {
      setRowSelection({});
      // Call updateTask for each failed task with an empty object to trigger retry
      const retryPromises = retryableTaskIds.map((taskId) =>
        updateTask(taskId, {})
      );
      await Promise.all(retryPromises);

      toast.success(
        `Successfully initiated retry for ${retryableTaskIds.length} package${
          retryableTaskIds.length === 1 ? "" : "s"
        }` +
          (nonRetryableCount > 0
            ? `. ${nonRetryableCount} item${
                nonRetryableCount === 1 ? " was" : "s were"
              } skipped as ${
                nonRetryableCount === 1 ? "it wasn't" : "they weren't"
              } a Failed package.`
            : "")
      );

      refetch();
    } catch (error) {
      console.error("Error retrying packages:", error);
      toast.error("Failed to retry packages. Please try again.");
    }
  };

  const hasSelectedCancellableTasks = () => {
    return Object.keys(rowSelection).some((itemId) => {
      const item = packageItems.find((item) => item.id === itemId);
      if (item?.type === 'package' && item.task) {
        const task = tasks?.find((t) => t.task_id === item.task.task_id);
        return task?.status === Status.Starting;
      }
      return false;
    });
  };

  const hasSelectedFailedTasks = () => {
    return Object.keys(rowSelection).some((itemId) => {
      const item = packageItems.find((item) => item.id === itemId);
      if (item?.type === 'package' && item.task) {
        const task = tasks?.find((t) => t.task_id === item.task.task_id);
        return task?.status === Status.Failed;
      }
      return false;
    });
  };

  return (
    <Flex
      p="24px"
      direction="column"
      width="100%"
      height="100%"
      className="task-table-container"
    >
      {isLoading ? (
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
      ) : !tasks || tasks.length === 0 ? (
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
              backgroundRepeat: "no-repeat"
            }}
          />
          <UploadDialog
            auth={auth}
            onUploadComplete={() => {
              refetch();
            }}
          />
        </Flex>
      ) : (
        <ThemeProvider theme={tableTheme}>
          <MaterialReactTable
            columns={columns}
            data={packageItems}
            enableColumnPinning
            enableRowSelection
            enablePagination
            manualPagination
            enableStickyHeader
            enableStickyFooter
            rowPinningDisplayMode="select-sticky"
            getRowId={(row) => row.task_id}
            muiPaginationProps={{
              rowsPerPageOptions: [10, 20, 50, 100],
              defaultValue: 20,
            }}
            muiTableContainerProps={{
              sx: {
                height: "calc(100% - 112px)",
                width: "100%",
              },
            }}
            onPaginationChange={setPagination}
            rowCount={totalTasks}
            state={{
              isLoading,
              pagination,
              showAlertBanner: isError,
              showProgressBars: isRefetching,
              rowSelection,
            }}
            muiToolbarAlertBannerProps={
              isError
                ? {
                    color: "error",
                    children: "Error loading data",
                  }
                : undefined
            }
            renderTopToolbarCustomActions={() => (
              <Flex gap="2">
                <Tooltip arrow title="Refresh Data">
                  <IconButton onClick={() => refetch()}>
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
                {Object.keys(rowSelection).length > 0 && (
                  <>
                    {hasSelectedCancellableTasks() && (
                      <Tooltip arrow title="Cancel Selected">
                        <BetterButton onClick={handleCancelSelected}>
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 25 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <g clipPath="url(#clip0_113_1439)">
                                                          <path
                              d="M9.25 15.25L15.75 8.75"
                              stroke="#545454"
                              strokeWidth="1.5"
                              strokeMiterlimit="10"
                              strokeLinecap="round"
                            />
                            <path
                              d="M15.75 15.25L9.25 8.75"
                              stroke="#545454"
                              strokeWidth="1.5"
                              strokeMiterlimit="10"
                              strokeLinecap="round"
                            />
                            <path
                              d="M12.5 21.25C17.6086 21.25 21.75 17.1086 21.75 12C21.75 6.89137 17.6086 2.75 12.5 2.75C7.39137 2.75 3.25 6.89137 3.25 12C3.25 17.1086 7.39137 21.25 12.5 21.25Z"
                              stroke="#545454"
                              strokeWidth="1.5"
                              strokeMiterlimit="10"
                              strokeLinecap="round"
                            />
                            </g>
                            <defs>
                              <clipPath id="clip0_113_1439">
                                <rect
                                  width="24"
                                  height="24"
                                  fill="white"
                                  transform="translate(0.5)"
                                />
                              </clipPath>
                            </defs>
                          </svg>
                          <Text size="1">Cancel Packages</Text>
                        </BetterButton>
                      </Tooltip>
                    )}
                    {hasSelectedFailedTasks() && (
                      <Tooltip arrow title="Retry Selected Failed Packages">
                        <BetterButton onClick={handleRetrySelected}>
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 25 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <g clipPath="url(#clip0_113_1417)">
                              <path
                                d="M16.25 15.25H20.75V19.75"
                                stroke="#545454"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M8.75 8.25H4.25V3.75"
                                stroke="#545454"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M4.31523 8.25135C5.73695 5.15233 8.86701 3 12.4998 3C17.2006 3 21.0597 6.65439 21.4647 11.25M20.7508 15.6003C19.3619 18.7788 16.1902 21 12.4998 21C7.78048 21 3.90956 17.3676 3.53027 12.7462"
                                stroke="#545454"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                              />
                            </g>
                            <defs>
                              <clipPath id="clip0_113_1417">
                                <rect
                                  width="24"
                                  height="24"
                                  fill="white"
                                  transform="translate(0.5)"
                                />
                              </clipPath>
                            </defs>
                          </svg>

                          <Text size="1">Retry Package Creation</Text>
                        </BetterButton>
                      </Tooltip>
                    )}
                    <Tooltip arrow title="Delete Selected">
                      <BetterButton onClick={handleDeleteSelected}>
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 25 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M4.25 4.75H20.75"
                            stroke="#545454"
                            strokeWidth="1.5"
                            strokeMiterlimit="10"
                            strokeLinecap="round"
                          />
                          <path
                            d="M12.5 2.75V4.75"
                            stroke="#545454"
                            strokeWidth="1.5"
                            strokeMiterlimit="10"
                            strokeLinecap="round"
                          />
                          <path
                            d="M14.2402 17.27V12.77"
                            stroke="#545454"
                            strokeWidth="1.5"
                            strokeMiterlimit="10"
                            strokeLinecap="round"
                          />
                          <path
                            d="M10.75 17.25V12.75"
                            stroke="#545454"
                            strokeWidth="1.5"
                            strokeMiterlimit="10"
                            strokeLinecap="round"
                          />
                          <path
                            d="M5.87012 8.75H19.1701"
                            stroke="#545454"
                            strokeWidth="1.5"
                            strokeMiterlimit="10"
                          />
                          <path
                            d="M15.91 21.25H9.09C8.07 21.25 7.21 20.48 7.1 19.47L5.5 4.75H19.5L17.9 19.47C17.79 20.48 16.93 21.25 15.91 21.25V21.25Z"
                            stroke="#545454"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>{" "}
                        <Text size="1">Delete Package</Text>
                      </BetterButton>
                    </Tooltip>
                  </>
                )}
              </Flex>
            )}
            enableExpanding
            renderDetailPanel={renderDetailPanel}
            muiTableBodyRowProps={({ row }) => {
              const item = row.original;
              const isClickable = 
                item.type === 'package' ||
                (item.type === 'files' && item.task?.message === "Task succeeded") ||
                item.type === 'records';

              return {
                onClick: (event) => {
                  if (
                    !(event.target as HTMLElement)
                      .closest(".MuiTableCell-root")
                      ?.classList.contains("MuiTableCell-paddingNone")
                  ) {
                    if (item.type === 'package') {
                      // Toggle expansion for package rows
                      togglePackage(item.id);
                    } else if (item.type === 'files' && item.task) {
                      // Navigate to Document Extract for Files
                      if (context === "flows" || item.task.message === "Task succeeded") {
                        handleTaskClick(item.task);
                      } else if (
                        item.task.status !== Status.Failed &&
                        item.task.status !== Status.Succeeded
                      ) {
                        refetch();
                      }
                    } else if (item.type === 'records') {
                      // Show records detail panel
                      console.log('Show integration records from finance systems');
                    }
                  }
                },
                sx: {
                  cursor: isClickable ? "pointer" : "default",
                  backgroundColor: item.type !== 'package' ? 'rgba(0,0,0,0.02)' : 'inherit',
                  "&:hover": {
                    backgroundColor: isClickable
                      ? "#f8f8f8 !important"
                      : "#ffffff !important",
                  },
                  "&.Mui-TableBodyCell-DetailPanel": {
                    height: 0,
                    "& > td": {
                      padding: 0,
                    },
                  },
                },
              };
            }}
            onRowSelectionChange={setRowSelection}
          />
        </ThemeProvider>
      )}
    </Flex>
  );
};

export default TaskTable;
