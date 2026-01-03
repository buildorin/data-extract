import { useState, useMemo } from "react";
import { Flex, Text, Card, Button, TextField } from "@radix-ui/themes";
import { TaskResponse } from "../../models/taskResponse.model";
import { ExtractedFact } from "../../models/deal.model";
import "./FactReview.css";

interface FactReviewProps {
  task: TaskResponse;
  onFactsApproved?: (facts: ExtractedFact[]) => void;
  onReset?: () => void;
}

// Mock fact extraction - in real implementation, this would come from the backend
const extractFactsFromTask = (task: TaskResponse): ExtractedFact[] => {
  const facts: ExtractedFact[] = [];
  
  if (task.output?.chunks) {
    task.output.chunks.forEach((chunk) => {
      chunk.segments.forEach((segment) => {
        // Extract common real estate facts from segments
        const content = segment.content?.toLowerCase() || "";
        
        // Unit count
        const unitMatch = content.match(/(\d+)\s*(?:unit|units|apt|apartment)/i);
        if (unitMatch && !facts.find(f => f.name === "Unit count")) {
          facts.push({
            id: `fact-${facts.length}`,
            name: "Unit count",
            value: parseInt(unitMatch[1]),
            source_document: task.output?.file_name || "Unknown",
            page_number: segment.page_number,
            line_reference: `Segment ${segment.segment_id}`,
            is_approved: false,
            is_locked: false,
          });
        }
        
        // Occupancy
        const occupancyMatch = content.match(/(\d+(?:\.\d+)?)\s*%?\s*(?:occupancy|occupied)/i);
        if (occupancyMatch && !facts.find(f => f.name === "Occupancy %")) {
          facts.push({
            id: `fact-${facts.length}`,
            name: "Occupancy %",
            value: parseFloat(occupancyMatch[1]),
            source_document: task.output?.file_name || "Unknown",
            page_number: segment.page_number,
            line_reference: `Segment ${segment.segment_id}`,
            is_approved: false,
            is_locked: false,
          });
        }
        
        // Rent amounts
        const rentMatch = content.match(/\$?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*(?:rent|gross|scheduled)/i);
        if (rentMatch && !facts.find(f => f.name === "Gross scheduled rent")) {
          facts.push({
            id: `fact-${facts.length}`,
            name: "Gross scheduled rent",
            value: rentMatch[1].replace(/,/g, ""),
            source_document: task.output?.file_name || "Unknown",
            page_number: segment.page_number,
            line_reference: `Segment ${segment.segment_id}`,
            is_approved: false,
            is_locked: false,
          });
        }
      });
    });
  }
  
  // Add default facts if none found
  if (facts.length === 0) {
    return [
      {
        id: "fact-1",
        name: "Unit count",
        value: "",
        source_document: task.output?.file_name || "Unknown",
        page_number: 1,
        is_approved: false,
        is_locked: false,
      },
      {
        id: "fact-2",
        name: "Occupancy %",
        value: "",
        source_document: task.output?.file_name || "Unknown",
        page_number: 1,
        is_approved: false,
        is_locked: false,
      },
      {
        id: "fact-3",
        name: "Gross scheduled rent",
        value: "",
        source_document: task.output?.file_name || "Unknown",
        page_number: 1,
        is_approved: false,
        is_locked: false,
      },
      {
        id: "fact-4",
        name: "Collected rent",
        value: "",
        source_document: task.output?.file_name || "Unknown",
        page_number: 1,
        is_approved: false,
        is_locked: false,
      },
      {
        id: "fact-5",
        name: "Operating expenses",
        value: "",
        source_document: task.output?.file_name || "Unknown",
        page_number: 1,
        is_approved: false,
        is_locked: false,
      },
      {
        id: "fact-6",
        name: "NOI",
        value: "",
        source_document: task.output?.file_name || "Unknown",
        page_number: 1,
        is_approved: false,
        is_locked: false,
      },
      {
        id: "fact-7",
        name: "Debt service",
        value: "",
        source_document: task.output?.file_name || "Unknown",
        page_number: 1,
        is_approved: false,
        is_locked: false,
      },
      {
        id: "fact-8",
        name: "DSCR",
        value: "",
        source_document: task.output?.file_name || "Unknown",
        page_number: 1,
        is_approved: false,
        is_locked: false,
      },
    ];
  }
  
  return facts;
};

