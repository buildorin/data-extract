import { useState } from "react";
import { Flex, Text, Button, TextField, Badge, ScrollArea } from "@radix-ui/themes";
import { useQuery } from "react-query";
import { getDeals, DealResponse } from "../../services/dealApi";
import "./LeftNavPane.css";

interface LeftNavPaneProps {
  selectedDealId: string | null;
  onSelectDeal: (dealId: string) => void;
  onNewDeal: () => void;
}

export default function LeftNavPane({
  selectedDealId,
  onSelectDeal,
  onNewDeal,
}: LeftNavPaneProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    active: true,
    in_review: false,
    completed: false,
    shared: false,
  });

  const { data: deals = [] } = useQuery<DealResponse[]>("deals", getDeals);

  const toggleGroup = (group: string) => {
    setExpandedGroups((prev) => ({ ...prev, [group]: !prev[group] }));
  };

  const groupDeals = () => {
    const filtered = deals.filter((deal) =>
      deal.deal_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return {
      active: filtered.filter(
        (d) =>
          d.status === "processing_documents" ||
          d.status === "extracting_facts" ||
          d.status === "pending_review"
      ),
      in_review: filtered.filter((d) => d.status === "ready_for_underwriting"),
      completed: filtered.filter((d) => d.status === "completed"),
      shared: filtered.filter((d) => d.status === "shared"),
    };
  };

  const groupedDeals = groupDeals();

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: any; label: string }> = {
      processing_documents: { color: "blue", label: "Processing" },
      extracting_facts: { color: "orange", label: "Extracting" },
      pending_review: { color: "yellow", label: "Review" },
      ready_for_underwriting: { color: "yellow", label: "Ready" },
      completed: { color: "green", label: "Complete" },
      shared: { color: "purple", label: "Shared" },
    };
    return badges[status] || { color: "gray", label: status };
  };

  const renderDealItem = (deal: DealResponse) => {
    const badge = getStatusBadge(deal.status);
    const isSelected = deal.deal_id === selectedDealId;

    return (
      <Flex
        key={deal.deal_id}
        direction="column"
        p="12px"
        style={{
          cursor: "pointer",
          borderBottom: "1px solid #e0e0e0",
          background: isSelected ? "#f0f0f0" : "transparent",
          transition: "background 0.2s",
        }}
        className="deal-item"
        onClick={() => onSelectDeal(deal.deal_id)}
      >
        <Text size="2" weight="medium" style={{ marginBottom: "6px" }}>
          {deal.deal_name}
        </Text>
        <Flex gap="8px" align="center">
          <Badge color={badge.color} size="1">
            {badge.label}
          </Badge>
          <Text size="1" style={{ color: "#666" }}>
            {deal.document_count || 0} docs
          </Text>
        </Flex>
      </Flex>
    );
  };

  const renderGroup = (
    title: string,
    icon: string,
    groupKey: string,
    deals: DealResponse[]
  ) => {
    const isExpanded = expandedGroups[groupKey];

    return (
      <Flex direction="column" style={{ marginBottom: "8px" }}>
        <Flex
          align="center"
          justify="between"
          p="8px 12px"
          style={{
            cursor: "pointer",
            backgroundColor: "#f8f9fa",
          }}
          onClick={() => toggleGroup(groupKey)}
        >
          <Flex align="center" gap="8px">
            <Text size="2">{isExpanded ? "▼" : "▶"}</Text>
            <Text size="2" weight="medium">
              {icon} {title}
            </Text>
            <Badge size="1" variant="soft">
              {deals.length}
            </Badge>
          </Flex>
        </Flex>
        {isExpanded && deals.map((deal) => renderDealItem(deal))}
      </Flex>
    );
  };

  return (
    <Flex
      direction="column"
      style={{
        width: "260px",
        height: "100vh",
        borderRight: "1px solid #e0e0e0",
        backgroundColor: "#fff",
        flexShrink: 0,
      }}
    >
      {/* Header */}
      <Flex
        direction="column"
        p="16px"
        style={{
          borderBottom: "1px solid #e0e0e0",
        }}
      >
        <Flex align="center" gap="12px" style={{ marginBottom: "16px" }}>
          <img
            src="/logo-orin.png"
            alt="Orin Logo"
            width={32}
            height={32}
          />
          <Text size="5" weight="bold" style={{ color: "#111" }}>
            Orin
          </Text>
        </Flex>

        {/* Search */}
        <TextField.Root
          placeholder="Search deals..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="2"
        />
      </Flex>

      {/* Deals List */}
      <ScrollArea
        style={{ flex: 1 }}
        scrollbars="vertical"
      >
        <Flex direction="column" p="8px 0">
          <Text
            size="2"
            weight="bold"
            style={{
              color: "#666",
              textTransform: "uppercase",
              padding: "12px 16px",
              letterSpacing: "0.5px",
            }}
          >
            My Deals
          </Text>

          {renderGroup("Active", "🔵", "active", groupedDeals.active)}
          {renderGroup("In Review", "🟡", "in_review", groupedDeals.in_review)}
          {renderGroup("Completed", "🟢", "completed", groupedDeals.completed)}
          {renderGroup("Shared", "🟣", "shared", groupedDeals.shared)}

          <Text
            size="2"
            weight="bold"
            style={{
              color: "#666",
              textTransform: "uppercase",
              padding: "16px 12px 8px",
              letterSpacing: "0.5px",
            }}
          >
            Shared Packages
          </Text>
          <Text
            size="2"
            style={{
              color: "#999",
              padding: "8px 12px",
              fontStyle: "italic",
            }}
          >
            No shared packages yet
          </Text>
        </Flex>
      </ScrollArea>

      {/* New Deal Button */}
      <Flex
        p="16px"
        style={{
          borderTop: "1px solid #e0e0e0",
        }}
      >
        <Button
          size="3"
          onClick={onNewDeal}
          style={{
            width: "100%",
            backgroundColor: "#1976D2",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          + New Deal
        </Button>
      </Flex>
    </Flex>
  );
}

