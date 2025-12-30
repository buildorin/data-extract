import { useState } from "react";
import { Flex, Text, Card } from "@radix-ui/themes";
import "./PlaybookCard.css";

export default function PlaybookCard() {
  const [isExpanded, setIsExpanded] = useState(false);

  const playbook = {
    id: "founder-2-rentals",
    title: "Founder with 2 Rentals → $400K Seed Capital",
    structure: "Preferred Equity (Zero Dilution)",
    timeline: "21 days",
    risk: "Capped, Non-Recourse to Startup",
    details: {
      dataUsed: [
        "Asset Performance: Real-time rent rolls & occupancy",
        "True Cash Flow: Net operating income (NOI) after expenses",
        "Operator History: Track record of managing the property",
      ],
      decisions: [
        "Safety Cap: LTV locked at 75% to prevent over-leverage",
        "Cash Flow Health: DTI kept below 36% to ensure the property pays for itself",
        "The Firewall: Non-recourse structure, means your startup assets are 100% safe",
      ],
      investorFocus: [
        "Yield: Consistent, monthly cash flow from Day 1",
        "Collateral: Startup runway extension backed by hard assets",
        "Clarity: A clear path to repayment not just a promise",
      ],
    },
  };

  return (
    <Card
      style={{
        padding: "32px",
        border: isExpanded ? "2px solid #545454" : "1px solid #e0e0e0",
        borderRadius: "12px",
        backgroundColor: "#fff",
        cursor: "pointer",
        transition: "all 0.3s ease",
      }}
      onClick={() => setIsExpanded(!isExpanded)}
      onMouseEnter={(e) => {
        if (!isExpanded) {
          e.currentTarget.style.borderColor = "#545454";
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isExpanded) {
          e.currentTarget.style.borderColor = "#e0e0e0";
          e.currentTarget.style.boxShadow = "none";
        }
      }}
    >
      <Flex align="start" justify="between" style={{ marginBottom: "16px" }}>
        <Text
          size="5"
          weight="bold"
          style={{ color: "#111", flex: 1 }}
        >
          {playbook.title}
        </Text>
        <Flex
          align="center"
          gap="8px"
          style={{
            marginLeft: "16px",
            flexShrink: 0,
          }}
        >
          <Text
            size="2"
            style={{
              color: "#666",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            {isExpanded ? "Less" : "View Details"}
          </Text>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            style={{
              transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.3s ease",
            }}
          >
            <path
              d="M6 9L12 15L18 9"
              stroke="#545454"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Flex>
      </Flex>
      <Flex gap="24px" wrap="wrap" style={{ marginBottom: "16px" }}>
        <Flex direction="column">
          <Text size="2" style={{ color: "#666", marginBottom: "4px" }}>
            Structure
          </Text>
          <Text size="3" weight="medium" style={{ color: "#111" }}>
            {playbook.structure}
          </Text>
        </Flex>
        <Flex direction="column">
          <Text size="2" style={{ color: "#666", marginBottom: "4px" }}>
            Timeline
          </Text>
          <Text size="3" weight="medium" style={{ color: "#111" }}>
            {playbook.timeline}
          </Text>
        </Flex>
        <Flex direction="column">
          <Text size="2" style={{ color: "#666", marginBottom: "4px" }}>
            Risk
          </Text>
          <Text size="3" weight="medium" style={{ color: "#111" }}>
            {playbook.risk}
          </Text>
        </Flex>
      </Flex>
      {isExpanded && (
        <Flex
          direction="column"
          gap="24px"
          style={{
            marginTop: "24px",
            paddingTop: "24px",
            borderTop: "1px solid #e0e0e0",
            animation: "fadeIn 0.3s ease-in",
          }}
        >
          <Flex direction="column" gap="12px">
            <Text size="4" weight="bold" style={{ color: "#111" }}>
              The data that counted
            </Text>
            <Flex direction="column" gap="8px">
              {playbook.details.dataUsed.map((item, idx) => (
                <Text key={idx} size="3" style={{ color: "#666", lineHeight: "1.6" }}>
                  • {item}
                </Text>
              ))}
            </Flex>
          </Flex>
          <Flex direction="column" gap="12px">
            <Text size="4" weight="bold" style={{ color: "#111" }}>
              Terms that protected founder
            </Text>
            <Flex direction="column" gap="8px">
              {playbook.details.decisions.map((item, idx) => (
                <Text key={idx} size="3" style={{ color: "#666", lineHeight: "1.6" }}>
                  • {item}
                </Text>
              ))}
            </Flex>
          </Flex>
          <Flex direction="column" gap="12px">
            <Text size="4" weight="bold" style={{ color: "#111" }}>
              Why investors funded it
            </Text>
            <Flex direction="column" gap="8px">
              {playbook.details.investorFocus.map((item, idx) => (
                <Text key={idx} size="3" style={{ color: "#666", lineHeight: "1.6" }}>
                  • {item}
                </Text>
              ))}
            </Flex>
          </Flex>
        </Flex>
      )}
    </Card>
  );
}

