import { useQuery } from "react-query";
import { Flex, Card, Text, Button, Badge } from "@radix-ui/themes";
import { useSearchParams } from "react-router-dom";
import { getDeals, DealResponse } from "../../services/dealApi";
import Loader from "../../pages/Loader/Loader";
import "./DealCards.css";
import { MOCK_DEALS } from "../../services/mockDealData";

// TODO: Set to false once backend is fully operational
const USE_MOCK_DATA = true;

const DealCards = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const {
    data: dealsFromApi,
    isLoading: isLoadingApi,
    isError: isErrorApi,
    refetch,
  } = useQuery<DealResponse[]>({
    queryKey: ["deals"],
    queryFn: getDeals,
    enabled: !USE_MOCK_DATA, // Only fetch if not using mock data
  });

  // Use mock data if enabled, otherwise use API data
  const deals = USE_MOCK_DATA ? MOCK_DEALS : dealsFromApi;
  const isLoading = USE_MOCK_DATA ? false : isLoadingApi;
  const isError = USE_MOCK_DATA ? false : isErrorApi;

  const handleDealClick = (dealId: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("dealId", dealId);
    newParams.set("step", "review");
    setSearchParams(newParams);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "gray";
      case "processing_documents":
        return "blue";
      case "fact_review":
        return "orange";
      case "ready_for_underwriting":
        return "green";
      case "complete":
        return "green";
      default:
        return "gray";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "draft":
        return "Draft";
      case "processing_documents":
        return "In Review";
      case "fact_review":
        return "Verified";
      case "ready_for_underwriting":
        return "Verfied";
      case "complete":
        return "Complete";
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <Flex
        width="100%"
        height="100%"
        align="center"
        justify="center"
        direction="column"
        gap="4"
      >
        <Loader />
      </Flex>
    );
  }

  if (isError) {
    return (
      <Flex
        width="100%"
        height="100%"
        align="center"
        justify="center"
        direction="column"
        gap="4"
      >
        <Text size="4" weight="medium">
          Error loading deals
        </Text>
        <Button onClick={() => refetch()}>Retry</Button>
      </Flex>
    );
  }

  if (!deals || deals.length === 0) {
    return (
      <Flex
        width="100%"
        height="100%"
        align="center"
        justify="center"
        direction="column"
        gap="4"
        p="8"
      >
        <Text size="6" weight="bold">
          No deals yet
        </Text>
        <Text size="3" color="gray">
          Create a new deal to get started with underwriting
        </Text>
      </Flex>
    );
  }

  return (
    <Flex
      direction="column"
      gap="4"
      p="24px"
      className="deal-cards-container"
      style={{ overflowY: "auto", height: "100%" }}
    >
      <Flex gap="4" wrap="wrap">
        {deals.map((deal) => (
          <Card
            key={deal.deal_id}
            className="deal-card"
            onClick={() => handleDealClick(deal.deal_id)}
            style={{
              cursor: "pointer",
              width: "320px",
              transition: "all 0.2s ease",
            }}
          >
            <Flex direction="column" gap="3">
              <Flex justify="between" align="center">
                <Text size="5" weight="bold">
                  {deal.deal_name}
                </Text>
                <Badge color={getStatusColor(deal.status)}>
                  {getStatusLabel(deal.status)}
                </Badge>
              </Flex>

              <Flex direction="column" gap="2">
                <Flex justify="between">
                  <Text size="2" color="gray">
                    Documents
                  </Text>
                  <Text size="2" weight="medium">
                    {deal.document_count || 0}
                  </Text>
                </Flex>

                <Flex justify="between">
                  <Text size="2" color="gray">
                    Facts
                  </Text>
                  <Text size="2" weight="medium">
                    {deal.fact_count || 0}
                  </Text>
                </Flex>

                <Flex justify="between">
                  <Text size="2" color="gray">
                    Created
                  </Text>
                  <Text size="2">
                    {new Date(deal.created_at).toLocaleDateString()}
                  </Text>
                </Flex>
              </Flex>

              <Flex gap="2" mt="2">
                <Button
                  size="2"
                  variant="soft"
                  style={{ flex: 1 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDealClick(deal.deal_id);
                  }}
                >
                  View Deal
                </Button>
              </Flex>
            </Flex>
          </Card>
        ))}
      </Flex>
    </Flex>
  );
};

export default DealCards;

