import { Flex, Card, Text, Button, Badge } from "@radix-ui/themes";
import { useQuery } from "react-query";
import { useSearchParams } from "react-router-dom";
import { getDeals, DealResponse } from "../../services/dealApi";
import UnderwritingDashboard from "./UnderwritingDashboard";
import "./UnderwritingModels.css";


const UnderwritingModels = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedDeal = searchParams.get("dealId");

  const { data: deals, isLoading } = useQuery<DealResponse[]>({
    queryKey: ["deals"],
    queryFn: getDeals,
  });

  // #region agent log
  if (deals) {
    fetch('http://127.0.0.1:7242/ingest/8ba094c0-f913-4a1d-9d69-0a38a5483749',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'UnderwritingModels.tsx:37',message:'Deals query result',data:{dealCount:deals.length,deals:deals.map(d=>({id:d.deal_id,name:d.deal_name,status:d.status,factCount:d.fact_count}))},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  }
  // #endregion

  // Show all deals that have facts (verified or not)
  const dealsWithFacts = deals?.filter((deal) => {
    // Show deals that have been through fact extraction (have facts)
    const passes = deal.fact_count && deal.fact_count > 0;
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/8ba094c0-f913-4a1d-9d69-0a38a5483749',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'UnderwritingModels.tsx:43',message:'Filtering deal',data:{dealId:deal.deal_id,dealName:deal.deal_name,status:deal.status,factCount:deal.fact_count,passes},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    return passes;
  });

  // #region agent log
  if (dealsWithFacts) {
    fetch('http://127.0.0.1:7242/ingest/8ba094c0-f913-4a1d-9d69-0a38a5483749',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'UnderwritingModels.tsx:50',message:'Filtered deals result',data:{filteredCount:dealsWithFacts.length,filteredDeals:dealsWithFacts.map(d=>({id:d.deal_id,name:d.deal_name,status:d.status}))},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  }
  // #endregion




  const handleDealClick = (dealId: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("dealId", dealId);
    setSearchParams(params);
  };

  const handleBack = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("dealId");
    setSearchParams(params);
  };


  if (isLoading) {
    return (
      <Flex justify="center" align="center" p="8">
        <Text>Loading deals...</Text>
      </Flex>
    );
  }

  // Show Underwriting Dashboard if deal is selected
  if (selectedDeal) {
    return (
      <Flex direction="column" gap="3" style={{ height: "100%", flex: 1, minHeight: 0 }}>
        <Flex align="center" gap="3" p="24px" style={{ flexShrink: 0 }}>
          <Button variant="soft" onClick={handleBack}>
            ← Back
          </Button>
          <Text size="5" weight="bold">
            {dealsWithFacts?.find((d) => d.deal_id === selectedDeal)?.deal_name} · Underwriting Analysis
          </Text>
        </Flex>
        <Flex style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
          <UnderwritingDashboard dealId={selectedDeal} />
        </Flex>
      </Flex>
    );
  }

  if (!dealsWithFacts || dealsWithFacts.length === 0) {
    return (
      <Flex
        direction="column"
        align="center"
        justify="center"
        p="8"
        gap="4"
        style={{ height: "100%" }}
      >
        <Text size="6" weight="bold" color="gray">
          No Deals Available
        </Text>
        <Text size="3" color="gray">
          Upload documents and extract facts to run underwriting analysis
        </Text>
      </Flex>
    );
  }

  return (
    <Flex direction="column" gap="4" p="24px" className="underwriting-models-container">
      <Flex direction="column" gap="2">
        <Text size="3" color="gray">
          Analyze and stress test deals with financial models
        </Text>
      </Flex>

      <Flex gap="4" wrap="wrap">
        {dealsWithFacts.map((deal) => {
          const isVerified = deal.status === "fact_review" || deal.status === "ready_for_underwriting";
          return (
            <Card
              key={deal.deal_id}
              className="underwriting-deal-card"
              onClick={() => handleDealClick(deal.deal_id)}
              style={{
                cursor: "pointer",
                width: "320px",
                padding: "20px",
                border: selectedDeal === deal.deal_id ? "2px solid #111" : "1px solid #e0e0e0",
                transition: "all 0.2s ease",
              }}
            >
              <Flex direction="column" gap="3">
                <Flex justify="between" align="start">
                  <Text size="5" weight="bold">
                    {deal.deal_name}
                  </Text>
                  {isVerified ? (
                    <Badge color="green">Verified</Badge>
                  ) : (
                    <Badge color="yellow">In Review</Badge>
                  )}
                </Flex>

              <Flex direction="column" gap="2" style={{ fontSize: "13px" }}>
                <Flex justify="between">
                  <Text color="gray">Facts</Text>
                  <Text weight="medium">{deal.fact_count || 0}</Text>
                </Flex>
                <Flex justify="between">
                  <Text color="gray">Documents</Text>
                  <Text weight="medium">{deal.document_count || 0}</Text>
                </Flex>
              </Flex>

              <Button
                size="2"
                variant="soft"
                style={{ width: "100%" }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDealClick(deal.deal_id);
                }}
              >
                View Analysis →
              </Button>
            </Flex>
          </Card>
          );
        })}
      </Flex>
    </Flex>
  );
};

export default UnderwritingModels;

