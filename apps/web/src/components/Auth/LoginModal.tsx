import { Flex, Text, Button, Dialog } from "@radix-ui/themes";
import { useAuth } from "react-oidc-context";
import "./LoginModal.css";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  trigger?: "file_upload" | "message_limit" | "feature_request" | "manual";
  dealData?: any;
}

export default function LoginModal({
  open,
  onClose,
  trigger = "manual",
  dealData,
}: LoginModalProps) {
  const auth = useAuth();

  const handleLogin = () => {
    const state: any = { returnTo: "/dashboard" };
    
    // Pass deal data through auth state if available
    if (dealData) {
      state.dealData = dealData;
    }
    
    auth.signinRedirect({ state });
  };

  const getTriggerMessage = () => {
    switch (trigger) {
      case "file_upload":
        return "To process your uploaded document and extract key facts, please create a free account.";
      case "message_limit":
        return "You've reached the preview limit. Create a free account to continue the conversation.";
      case "feature_request":
        return "This feature requires an account. Sign up to unlock full functionality.";
      default:
        return "Create a free account to save your progress and access all features.";
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Content style={{ maxWidth: "450px" }}>
        <Dialog.Title>
          <Text size="6" weight="bold">
            Save your analysis
          </Text>
        </Dialog.Title>

        <Flex direction="column" gap="20px" mt="4">
          <Text size="3" style={{ color: "#666" }}>
            {getTriggerMessage()}
          </Text>

          <Text size="3" weight="medium" style={{ marginTop: "8px" }}>
            Create a free account to:
          </Text>

          <Flex direction="column" gap="10px" style={{ paddingLeft: "8px" }}>
            <Flex align="center" gap="8px">
              <Text size="2" style={{ color: "#4CAF50" }}>
                ✓
              </Text>
              <Text size="3">Save this deal to your vault</Text>
            </Flex>
            <Flex align="center" gap="8px">
              <Text size="2" style={{ color: "#4CAF50" }}>
                ✓
              </Text>
              <Text size="3">See full underwriting metrics</Text>
            </Flex>
            <Flex align="center" gap="8px">
              <Text size="2" style={{ color: "#4CAF50" }}>
                ✓
              </Text>
              <Text size="3">Generate investor packages</Text>
            </Flex>
            <Flex align="center" gap="8px">
              <Text size="2" style={{ color: "#4CAF50" }}>
                ✓
              </Text>
              <Text size="3">Chat with AI for deal guidance</Text>
            </Flex>
          </Flex>

          <Flex direction="column" gap="12px" style={{ marginTop: "16px" }}>
            <Button
              size="3"
              onClick={handleLogin}
              style={{
                backgroundColor: "#1976D2",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              Continue with Keycloak
            </Button>
            <Button
              size="3"
              variant="soft"
              onClick={onClose}
              style={{
                cursor: "pointer",
              }}
            >
              Maybe later
            </Button>
          </Flex>

          <Text
            size="2"
            style={{
              color: "#666",
              textAlign: "center",
              marginTop: "8px",
            }}
          >
            Already have an account?{" "}
            <Text
              style={{
                color: "#1976D2",
                cursor: "pointer",
                textDecoration: "underline",
              }}
              onClick={handleLogin}
            >
              Log in
            </Text>
          </Text>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}

