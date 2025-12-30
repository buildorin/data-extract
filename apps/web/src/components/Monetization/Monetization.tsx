import { Flex, Text, Card, Button } from "@radix-ui/themes";
import { useNavigate } from "react-router-dom";
import { useAuth } from "react-oidc-context";
import "./Monetization.css";

export default function Monetization() {
  const navigate = useNavigate();
  const auth = useAuth();

  const handleGetStarted = () => {
    if (auth.isAuthenticated) {
      navigate("/dashboard");
    } else {
      // Redirect to login, then to dashboard
      auth.signinRedirect({
        state: { returnTo: "/dashboard" },
      });
    }
  };

  return (
    <Flex
      direction="column"
      align="center"
      style={{
        padding: "80px 24px",
        width: "100%",
        backgroundColor: "#fff",
      }}
    >
      <Flex
        gap="32px"
        wrap="wrap"
        justify="center"
        style={{ maxWidth: "1200px", width: "100%", marginBottom: "48px" }}
      >
        {/* Left Panel: Plan Your Strategy */}
        <Card
          style={{
            flex: "1 1 400px",
            minWidth: "300px",
            maxWidth: "500px",
            padding: "40px",
            border: "1px solid #e0e0e0",
            borderRadius: "12px",
            backgroundColor: "#fff",
          }}
        >
          <Flex direction="column" gap="16px">
            <Text size="7" weight="bold" style={{ color: "#111" }}>
              Plan Your Strategy
            </Text>
            <Text size="3" style={{ color: "#666" }}>
              Always free to explore. No credit card required.
            </Text>
            <Flex direction="column" gap="16px" style={{ marginTop: "24px" }}>
              <Flex align="start" gap="12px">
                <Text size="4" style={{ color: "#4CAF50", flexShrink: 0 }}>
                  ✅
                </Text>
                <Text size="3" style={{ color: "#111", lineHeight: "1.6" }}>
                  <Text weight="bold">Unlimited AI Chat:</Text> Ask Orin anything about your capital stack.
                </Text>
              </Flex>
              <Flex align="start" gap="12px">
                <Text size="4" style={{ color: "#4CAF50", flexShrink: 0 }}>
                  ✅
                </Text>
                <Text size="3" style={{ color: "#111", lineHeight: "1.6" }}>
                  <Text weight="bold">Capacity Check:</Text> See exactly how much equity you can unlock.
                </Text>
              </Flex>
              <Flex align="start" gap="12px">
                <Text size="4" style={{ color: "#4CAF50", flexShrink: 0 }}>
                  ✅
                </Text>
                <Text size="3" style={{ color: "#111", lineHeight: "1.6" }}>
                  <Text weight="bold">Deal Modeling:</Text> Create and stress-test multiple funding scenarios.
                </Text>
              </Flex>
              <Flex align="start" gap="12px">
                <Text size="4" style={{ color: "#4CAF50", flexShrink: 0 }}>
                  ✅
                </Text>
                <Text size="3" style={{ color: "#111", lineHeight: "1.6" }}>
                  <Text weight="bold">Founder Playbooks:</Text> See how others structured their rounds.
                </Text>
              </Flex>
            </Flex>
          </Flex>
        </Card>

        {/* Right Panel: Unlock the Deal Room */}
        <Card
          style={{
            flex: "1 1 400px",
            minWidth: "300px",
            maxWidth: "500px",
            padding: "40px",
            border: "3px solid #FFC107",
            borderRadius: "12px",
            backgroundColor: "#fff",
            boxShadow: "0 4px 12px rgba(255, 193, 7, 0.2)",
          }}
        >
          <Flex direction="column" gap="16px">
            <Text size="7" weight="bold" style={{ color: "#111" }}>
              Unlock the Deal Room
            </Text>
            <Text size="3" style={{ color: "#666" }}>
              Activate your fundraise when you are ready to close.
            </Text>
            <Flex direction="column" gap="16px" style={{ marginTop: "24px" }}>
              <Flex align="start" gap="12px">
                <Text size="4" style={{ flexShrink: 0 }}>
                  🚀
                </Text>
                <Text size="3" style={{ color: "#111", lineHeight: "1.6" }}>
                  <Text weight="bold">One-Click Data Room:</Text> Generate a compliant, shareable investor packet.
                </Text>
              </Flex>
              <Flex align="start" gap="12px">
                <Text size="4" style={{ flexShrink: 0 }}>
                  📄
                </Text>
                <Text size="3" style={{ color: "#111", lineHeight: "1.6" }}>
                  <Text weight="bold">Automated Underwriting:</Text> Auto-draft term sheets and offering docs.
                </Text>
              </Flex>
              <Flex align="start" gap="12px">
                <Text size="4" style={{ flexShrink: 0 }}>
                  💰
                </Text>
                <Text size="3" style={{ color: "#111", lineHeight: "1.6" }}>
                  <Text weight="bold">Capital Match:</Text> Get connected to our network of vetted partners.
                </Text>
              </Flex>
            </Flex>
          </Flex>
        </Card>
      </Flex>

      {/* Get Started Button */}
      <Flex direction="column" align="center" gap="12px">
        <Button
          size="4"
          onClick={handleGetStarted}
          style={{
            backgroundColor: "#E3F2FD",
            color: "#1976D2",
            padding: "14px 48px",
            fontSize: "16px",
            cursor: "pointer",
            border: "none",
            borderRadius: "8px",
            fontWeight: 500,
          }}
        >
          Get Started
        </Button>
        <Text size="2" style={{ color: "#666" }}>
          No credit card required to explore
        </Text>
      </Flex>
    </Flex>
  );
}

