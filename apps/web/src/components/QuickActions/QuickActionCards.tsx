import { Flex, Text, Card } from "@radix-ui/themes";
import "./QuickActionCards.css";

interface QuickActionCardsProps {
  onAction: (prompt: string) => void;
}

export default function QuickActionCards({ onAction }: QuickActionCardsProps) {
  const actions = [
    {
      id: "analyze-property",
      icon: "🏠",
      title: "Analyze a Property",
      description: "Upload a rent roll or appraisal to get started",
      prompt: "I want to analyze a property. Can you help me understand what documents I need?",
    },
    {
      id: "estimate-dscr",
      icon: "📊",
      title: "Estimate DSCR & Cap Spread",
      description: "I'll calculate metrics from your property data",
      prompt: "I'd like to calculate DSCR and cap spread for my property. What information do you need?",
    },
    {
      id: "create-memo",
      icon: "📄",
      title: "Create Investor Memo",
      description: "Turn your deal into an LP-ready package",
      prompt: "I need to create an investor-ready memo. Can you guide me through the process?",
    },
    {
      id: "check-capital",
      icon: "💰",
      title: "Check Capital Room",
      description: "See how much your properties can support",
      prompt: "How much capital can I access based on my rental properties?",
    },
  ];

  return (
    <Flex
      direction="column"
      align="center"
      style={{
        padding: "40px 24px",
        width: "100%",
        backgroundColor: "#fff",
      }}
    >
      <Flex
        gap="24px"
        wrap="wrap"
        justify="center"
        style={{ maxWidth: "1200px", width: "100%" }}
      >
        {actions.map((action) => (
          <Card
            key={action.id}
            style={{
              flex: "1 1 250px",
              minWidth: "240px",
              maxWidth: "280px",
              padding: "24px",
              cursor: "pointer",
              border: "1px solid #e0e0e0",
              borderRadius: "12px",
              backgroundColor: "#fff",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            className="quick-action-card"
            onClick={() => onAction(action.prompt)}
          >
            <Text size="6" style={{ marginBottom: "12px", display: "block" }}>
              {action.icon}
            </Text>
            <Text
              size="4"
              weight="bold"
              style={{ color: "#111", marginBottom: "8px", display: "block" }}
            >
              {action.title}
            </Text>
            <Text size="2" style={{ color: "#666", lineHeight: "1.5" }}>
              {action.description}
            </Text>
          </Card>
        ))}
      </Flex>
    </Flex>
  );
}

