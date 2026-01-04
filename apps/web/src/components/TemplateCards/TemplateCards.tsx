import { Flex, Text, Card } from "@radix-ui/themes";
import "./TemplateCards.css";

interface TemplateCard {
  id: string;
  title: string;
  description: string;
  prompt: string;
}

interface TemplateCardsProps {
  onSelect: (prompt: string) => void;
}

export default function TemplateCards({ onSelect }: TemplateCardsProps) {
  const templates: TemplateCard[] = [
    {
      id: "analyze-property",
      title: "Analyze Property",
      description: "Upload rent rolls, P&Ls, and mortgage statements to extract key facts and calculate underwriting metrics.",
      prompt: "I want to analyze a property. What documents do I need to upload?",
    },
    {
      id: "calculate-dscr",
      title: "Calculate DSCR & Cap Spread",
      description: "Get accurate debt service coverage ratios and capitalization rates from your property financials.",
      prompt: "I need to calculate DSCR and cap spread for my property. What information do you need?",
    },
    {
      id: "generate-memo",
      title: "Generate Investor Memo",
      description: "Create LP-ready deal packages with executive summaries, financial analysis, and risk assessments.",
      prompt: "I need to create an investor-ready memo. Can you guide me through the process?",
    },
    {
      id: "estimate-capital",
      title: "Estimate Capital Access",
      description: "Determine how much capital your rental properties can support based on equity and cash flow.",
      prompt: "How much capital can I access based on my rental properties?",
    },
  ];

  return (
    <Flex
      direction="column"
      style={{
        padding: "80px 24px",
        width: "100%",
        backgroundColor: "#fff",
      }}
    >
      <Text
        size="5"
        weight="medium"
        style={{
          marginBottom: "32px",
          color: "#111",
          textAlign: "center",
        }}
      >
        What are you building?
      </Text>

      <Flex
        gap="24px"
        wrap="wrap"
        justify="center"
        style={{ maxWidth: "1000px", margin: "0 auto", width: "100%" }}
      >
        {templates.map((template) => (
          <Card
            key={template.id}
            style={{
              flex: "1 1 calc(50% - 12px)",
              minWidth: "400px",
              maxWidth: "480px",
              padding: "32px",
              cursor: "pointer",
              border: "1px solid #e0e0e0",
              borderRadius: "12px",
              backgroundColor: "#fff",
              transition: "all 0.2s",
            }}
            className="template-card"
            onClick={() => onSelect(template.prompt)}
          >
            <Flex direction="column" gap="12px">
              <Text
                size="5"
                weight="bold"
                style={{ color: "#111", marginBottom: "4px" }}
              >
                {template.title}
              </Text>
              <Text size="3" style={{ color: "#666", lineHeight: "1.6" }}>
                {template.description}
              </Text>
            </Flex>
          </Card>
        ))}
      </Flex>
    </Flex>
  );
}

