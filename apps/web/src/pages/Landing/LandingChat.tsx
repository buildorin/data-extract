import { useState } from "react";
import { Flex, Text, Button } from "@radix-ui/themes";
import { useNavigate } from "react-router-dom";
import { useAuth } from "react-oidc-context";
import ChatInterface, { ChatMessage } from "../../components/ChatInterface/ChatInterface";
import QuickActionButtons from "../../components/QuickActions/QuickActionButtons";
import TemplateCards from "../../components/TemplateCards/TemplateCards";
import "./LandingChat.css";

export default function LandingChat() {
  const navigate = useNavigate();
  const auth = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [pendingLoginAction, setPendingLoginAction] = useState(false);

  const handleGoToDashboard = () => {
    if (auth.isAuthenticated) {
      navigate("/dashboard");
    } else {
      auth.signinRedirect({
        state: { returnTo: "/dashboard" },
      });
    }
  };

  const handleLogin = () => {
    auth.signinRedirect({
      state: { returnTo: "/dashboard" },
    });
  };

  const handleMessage = (content: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessageCount((prev) => prev + 1);

    const lowerContent = content.toLowerCase().trim();

    // Check for login/account creation responses
    const loginKeywords = ["yes", "yeah", "yep", "sure", "ok", "okay", "continue", "create account", "sign up", "signup", "login", "log in", "proceed", "let's do it", "go ahead"];
    const isLoginResponse = loginKeywords.some(keyword => 
      lowerContent === keyword || 
      lowerContent.startsWith(keyword + " ") ||
      lowerContent.includes(" " + keyword) ||
      lowerContent.includes("i'd like to") ||
      lowerContent.includes("i want to") ||
      (lowerContent.includes("account") && (lowerContent.includes("create") || lowerContent.includes("sign")))
    );

    // Check if previous message was asking about account/login
    const lastMessage = messages[messages.length - 1];
    const wasAskingAboutAccount = lastMessage?.content.toLowerCase().includes("account") || 
                                   lastMessage?.content.toLowerCase().includes("sign up") ||
                                   lastMessage?.content.toLowerCase().includes("continue");

    // If user responds positively to account creation, trigger login
    if (isLoginResponse && (wasAskingAboutAccount || pendingLoginAction)) {
      setTimeout(() => {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Great! Let me take you to sign up. This will only take a moment.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
        
        // Trigger login after short delay
        setTimeout(() => {
          handleLogin();
        }, 1000);
      }, 500);
      return;
    }

    // Simulate assistant response
    setTimeout(() => {
      let assistantResponse = "";
      
      if (lowerContent.includes("analyze") || lowerContent.includes("property")) {
        assistantResponse =
          "I can help you analyze a property. To get started, I'll need:\n\n• Rent roll (PDF or spreadsheet)\n• Trailing 12-month P&L\n• Mortgage statement (optional)\n\nYou can upload documents by dragging them into the chat or clicking the + button. Want to proceed?";
        setPendingLoginAction(false);
      } else if (lowerContent.includes("dscr") || lowerContent.includes("cap")) {
        assistantResponse =
          "I can calculate DSCR (Debt Service Coverage Ratio) and cap spread for your property. I'll need:\n\n• Annual gross rent\n• Operating expenses\n• Debt service (mortgage payments)\n• Property value or purchase price\n\nDo you have this information handy, or would you like to upload documents?";
        setPendingLoginAction(false);
      } else if (lowerContent.includes("memo") || lowerContent.includes("investor")) {
        assistantResponse =
          "I can help you create an investor-ready memo. This package will include:\n\n• Executive summary\n• Property overview\n• Financial analysis (NOI, DSCR, yields)\n• Risk factors\n• Proposed terms\n\nTo get started, please upload your property documents or share the key details.";
        setPendingLoginAction(false);
      } else if (lowerContent.includes("capital") || lowerContent.includes("fund")) {
        assistantResponse =
          "I can estimate how much capital your properties can support. To give you an accurate range, I'll need:\n\n• Property details (location, type, units)\n• Current equity position\n• Cash flow information\n• Any existing debt\n\nWould you like to upload documents or tell me about your properties?";
        setPendingLoginAction(false);
      } else if (lowerContent.includes("proceed") || lowerContent.includes("want to proceed")) {
        assistantResponse =
          "Great! To fully process your documents and save your analysis, you'll need to create a free account. This will allow me to:\n\n• Extract property data using OCR\n• Calculate underwriting metrics\n• Generate investor-ready packages\n• Save your analysis for later\n\nWould you like to create an account?";
        setPendingLoginAction(true);
      } else {
        assistantResponse =
          "I can help with property analysis, underwriting calculations, and creating investor packages. What specific aspect would you like to explore?";
        setPendingLoginAction(false);
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: assistantResponse,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Trigger login modal after 2nd user message (if not already authenticated)
      if (messageCount >= 1 && !auth.isAuthenticated && !pendingLoginAction) {
        setTimeout(() => {
          setShowLoginModal(true);
        }, 1000);
      }
    }, 800);
  };

  const handleFileUpload = (file: File) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: `Uploaded: ${file.name}`,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    // Show preview response
    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "I can see you've uploaded a document. To fully process this file and extract the key facts, you'll need to create a free account. This will allow me to:\n\n• Extract property data using OCR\n• Calculate underwriting metrics\n• Generate investor-ready packages\n• Save your analysis for later\n\nWould you like to continue?",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setPendingLoginAction(true);

      // Trigger login modal after file upload
      if (!auth.isAuthenticated) {
        setTimeout(() => {
          setShowLoginModal(true);
        }, 1500);
      }
    }, 600);
  };

  const handleQuickAction = (prompt: string) => {
    handleMessage(prompt);
  };

  const handleTemplateSelect = (prompt: string) => {
    handleMessage(prompt);
  };

  return (
    <Flex
      direction="column"
      width="100%"
      style={{ minHeight: "100vh", backgroundColor: "#fff" }}
    >
      {/* Header - Elements moved slightly inwards */}
      <Flex
        align="center"
        justify="between"
        style={{
          padding: "20px 192px",
          borderBottom: "none",
          backgroundColor: "#fff",
        }}
      >
        <Flex align="center" gap="12px">
          <img
            src="/logo-orin.png"
            alt="Orin Logo"
            width={32}
            height={32}
            style={{ verticalAlign: "middle" }}
          />
          <Text size="5" weight="bold" style={{ color: "#111" }}>
            ReFlow
          </Text>
        </Flex>
        <Flex gap="12px">
          {!auth.isAuthenticated ? (
            <>
              <Button
                size="3"
                onClick={handleLogin}
                style={{
                  backgroundColor: "#111",
                  padding: "6px 16px",
                  cursor: "pointer",
                  color: "#111",
                  border: "none",
                  borderRadius: "6px",
                }}
              >
                Sign in
              </Button>
              <Button
                size="3"
                onClick={handleLogin}
                style={{
                  backgroundColor: "#111",
                  color: "#fff",
                  padding: "6px 16px",
                  cursor: "pointer",
                  border: "none",
                  borderRadius: "6px",
                }}
              >
                Get started
              </Button>
            </>
          ) : (
            <Button
              size="3"
              onClick={handleGoToDashboard}
              style={{
                backgroundColor: "#111",
                color: "#fff",
                padding: "6px 16px",
                cursor: "pointer",
                border: "none",
                borderRadius: "6px",
              }}
            >
              Dashboard
            </Button>
          )}
        </Flex>
      </Flex>

      {/* Main Content */}
      <Flex
        direction="column"
        align="center"
        style={{
          padding: "80px 24px 40px",
          minHeight: "calc(100vh - 80px)",
        }}
      >
        {/* Hero Section */}
        <Flex
          direction="column"
          align="center"
          style={{
            width: "100%",
            maxWidth: "800px",
            marginBottom: "80px",
          }}
        >
          <Text
            size="8"
            weight="medium"
            style={{
              color: "#111",
              marginBottom: "42px",
              lineHeight: "1.2",
              textAlign: "center",
            }}
          >
            What can I do for you?
          </Text>

          <ChatInterface
            messages={messages}
            onSend={handleMessage}
            onFileUpload={handleFileUpload}
            placeholder="Drop a rent roll, appraisal report, or property doc..."
          />

          {/* Quick Action Buttons - Below Chat */}
          {messages.length === 0 && (
            <QuickActionButtons onAction={handleQuickAction} />
          )}
        </Flex>

        {/* Template Cards - Two Columns */}
        <TemplateCards onSelect={handleTemplateSelect} />
      </Flex>

      {/* Login Modal */}
      {showLoginModal && !auth.isAuthenticated && (
        <Flex
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 1000,
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setShowLoginModal(false)}
        >
          <Flex
            direction="column"
            gap="24px"
            style={{
              backgroundColor: "#fff",
              padding: "40px",
              borderRadius: "12px",
              maxWidth: "450px",
              margin: "24px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Text size="6" weight="bold" style={{ color: "#111" }}>
              Save your analysis
            </Text>
            <Text size="3" style={{ color: "#666" }}>
              Create a free account to:
            </Text>
            <Flex direction="column" gap="12px" style={{ paddingLeft: "8px" }}>
              <Text size="3" style={{ color: "#111" }}>
                • Save this deal to your vault
              </Text>
              <Text size="3" style={{ color: "#111" }}>
                • See full underwriting metrics
              </Text>
              <Text size="3" style={{ color: "#111" }}>
                • Generate investor packages
              </Text>
            </Flex>
            <Flex direction="column" gap="12px" style={{ marginTop: "8px" }}>
              <Button
                size="3"
                onClick={handleLogin}
                style={{
                  backgroundColor: "#111",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                Continue with Keycloak
              </Button>
              <Button
                size="3"
                variant="soft"
                onClick={() => setShowLoginModal(false)}
                style={{ color: "#111" }}
              >
                Maybe later
              </Button>
            </Flex>
            <Text
              size="2"
              style={{ color: "#666", textAlign: "center", marginTop: "8px" }}
            >
              Already have an account?{" "}
              <Text
                style={{ color: "#111", cursor: "pointer", textDecoration: "underline" }}
                onClick={handleLogin}
              >
                Log in
              </Text>
            </Text>
          </Flex>
        </Flex>
      )}
    </Flex>
  );
}