export default function FactReview({ task, onFactsApproved, onReset }: FactReviewProps) {
  const [facts, setFacts] = useState<ExtractedFact[]>(() => extractFactsFromTask(task));
  const [editingFactId, setEditingFactId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");

  const allApproved = useMemo(() => {
    return facts.every(f => f.is_approved);
  }, [facts]);

  const allLocked = useMemo(() => {
    return facts.every(f => f.is_locked);
  }, [facts]);

  const handleEdit = (fact: ExtractedFact) => {
    if (fact.is_locked) return;
    setEditingFactId(fact.id);
    setEditValue(String(fact.value));
  };

  const handleSaveEdit = (factId: string) => {
    setFacts(prev =>
      prev.map(f =>
        f.id === factId ? { ...f, value: editValue } : f
      )
    );
    setEditingFactId(null);
    setEditValue("");
  };

  const handleCancelEdit = () => {
    setEditingFactId(null);
    setEditValue("");
  };

  const handleApproveFact = (factId: string) => {
    setFacts(prev =>
      prev.map(f =>
        f.id === factId ? { ...f, is_approved: true } : f
      )
    );
  };

  const handleApproveAll = () => {
    const updatedFacts = facts.map(f => ({ ...f, is_approved: true, is_locked: true }));
    setFacts(updatedFacts);
    onFactsApproved?.(updatedFacts);
  };

  const handleReset = () => {
    const resetFacts = facts.map(f => ({
      ...f,
      is_approved: false,
      is_locked: false,
    }));
    setFacts(resetFacts);
    onReset?.();
  };

  return (
    <Flex 
      direction="column" 
      gap="16px" 
      style={{ 
        padding: "16px", 
        width: "100%", 
        height: "100%",
        overflowY: "auto",
      }}
    >
      <Flex align="center" justify="between" style={{ marginBottom: "8px" }}>
        <Text size="4" weight="medium" style={{ color: "#111" }}>
        Verify extracted data to lock and analyze
        </Text>
        <Flex gap="8px">
          {!allLocked && (
            <Button
              size="2"
              onClick={handleApproveAll}
              disabled={facts.length === 0}
              style={{
                backgroundColor: allApproved ? "#4CAF50" : "#545454",
                color: "#fff",
                cursor: allApproved ? "pointer" : "not-allowed",
                padding: "6px 16px",
              }}
            >
              Verify All
            </Button>
          )}
          {allLocked && (
            <Button
              size="2"
              onClick={handleReset}
              style={{
                backgroundColor: "#f44336",
                color: "#fff",
                padding: "6px 16px",
              }}
            >
              Reset Facts
            </Button>
          )}
        </Flex>
      </Flex>

      <Flex direction="column" gap="8px" style={{ flex: 1 }}>
        {facts.map((fact) => (
          <Card
            key={fact.id}
            style={{
              padding: "12px 16px",
              border: fact.is_locked ? "2px solid #4CAF50" : "1px solid #e0e0e0",
              borderRadius: "6px",
              backgroundColor: fact.is_locked ? "#f1f8f4" : "#fff",
            }}
          >
            <Flex direction="column" gap="8px">
              <Flex align="center" justify="between">
                <Text size="3" weight="bold" style={{ color: "#111" }}>
                  {fact.name}
                </Text>
                {fact.is_approved && (
                  <Flex
                    align="center"
                    gap="4px"
                    style={{
                      padding: "2px 8px",
                      borderRadius: "4px",
                      backgroundColor: "#4CAF50",
                      color: "#fff",
                    }}
                  >
                    <Text size="1" weight="bold">✓</Text>
                  </Flex>
                )}
              </Flex>

              <Flex direction="column" gap="6px">
                {editingFactId === fact.id ? (
                  <Flex gap="6px" align="center">
                    <TextField.Root
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      style={{ flex: 1 }}
                      size="2"
                      autoFocus
                    />
                    <Button
                      size="1"
                      onClick={() => handleSaveEdit(fact.id)}
                      style={{ backgroundColor: "#4CAF50", color: "#fff", padding: "4px 8px" }}
                    >
                      Save
                    </Button>
                    <Button
                      size="1"
                      onClick={handleCancelEdit}
                      style={{ backgroundColor: "#666", color: "#fff", padding: "4px 8px" }}
                    >
                      Cancel
                    </Button>
                  </Flex>
                ) : (
                  <Flex align="center" gap="8px">
                    <Text
                      size="4"
                      weight="medium"
                      style={{
                        color: fact.is_locked ? "#666" : "#111",
                        cursor: fact.is_locked ? "default" : "pointer",
                      }}
                      onClick={() => handleEdit(fact)}
                    >
                      {fact.value || "Click to edit"}
                    </Text>
                    {!fact.is_locked && (
                      <Text
                        size="1"
                        style={{ color: "#999", cursor: "pointer" }}
                        onClick={() => handleEdit(fact)}
                      >
                        (Edit)
                      </Text>
                    )}
                  </Flex>
                )}
              </Flex>

              <Flex direction="row" gap="12px" style={{ marginTop: "4px" }}>
                <Text size="1" style={{ color: "#999" }}>
                  {fact.source_document}
                </Text>
                <Text size="1" style={{ color: "#999" }}>
                  Pg {fact.page_number}
                  {fact.line_reference && ` • ${fact.line_reference}`}
                </Text>
              </Flex>

              {!fact.is_approved && !fact.is_locked && (
                <Flex justify="end" style={{ marginTop: "4px" }}>
                  <Button
                    size="1"
                    onClick={() => handleApproveFact(fact.id)}
                    style={{
                      backgroundColor: "#545454",
                      color: "#fff",
                      padding: "4px 12px",
                    }}
                  >
                    Approve
                  </Button>
                </Flex>
              )}
            </Flex>
          </Card>
        ))}
      </Flex>
    </Flex>
  );
}

