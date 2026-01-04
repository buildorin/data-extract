import { Flex, Button, Text } from "@radix-ui/themes";
import "./QuickActionButtons.css";

interface QuickActionButtonsProps {
  onAction: (prompt: string) => void;
}

export default function QuickActionButtons({ onAction }: QuickActionButtonsProps) {
  const actions = [
    {
      id: "analyze",
      icon: "📊",
      label: "Analyze Property",
      prompt: "I want to analyze a property. What documents do I need?",
    },
    {
      id: "calculate",
      icon: "📈",
      label: "Calculate DSCR",
      prompt: "I need to calculate DSCR and cap spread for my property.",
    },
    {
      id: "generate",
      icon: "📄",
      label: "Generate Memo",
      prompt: "I need to create an investor-ready memo.",
    },
    {
      id: "estimate",
      icon: "💰",
      label: "Estimate Capital",
      prompt: "How much capital can I access based on my properties?",
    },
  ];

  return (
    <Flex
      gap="12px"
      wrap="wrap"
      justify="center"
      style={{
        marginTop: "16px",
        padding: "0 24px",
      }}
    >
      {actions.map((action) => (
        <Button
          key={action.id}
          variant="outline"
          size="2"
          onClick={() => onAction(action.prompt)}
          style={{
            cursor: "pointer",
            backgroundColor: "transparent",
            color: "#111",
            border: "1px solid #111",
            borderRadius: "8px",
            padding: "8px 16px",
            fontSize: "14px",
            fontWeight: 400,
            transition: "all 0.2s",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
          className="quick-action-button"
        >
          <Text size="3" style={{ color: "#111", filter: "grayscale(100%)" }}>
            {action.icon}
          </Text>
          <Text size="2" style={{ color: "#111" }}>
            {action.label}
          </Text>
        </Button>
      ))}
    </Flex>
  );
}
