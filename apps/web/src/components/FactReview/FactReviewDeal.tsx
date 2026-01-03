import { useState } from "react";
import { Flex, Text, Card, Button, TextField, Badge, Dialog } from "@radix-ui/themes";
import { useQuery, useMutation, useQueryClient } from "react-query";
import {
  getDeal,
  getDealFacts,
  getDealDocuments,
  updateFact,
  approveFacts,
  resetFacts,
  updateDealStatus,
  DealResponse,
  FactResponse,
  DocumentResponse,
} from "../../services/dealApi";
import toast from "react-hot-toast";
import "./FactReviewDeal.css";

interface FactReviewDealProps {
  dealId: string;
  onFactsApproved?: () => void;
}

type FactStatus = "missing" | "needs_review" | "verified";

const FactReviewDeal = ({ dealId, onFactsApproved }: FactReviewDealProps) => {
  const [editedFacts, setEditedFacts] = useState<
    Record<string, { value: string; unit?: string }>
  >({});
  const [selectedFacts, setSelectedFacts] = useState<Set<string>>(new Set());
  const [viewingDocument, setViewingDocument] = useState<DocumentResponse | null>(null);
  const queryClient = useQueryClient();

  const {
    data: dealInfo,
  } = useQuery<DealResponse>({
    queryKey: ["deal", dealId],
    queryFn: () => getDeal(dealId),
  });

  const {
    data: facts,
    isLoading,
    isError,
    refetch,
  } = useQuery<FactResponse[]>({
    queryKey: ["deal-facts", dealId],
    queryFn: () => getDealFacts(dealId),
  });

  const {
    data: documents,
  } = useQuery<DocumentResponse[]>({
    queryKey: ["deal-documents", dealId],
    queryFn: () => getDealDocuments(dealId),
  });

  const updateMutation = useMutation({
    mutationFn: (data: {
      factId: string;
      value: string;
      unit?: string;
    }) => updateFact(dealId, data.factId, data.value, data.unit),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deal-facts", dealId] });
      toast.success("Fact updated");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update fact");
    },
  });

  const approveMutation = useMutation({
    mutationFn: (factIds: string[]) => approveFacts(dealId, factIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deal-facts", dealId] });
      queryClient.invalidateQueries({ queryKey: ["deal", dealId] });
      toast.success("Facts verified and locked");
      setSelectedFacts(new Set());
      // Don't automatically trigger onFactsApproved here
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to approve facts");
    },
  });

  const resetMutation = useMutation({
    mutationFn: () => resetFacts(dealId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deal-facts", dealId] });
      queryClient.invalidateQueries({ queryKey: ["deal", dealId] });
      toast.success("Facts reset to editable state");
      setEditedFacts({});
      setSelectedFacts(new Set());
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to reset facts");
    },
  });

  const handleValueChange = (factId: string, value: string) => {
    setEditedFacts({
      ...editedFacts,
      [factId]: { value, unit: editedFacts[factId]?.unit },
    });
  };

  const handleUnitChange = (factId: string, unit: string) => {
    setEditedFacts({
      ...editedFacts,
      [factId]: { value: editedFacts[factId]?.value || "", unit },
    });
  };

  const saveFact = (factId: string) => {
    const edited = editedFacts[factId];
    if (edited) {
      updateMutation.mutate({
        factId,
        value: edited.value,
        unit: edited.unit,
      });
      const newEdited = { ...editedFacts };
      delete newEdited[factId];
      setEditedFacts(newEdited);
    }
  };

  const toggleFactSelection = (factId: string) => {
    const newSelected = new Set(selectedFacts);
    if (newSelected.has(factId)) {
      newSelected.delete(factId);
    } else {
      newSelected.add(factId);
    }
    setSelectedFacts(newSelected);
  };

  const handleApproveSelected = () => {
    if (selectedFacts.size === 0) {
      toast.error("Please select facts to verify");
      return;
    }
    approveMutation.mutate(Array.from(selectedFacts));
  };

  const handleVerifyAll = () => {
    if (!facts || facts.length === 0) {
      toast.error("No facts to verify");
      return;
    }
    const unlocked = facts.filter((f) => !f.locked);
    if (unlocked.length === 0) {
      toast.success("All facts are already verified");
      return;
    }
    // Select all and verify in one action
    const allIds = unlocked.map((f) => f.fact_id);
    setSelectedFacts(new Set(allIds));
    approveMutation.mutate(allIds);
  };

  const handleRunUnderwriting = async () => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/8ba094c0-f913-4a1d-9d69-0a38a5483749',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'FactReviewDeal.tsx:handleRunUnderwriting',message:'handleRunUnderwriting called',data:{dealId,factsCount:facts?.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    if (!facts || facts.length === 0) {
      toast.error("No facts available for underwriting");
      return;
    }
    
    // Update deal status to ready_for_underwriting
    try {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/8ba094c0-f913-4a1d-9d69-0a38a5483749',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'FactReviewDeal.tsx:handleRunUnderwriting',message:'Calling updateDealStatus',data:{dealId,status:'ready_for_underwriting'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      await updateDealStatus(dealId, "ready_for_underwriting");
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/8ba094c0-f913-4a1d-9d69-0a38a5483749',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'FactReviewDeal.tsx:handleRunUnderwriting',message:'updateDealStatus completed, invalidating queries',data:{dealId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      queryClient.invalidateQueries({ queryKey: ["deals"] });
      queryClient.invalidateQueries({ queryKey: ["deal", dealId] });
    } catch (error) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/8ba094c0-f913-4a1d-9d69-0a38a5483749',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'FactReviewDeal.tsx:handleRunUnderwriting',message:'updateDealStatus failed',data:{dealId,error:error instanceof Error?error.message:String(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      console.error("Failed to update deal status:", error);
    }
    
    // Run underwriting even with unverified facts
    toast.success("Running underwriting analysis...");
    if (onFactsApproved) onFactsApproved();
  };

  // Determine fact status based on new rules
  const getFactStatus = (fact: FactResponse): FactStatus => {
    // If locked/approved, it's verified
    if (fact.locked || fact.status === "approved") {
      return "verified";
    }
    
    // If no confidence score or very low, it's missing
    if (!fact.confidence_score || fact.confidence_score < 0.5) {
      return "missing";
    }
    
    // If single source or moderate confidence, needs review
    if (fact.confidence_score < 0.9) {
      return "needs_review";
    }
    
    // High confidence with multiple sources = verified
    return "verified";
  };

  const getStatusDisplay = (status: FactStatus) => {
    switch (status) {
      case "missing":
        return { icon: "🔴", label: "Missing", color: "red" };
      case "needs_review":
        return { icon: "🟡", label: "Needs Review", color: "yellow" };
      case "verified":
        return { icon: "🟢", label: "Checked", color: "green" };
    }
  };

  const findDocumentByName = (fileName: string): DocumentResponse | undefined => {
    return documents?.find((doc) => doc.file_name === fileName);
  };

  const handleViewSource = (fact: FactResponse) => {
    const doc = findDocumentByName(fact.source_citation.document);
    if (doc) {
      setViewingDocument(doc);
    } else {
      toast.error("Document not found");
    }
  };

  if (isLoading) {
    return (
      <Flex justify="center" align="center" p="8">
        <Text>Loading facts...</Text>
      </Flex>
    );
  }

  if (isError) {
    return (
      <Flex justify="center" align="center" p="8" direction="column" gap="4">
        <Text color="red">Error loading facts</Text>
        <Button onClick={() => refetch()}>Retry</Button>
      </Flex>
    );
  }

  if (!facts || facts.length === 0) {
    return (
      <Flex justify="center" align="center" p="8">
        <Text color="gray">No facts extracted yet</Text>
      </Flex>
    );
  }

  const hasLockedFacts = facts.some((f) => f.locked);

  return (
    <Flex
      direction="column"
      gap="3"
      p="24px"
      style={{ overflowY: "auto", height: "100%" }}
      className="fact-review-container"
    >
      <Flex direction="column" gap="3" mb="3">
        <Flex justify="between" align="center">
          <Flex direction="column" gap="1">
            <Text size="4" weight="medium">
              {dealInfo?.deal_name || "Deal"}
            </Text>
            <Text size="2" color="gray">
              Verify extracted data to lock and analyze
            </Text>
          </Flex>
          <Flex gap="2" wrap="wrap">
            {hasLockedFacts && (
              <Button
                size="2"
                variant="outline"
                color="red"
                onClick={() => resetMutation.mutate()}
                disabled={resetMutation.isLoading}
              >
                Reset All
              </Button>
            )}
            {selectedFacts.size > 0 && (
              <Button
                size="2"
                onClick={handleApproveSelected}
                disabled={approveMutation.isLoading}
              >
                Verify Selected ({selectedFacts.size})
              </Button>
            )}
            <Button
              size="2"
              onClick={handleVerifyAll}
              disabled={approveMutation.isLoading}
            >
              Verify All
            </Button>
            <Button
              size="2"
              onClick={handleRunUnderwriting}
              style={{
                backgroundColor: "#111",
                color: "#fff",
              }}
            >
              Run Underwriting →
            </Button>
          </Flex>
        </Flex>
      </Flex>

      <Flex direction="column" gap="2">
        {facts.map((fact) => {
          const status = getFactStatus(fact);
          const statusDisplay = getStatusDisplay(status);
          const isEdited = !!editedFacts[fact.fact_id];
          const sourceDoc = findDocumentByName(fact.source_citation.document);

          return (
            <Card
              key={fact.fact_id}
              className="fact-card"
              style={{
                padding: "12px 16px",
                background: fact.locked ? "#f8f9fa" : "white",
                border: selectedFacts.has(fact.fact_id)
                  ? "2px solid #111"
                  : "1px solid #e0e0e0",
              }}
            >
              <Flex direction="column" gap="2">
                <Flex justify="between" align="center" wrap="wrap" gap="2">
                  <Flex align="center" gap="2" style={{ flex: "1 1 200px", minWidth: 0 }}>
                    {!fact.locked && (
                      <input
                        type="checkbox"
                        checked={selectedFacts.has(fact.fact_id)}
                        onChange={() => toggleFactSelection(fact.fact_id)}
                        style={{ cursor: "pointer", flexShrink: 0 }}
                      />
                    )}
                    <Text size="3" weight="bold" style={{ flexShrink: 0 }}>
                      {fact.label}
                    </Text>
                    <Badge color={statusDisplay.color as any} style={{ flexShrink: 0 }}>
                      {statusDisplay.icon} {statusDisplay.label}
                    </Badge>
                    {fact.locked && (
                      <Badge color="green" style={{ flexShrink: 0 }}>
                        Locked
                      </Badge>
                    )}
                  </Flex>
                  {sourceDoc && (
                    <Flex
                      align="center"
                      gap="1"
                      onClick={() => handleViewSource(fact)}
                      style={{
                        cursor: "pointer",
                        flexShrink: 0,
                        color: "#111",
                      }}
                    >
                      <Text size="2" style={{ color: "#111" }}>
                        📄
                      </Text>
                      <Text size="2" weight="medium" style={{ color: "#111" }}>
                        View Source
                      </Text>
                    </Flex>
                  )}
                </Flex>

                <Flex gap="2" align="center" wrap="wrap">
                  <TextField.Root
                    value={
                      editedFacts[fact.fact_id]?.value ?? fact.value
                    }
                    onChange={(e) =>
                      handleValueChange(fact.fact_id, e.target.value)
                    }
                    disabled={fact.locked}
                    style={{ width: "200px", flexShrink: 0 }}
                    placeholder="Value"
                  />
                  {fact.unit && (
                    <TextField.Root
                      value={
                        editedFacts[fact.fact_id]?.unit ?? fact.unit
                      }
                      onChange={(e) =>
                        handleUnitChange(fact.fact_id, e.target.value)
                      }
                      disabled={fact.locked}
                      style={{ width: "120px", flexShrink: 0 }}
                      placeholder="Unit"
                    />
                  )}
                  {isEdited && !fact.locked && (
                    <Button
                      size="2"
                      onClick={() => saveFact(fact.fact_id)}
                      disabled={updateMutation.isLoading}
                      style={{ flexShrink: 0 }}
                    >
                      Save
                    </Button>
                  )}
                </Flex>

                <Flex direction="column" gap="1" style={{ fontSize: "11px" }}>
                  <Text size="1" color="gray">
                    <strong>Source:</strong> {fact.source_citation.document}, Page{" "}
                    {fact.source_citation.page}
                    {fact.source_citation.line && ` - Line: ${fact.source_citation.line}`}
                  </Text>
                  {fact.approved_at && (
                    <Text size="1" color="gray">
                      <strong>Verified:</strong>{" "}
                      {new Date(fact.approved_at).toLocaleDateString()}
                      {fact.approved_by && ` by ${fact.approved_by}`}
                    </Text>
                  )}
                </Flex>
              </Flex>
            </Card>
          );
        })}
      </Flex>

      {/* Document Viewer Dialog */}
      <Dialog.Root open={!!viewingDocument} onOpenChange={(open) => !open && setViewingDocument(null)}>
        <Dialog.Content style={{ maxWidth: "90vw", maxHeight: "90vh" }}>
          <Dialog.Title>
            {viewingDocument?.file_name || "Source Document"}
          </Dialog.Title>
          <Dialog.Description size="2" mb="4">
            Page {viewingDocument && facts?.find(f => f.source_citation.document === viewingDocument.file_name)?.source_citation.page || 1}
          </Dialog.Description>
          
          <Flex direction="column" gap="3" style={{ maxHeight: "70vh", overflow: "auto" }}>
            {viewingDocument?.url || viewingDocument?.storage_location ? (
              <iframe
                src={viewingDocument.url || viewingDocument.storage_location}
                style={{
                  width: "100%",
                  height: "600px",
                  border: "1px solid #e0e0e0",
                  borderRadius: "4px",
                }}
                title={viewingDocument.file_name}
              />
            ) : (
              <Flex
                direction="column"
                align="center"
                justify="center"
                p="8"
                gap="2"
                style={{ minHeight: "400px" }}
              >
                <Text size="4" color="gray">
                  📄 {viewingDocument?.file_name}
                </Text>
                <Text size="2" color="gray">
                  Document preview not available. The document will be available once uploaded and processed.
                </Text>
                <Text size="1" color="gray" style={{ marginTop: "8px" }}>
                  Source: {facts?.find(f => f.source_citation.document === viewingDocument?.file_name)?.source_citation.document}
                  {facts?.find(f => f.source_citation.document === viewingDocument?.file_name)?.source_citation.page && 
                    `, Page ${facts.find(f => f.source_citation.document === viewingDocument?.file_name)?.source_citation.page}`
                  }
                </Text>
              </Flex>
            )}
          </Flex>

          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button variant="soft">Close</Button>
            </Dialog.Close>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </Flex>
  );
};

export default FactReviewDeal;
