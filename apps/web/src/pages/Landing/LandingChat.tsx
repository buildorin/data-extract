import { useState, useRef } from "react";
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
  const chatInterfaceRef = useRef<HTMLDivElement>(null);

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
      let hasTemplateResponse = false;
      
      // Check for template card prompts first
      if (lowerContent.includes("rent roll") || lowerContent.includes("analyze")) {
        assistantResponse = `From a rent roll spreadsheet, I can extract and calculate:

┌─────────────────────────────────────┐
│  Example: 12-Unit Multifamily       │
│  Austin, TX                         │
├─────────────────────────────────────┤
│  Gross Rent       $14,400/mo        │
│  Vacancy          8% (1 unit)       │
│  Effective Rent   $13,248/mo        │
│  Est. NOI         $108,000/yr       │
│  DSCR             1.38x             │
│  Supportable Capital  $180K–$240K   │
└─────────────────────────────────────┘

`;
        hasTemplateResponse = true;
      } 
      else if (lowerContent.includes("calculate dscr") || lowerContent.includes("cap spread")) {
        assistantResponse = `Here's how I break it down:

**DSCR (Debt Service Coverage Ratio)**
NOI ÷ Annual Debt Payments

Example: $108K NOI ÷ $72K debt service = 1.5x DSCR
→ Lenders typically want 1.25x minimum

**Cap Spread**
Property Cap Rate − Cost of Debt

Example: 7.2% cap − 6.5% debt rate = +70 bps spread
→ Positive spread = deal generates excess return

Want me to run these for your property?`;
        hasTemplateResponse = true;
      } 
      else if (lowerContent.includes("investor memo") || (lowerContent.includes("LP package") || lowerContent.includes("structure"))) {
        assistantResponse = `A solid LP package typically includes:

1. **Executive Summary** — Deal thesis in 2 paragraphs
2. **Property Overview** — Location, units, condition, photos
3. **Financial Analysis** — NOI, DSCR, cap rate, projections
4. **Capital Structure** — Equity/debt split, terms, waterfall
5. **Risk Factors** — Market, tenant, rate sensitivity
6. **Exit Strategy** — Hold period, target returns

Here's a sample structure:

┌─────────────────────────────────────┐
│  [Sample Memo Preview]              │
│  Riverside Townhomes — 8 Units      │
│  $420K Raise | 8.5% Pref | 3-Yr Hold│
└─────────────────────────────────────┘

I can generate this from your property docs.`;
        hasTemplateResponse = true;
      } 
      else if (lowerContent.includes("equity capital") || (lowerContent.includes("home equity") || lowerContent.includes("property equity"))) {
        assistantResponse = `I look at three things:

1. **Equity Position**
   Property Value − Existing Debt = Available Equity
   
2. **Cash Flow Coverage**
   Can the property service additional debt/pref?
   
3. **Lender/Investor Constraints**
   Max LTV, min DSCR, rate expectations

**Example:**
┌─────────────────────────────────────┐
│  Property Value      $1.8M         │
│  Existing Mortgage   $720K (3.5%)  │
│  Gross Equity        $1.08M        │
│  NOI                 $98K/yr       │
│  ─────────────────────────────     │
│  Accessible Capital  $180K–$280K  │
│  (without refinancing the first)   │
└─────────────────────────────────────┘

Want to see what your properties can support?`;
        hasTemplateResponse = true;
      } 
      else if (lowerContent.includes("renovation") || lowerContent.includes("upgrade")) {
        assistantResponse = `Good question — here's how I evaluate a renovation:

**The Core Math:**
┌─────────────────────────────────────┐
│  Renovation: 4-Unit Interior Rehab  │
├─────────────────────────────────────┤
│  Cost                    $80,000    │
│  Rent Increase           $200/unit  │
│  Annual Added Income     $9,600     │
│  ─────────────────────────────────  │
│  Simple Payback          8.3 years  │
│  Cash-on-Cash ROI        12%        │
└─────────────────────────────────────┘

**But that's not the full picture.**

I also factor in:
• Vacancy during construction (1-2 months lost rent)
• Financing cost if you're borrowing for the rehab
• Depreciation benefits (cost seg can accelerate write-offs)
• Value-add to property (forced appreciation for refi/sale)

Want me to model a specific project?`;
        hasTemplateResponse = true;
      } 
      else if (lowerContent.includes("multi-property") || (lowerContent.includes("portfolio analysis") && lowerContent.includes("compare properties"))) {
        assistantResponse = `Yes — here's what a portfolio view looks like:

┌─────────────────────────────────────────────────┐
│  Portfolio: 6 Properties | Texas               │
├──────────────────┬──────────┬─────────┬────────┤
│  Property        │  NOI     │  DSCR   │ Status │
├──────────────────┼──────────┼─────────┼────────┤
│  Austin 12-Unit  │  $108K   │  1.42x  │ ✓      │
│  Dallas Retail   │  $84K    │  1.18x  │ ⚠️     │
│  Houston 8-Unit  │  $72K    │  1.55x  │ ✓      │
│  SA Industrial   │  $156K   │  1.61x  │ ✓      │
│  FW Mixed-Use    │  $48K    │  0.98x  │ 🔴     │
│  Plano 4-Plex    │  $36K    │  1.33x  │ ✓      │
├──────────────────┴──────────┴─────────┴────────┤
│  Total NOI: $504K | Avg DSCR: 1.35x            │
│  ⚠️ 2 assets underperforming                   │
└─────────────────────────────────────────────────┘

Upload your rent rolls and I'll build this for you.`;
        hasTemplateResponse = true;
      } else if (lowerContent.includes("analyze") || lowerContent.includes("property")) {
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

      // If template response, add follow-up prompt
      if (hasTemplateResponse) {
        setTimeout(() => {
          const followUpMessage: ChatMessage = {
            id: (Date.now() + 2).toString(),
            role: "assistant",
            content: "Want to see how this works with your actual property? Upload a document or create a free account to get started.",
            timestamp: new Date(),
          };
          
          setMessages((prev) => [...prev, followUpMessage]);
          setPendingLoginAction(true);
        }, 1500);
      }

      // Trigger login modal after 2nd user message (if not already authenticated)
      if (messageCount >= 1 && !auth.isAuthenticated && !pendingLoginAction && !hasTemplateResponse) {
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
    // Scroll to chat interface smoothly
    if (chatInterfaceRef.current) {
      chatInterfaceRef.current.scrollIntoView({ 
        behavior: "smooth", 
        block: "center",
        inline: "nearest"
      });
    }
    
    // Small delay to ensure scroll starts, then send message
    setTimeout(() => {
      handleMessage(prompt);
    }, 200);
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
          ref={chatInterfaceRef}
          direction="column"
          align="center"
          style={{
            width: "100%",
            maxWidth: "800px",
            marginBottom: "80px",
            scrollMarginTop: "100px", // Add offset for scroll positioning
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
