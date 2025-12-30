import { Flex, Text, Card } from "@radix-ui/themes";
import "./CapitalPreview.css";

export default function CapitalPreview() {
  return (
    <Flex
      direction="column"
      align="center"
      style={{
        padding: "80px 24px",
        width: "100%",
        backgroundColor: "#f8f9fa",
      }}
    >
      <Flex
        direction="column"
        align="center"
        gap="16px"
        style={{ marginBottom: "48px", textAlign: "center", maxWidth: "900px" }}
      >
        <Text
          size="8"
          weight="medium"
          style={{ color: "#111" }}
        >
          Here's how your capital options could look
        </Text>
        <Text
          size="5"
          style={{ color: "#666", lineHeight: "1.6" }}
        >
          A live snapshot of what your real estate can support.
        </Text>
      </Flex>

      <Card
        style={{
          padding: "48px",
          border: "1px solid #e0e0e0",
          borderRadius: "12px",
          backgroundColor: "#fff",
          maxWidth: "900px",
          width: "100%",
        }}
      >
        <Flex direction="column" gap="40px">
          {/* PROJECTED FUNDING CAPACITY */}
          <Flex direction="column" gap="16px">
            <Text size="5" weight="bold" style={{ color: "#111" }}>
              PROJECTED FUNDING CAPACITY
            </Text>
            <Text size="4" style={{ color: "#666", lineHeight: "1.6" }}>
              Based on what you've shared, you may be able to access:
            </Text>
            <Text
              size="8"
              weight="bold"
              style={{ color: "#4CAF50", marginTop: "8px" }}
            >
              $250k – $420k
            </Text>
            <Text size="3" style={{ color: "#666", marginTop: "8px" }}>
              Available immediately. No refinancing. No loss of control.
            </Text>
          </Flex>

          {/* DEAL READINESS */}
          <Flex direction="column" gap="16px">
            <Text size="5" weight="bold" style={{ color: "#111" }}>
              DEAL READINESS: 66%
            </Text>
            {/* Progress Bar */}
            <Flex style={{ marginBottom: "8px" }}>
              <div
                style={{
                  width: "100%",
                  height: "10px",
                  backgroundColor: "#e0e0e0",
                  borderRadius: "5px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: "66%",
                    height: "100%",
                    backgroundColor: "#4CAF50",
                    borderRadius: "5px",
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
            </Flex>
            <Flex direction="column" gap="12px">
              <Flex align="center" gap="12px">
                <Text size="4">✅</Text>
                <Flex direction="column" gap="2px" style={{ flex: 1 }}>
                  <Text size="3" weight="medium" style={{ color: "#111" }}>
                    Property Docs:
                  </Text>
                  <Text size="3" style={{ color: "#666" }}>
                    Validated (Mortgage, Tax, & Insurance data verified)
                  </Text>
                </Flex>
              </Flex>
              <Flex align="center" gap="12px">
                <Text size="4">📄</Text>
                <Flex direction="column" gap="2px" style={{ flex: 1 }}>
                  <Text size="3" weight="medium" style={{ color: "#111" }}>
                    Cashflow:
                  </Text>
                  <Text size="3" style={{ color: "#666" }}>
                    Pending Upload (Add T-12 rent roll to unlock final offer)
                  </Text>
                </Flex>
              </Flex>
              <Flex align="center" gap="12px">
                <Text size="4">⚙️</Text>
                <Flex direction="column" gap="2px" style={{ flex: 1 }}>
                  <Text size="3" weight="medium" style={{ color: "#111" }}>
                    Credit model:
                  </Text>
                  <Text size="3" style={{ color: "#666" }}>
                    → Queued (Will run automatically upon upload)
                  </Text>
                </Flex>
              </Flex>
            </Flex>
          </Flex>

          {/* YOUR NEXT STEPS */}
          <Flex direction="column" gap="16px">
            <Text size="5" weight="bold" style={{ color: "#111" }}>
              YOUR NEXT STEPS
            </Text>
            <Flex gap="16px" wrap="wrap">
              <Card
                style={{
                  flex: "1 1 250px",
                  padding: "20px",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  backgroundColor: "#f8f9fa",
                }}
              >
                <Text size="4" weight="bold" style={{ color: "#111", marginBottom: "8px", display: "block" }}>
                  Generate Deal Room Link
                </Text>
                <Text size="2" style={{ color: "#666" }}>
                  Auto-build your investor package.
                </Text>
                <Text size="2" style={{ color: "#666", marginTop: "4px" }}>
                  Time: Instant | Cost: Included
                </Text>
              </Card>
              <Card
                style={{
                  flex: "1 1 250px",
                  padding: "20px",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  backgroundColor: "#f8f9fa",
                }}
              >
                <Text size="4" weight="bold" style={{ color: "#111", marginBottom: "8px", display: "block" }}>
                  Structure the Deal
                </Text>
                <Text size="2" style={{ color: "#666" }}>
                  Compare Preferred Equity vs. Revenue Share.
                </Text>
                <Text size="2" style={{ color: "#666", marginTop: "4px" }}>
                  Status: 2 Options Available
                </Text>
              </Card>
              <Card
                style={{
                  flex: "1 1 250px",
                  padding: "20px",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  backgroundColor: "#f8f9fa",
                }}
              >
                <Text size="4" weight="bold" style={{ color: "#111", marginBottom: "8px", display: "block" }}>
                  Match with Capital Partners
                </Text>
                <Text size="2" style={{ color: "#666" }}>
                  Push your deal to vetted partners.
                </Text>
                <Text size="2" style={{ color: "#666", marginTop: "4px" }}>
                  Network: 50+ Active Investors
                </Text>
              </Card>
            </Flex>
          </Flex>
        </Flex>
      </Card>
    </Flex>
  );
}

