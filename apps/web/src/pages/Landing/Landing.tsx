import { useState } from "react";
import { Flex, Text, Button, Card } from "@radix-ui/themes";
import { useNavigate } from "react-router-dom";
import { useAuth } from "react-oidc-context";
import ChatDialog from "../../components/Chat/ChatDialog";
import PlaybookCard from "../../components/PlaybookCard/PlaybookCard";
import CapitalPreview from "../../components/CapitalPreview/CapitalPreview";
import Monetization from "../../components/Monetization/Monetization";
import "./Landing.css";

export default function Landing() {
  const navigate = useNavigate();
  const auth = useAuth();
  const [showChat, setShowChat] = useState(false);
  const [chatPrompt, setChatPrompt] = useState<string | undefined>(undefined);

  const handleViewPlaybooks = () => {
    // Scroll to playbooks section
    const playbooksSection = document.getElementById("playbooks-section");
    if (playbooksSection) {
      playbooksSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleCheckOptions = () => {
    // Open chat or navigate to options (will be implemented later)
    console.log("Check your options");
  };

  const handleCardClick = (prompt: string) => {
    setChatPrompt(prompt);
    setShowChat(true);
  };

  const handleGoToDashboard = () => {
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
    <Flex direction="column" width="100%" style={{ minHeight: "100vh", backgroundColor: "#fff" }}>
      {/* Header */}
      <Flex
        align="center"
        justify="between"
        style={{
          padding: "24px 48px",
          borderBottom: "1px solid #e0e0e0",
          backgroundColor: "#fff",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <Flex align="center" gap="12px">
          <img
            src="/logo-orin.png"
            alt="Orin Logo"
            width={38}
            height={38}
            style={{ verticalAlign: "middle" }}
          />
          <Text size="6" weight="bold" style={{ color: "#111" }}>
            Orin
          </Text>
        </Flex>
        <Button
          size="3"
          onClick={handleGoToDashboard}
          style={{
            backgroundColor: "#E3F2FD",
            color: "#1976D2",
            padding: "8px 24px",
            cursor: "pointer",
            border: "none",
            borderRadius: "8px",
            fontWeight: 500,
          }}
        >
          Go to Dashboard
        </Button>
      </Flex>

      {/* Hero Section */}
      <Flex
        direction="column"
        align="center"
        justify="center"
        style={{
          minHeight: "80vh",
          padding: "80px 24px",
          textAlign: "center",
          maxWidth: "1200px",
          margin: "0 auto",
          width: "100%",
        }}
      >
        <Text
          size="9"
          weight="bold"
          style={{
            color: "#111",
            marginBottom: "32px",
            lineHeight: "1.2",
            maxWidth: "900px",
          }}
        >
          Asset-Backed Working Capital for Founders
        </Text>
        <Flex
          direction="column"
          gap="8px"
          style={{
            marginBottom: "48px",
            maxWidth: "700px",
          }}
        >
          <Text
            size="5"
            style={{
              color: "#666",
              lineHeight: "1.6",
            }}
          >
            Access up to $500K in non-dilutive capital.
          </Text>
          <Text
            size="5"
            style={{
              color: "#666",
              lineHeight: "1.6",
            }}
          >
            Retain equity control. Access liquidity without the 6-month fundraising cycle.
          </Text>
        </Flex>
        <Flex gap="16px" align="center" wrap="wrap" justify="center">
          <Button
            size="4"
            onClick={handleViewPlaybooks}
            style={{
              backgroundColor: "#E3F2FD",
              color: "#1976D2",
              padding: "12px 32px",
              fontSize: "16px",
              cursor: "pointer",
              border: "none",
              borderRadius: "8px",
              fontWeight: 500,
            }}
          >
            View Playbooks
          </Button>
          <Button
            size="4"
            onClick={handleCheckOptions}
            style={{
              backgroundColor: "#E3F2FD",
              color: "#1976D2",
              padding: "12px 32px",
              fontSize: "16px",
              cursor: "pointer",
              border: "none",
              borderRadius: "8px",
              fontWeight: 500,
            }}
          >
            Check your Options
          </Button>
        </Flex>
      </Flex>

      {/* Three Cards Section */}
      <Flex
        direction="column"
        align="center"
        style={{
          padding: "80px 24px",
          backgroundColor: "#f8f9fa",
          width: "100%",
        }}
      >
        <Flex
          gap="48px"
          wrap="wrap"
          justify="center"
          style={{ maxWidth: "1200px", width: "100%" }}
        >
          <Card
            style={{
              flex: "1 1 300px",
              minWidth: "280px",
              maxWidth: "350px",
              padding: "32px",
              cursor: "pointer",
              border: "1px solid #e0e0e0",
              borderRadius: "12px",
              backgroundColor: "#fff",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
            onClick={() => handleCardClick("I want to seedstrap my growth and get capital on my own terms")}
          >
            <Text size="6" style={{ marginBottom: "16px", display: "block" }}>
              🤖
            </Text>
            <Text
              size="5"
              weight="bold"
              style={{ color: "#111", marginBottom: "8px", display: "block" }}
            >
              Seedstrap Your Growth
            </Text>
            <Text size="3" style={{ color: "#666", lineHeight: "1.5" }}>
            Use real-estate equity and cashflow to raise capital on your own terms
            </Text>
          </Card>
          <Card
            style={{
              flex: "1 1 300px",
              minWidth: "280px",
              maxWidth: "350px",
              padding: "32px",
              cursor: "pointer",
              border: "1px solid #e0e0e0",
              borderRadius: "12px",
              backgroundColor: "#fff",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
            onClick={() => handleCardClick("I want to bridge to my next round using my real-estate equity")}
          >
            <Text size="6" style={{ marginBottom: "16px", display: "block" }}>
              🏠
            </Text>
            <Text
              size="5"
              weight="bold"
              style={{ color: "#111", marginBottom: "8px", display: "block" }}
            >
              Bridge to Next Round
            </Text>
            <Text size="3" style={{ color: "#666", lineHeight: "1.5" }}>
              Safely support your next acquisition, property upgrade
            </Text>
          </Card>
          <Card
            style={{
              flex: "1 1 300px",
              minWidth: "280px",
              maxWidth: "350px",
              padding: "32px",
              cursor: "pointer",
              border: "1px solid #e0e0e0",
              borderRadius: "12px",
              backgroundColor: "#fff",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
            onClick={() => handleCardClick("I want to launch a deal room for investors")}
          >
            <Text size="6" style={{ marginBottom: "16px", display: "block" }}>
              💼
            </Text>
            <Text
              size="5"
              weight="bold"
              style={{ color: "#111", marginBottom: "8px", display: "block" }}
            >
              Launch Deal Room
            </Text>
            <Text size="3" style={{ color: "#666", lineHeight: "1.5" }}>
            Create one compliant link to investor pool
            </Text>
          </Card>
        </Flex>
      </Flex>

      {/* Playbooks Section */}
      <Flex
        id="playbooks-section"
        direction="column"
        align="center"
        style={{
          padding: "80px 24px",
          width: "100%",
          backgroundColor: "#fff",
        }}
      >
        <Text
          size="8"
          weight="medium"
          style={{ color: "#111", marginBottom: "48px", textAlign: "center" }}
        >
          Real playbooks from real founders
        </Text>
        <Flex
          direction="column"
          gap="24px"
          style={{ maxWidth: "900px", width: "100%" }}
        >
          <PlaybookCard />
        </Flex>
      </Flex>

      {/* Capital Preview Section */}
      <CapitalPreview />

      {/* Monetization Section */}
      <Monetization />

      {/* Chat Dialog */}
      {showChat && (
        <ChatDialog
          open={showChat}
          onClose={() => {
            setShowChat(false);
            setChatPrompt(undefined);
          }}
          initialPrompt={chatPrompt}
          onLoginRequest={() => {
            setShowChat(false);
            auth.signinRedirect({
              state: { returnTo: "/dashboard" },
            });
          }}
        />
      )}
    </Flex>
  );
}

