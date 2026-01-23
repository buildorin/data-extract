import { Flex, Text, Card, Button, Separator, Grid, TextField } from "@radix-ui/themes";
import { useState, useEffect } from "react";
import { DealResponse, updateDealScore } from "../../services/dealApi";
import { DealTypeBadge } from "./DealTypeBadge";
import { getDealScore, calculateDealScore } from "../../services/scoringApi";
import "./DealSummaryCard.css";

interface DealSummaryCardProps {
  deal: DealResponse;
  metrics?: {
    grossRent?: number;
    noi?: number;
    dscr?: number;
    capRate?: number;
    capSpread?: number;
  };
  onViewFullAnalysis?: () => void;
  onExport?: () => void;
  onDealNameUpdate?: (newName: string) => void;
}

interface InfoRowProps {
  label: string;
  value: string | number;
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <Flex direction="column" gap="4px">
      <Text size="1" style={{ color: "#666", textTransform: "uppercase" }}>
        {label}
      </Text>
      <Text size="2" weight="medium">
        {value}
      </Text>
    </Flex>
  );
}

interface MetricRowProps {
  label: string;
  value: string | number;
  highlight?: boolean;
}

function MetricRow({ label, value, highlight }: MetricRowProps) {
  return (
    <Flex justify="between" align="center">
      <Text size="2" style={{ color: "#666" }}>
        {label}
      </Text>
      <Text
        size="3"
        weight="bold"
        style={{ color: highlight ? "#1976D2" : "#111" }}
      >
        {value}
      </Text>
    </Flex>
  );
}

export default function DealSummaryCard({
  deal,
  metrics,
  onViewFullAnalysis,
  onExport,
  onDealNameUpdate,
}: DealSummaryCardProps) {
  const [isEditingDealName, setIsEditingDealName] = useState(false);
  const [dealNameValue, setDealNameValue] = useState(deal.deal_name);
  const [isEditingDealScore, setIsEditingDealScore] = useState(false);
  const [dealScoreValue, setDealScoreValue] = useState("—");
  const [scoreData, setScoreData] = useState<{
    score: number | null;
    tier: string | null;
  } | null>(null);
  const [isCalculatingScore, setIsCalculatingScore] = useState(false);

  useEffect(() => {
    setDealNameValue(deal.deal_name);
  }, [deal.deal_name]);

  // Fetch existing score on mount - check deal object first, then API
  useEffect(() => {
    // First check if deal already has score
    if (deal.orin_score !== null && deal.orin_score !== undefined) {
      setScoreData({
        score: deal.orin_score,
        tier: deal.orin_score_tier || null,
      });
      setDealScoreValue(deal.orin_score.toString());
      return;
    }
    
    // Otherwise try to fetch from API
    const fetchScore = async () => {
      try {
        const response = await getDealScore(deal.deal_id);
        if (response.score !== null) {
          setScoreData({
            score: response.score,
            tier: response.tier,
          });
          setDealScoreValue(response.score.toString());
        }
      } catch (error) {
        console.error('Error fetching deal score:', error);
      }
    };
    fetchScore();
  }, [deal.deal_id, deal.orin_score, deal.orin_score_tier]);

  const handleSaveDealName = () => {
    if (dealNameValue.trim() && onDealNameUpdate) {
      onDealNameUpdate(dealNameValue.trim());
      setIsEditingDealName(false);
    }
  };

  const handleCancelEdit = () => {
    setDealNameValue(deal.deal_name);
    setIsEditingDealName(false);
  };

  const determineTierFromScore = (score: number): string => {
    if (score >= 85 && score <= 100) return "strong";
    if (score >= 70 && score <= 84) return "good";
    if (score >= 50 && score <= 69) return "risky";
    return "pass";
  };

  const handleCalculateScore = async () => {
    setIsCalculatingScore(true);
    try {
      const response = await calculateDealScore(deal.deal_id);
      if (response.score !== null) {
        setScoreData({
          score: response.score,
          tier: response.tier,
        });
        setDealScoreValue(response.score.toString());
      }
    } catch (error) {
      console.error('Error calculating deal score:', error);
    } finally {
      setIsCalculatingScore(false);
    }
  };

  // Calculate capital range based on metrics
  const getCapitalRange = () => {
    if (!metrics?.noi) return { min: 0, max: 0 };
    
    // Simple calculation: 4-7x NOI
    const min = Math.round((metrics.noi * 4) / 1000) * 1000;
    const max = Math.round((metrics.noi * 7) / 1000) * 1000;
    
    return { min, max };
  };

  const capitalRange = getCapitalRange();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <Card style={{ padding: "28px", height: "100%" }}>
      <Flex direction="column" gap="24px">
        {/* Header */}
        <Flex direction="column" gap="8px" style={{ position: "relative" }}>
          <Flex justify="between" align="start" style={{ width: "100%" }}>
            <Flex direction="column" gap="2" style={{ flex: 1 }}>
          {isEditingDealName ? (
            <Flex gap="8px" align="center">
              <TextField.Root
                value={dealNameValue}
                onChange={(e) => setDealNameValue(e.target.value)}
                placeholder="Enter deal name"
                style={{ flex: 1 }}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveDealName();
                  if (e.key === "Escape") handleCancelEdit();
                }}
              />
              <Button
                size="2"
                onClick={handleSaveDealName}
                disabled={!dealNameValue.trim()}
              >
                Save
              </Button>
              <Button
                size="2"
                variant="soft"
                onClick={handleCancelEdit}
              >
                Cancel
              </Button>
            </Flex>
          ) : (
            <Text
              size="6"
              weight="bold"
              onClick={() => setIsEditingDealName(true)}
              style={{
                cursor: "pointer",
                padding: "4px 8px",
                borderRadius: "4px",
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f0f0f0";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
            {deal.deal_name}
          </Text>
          )}
            </Flex>
            <Flex direction="column" gap="2px" align="end" style={{ flex: "0 0 auto" }}>
              <DealTypeBadge dealType={deal.deal_type || 'rental_income'} />
            </Flex>
          </Flex>
        </Flex>

        <Separator size="4" />

        {/* Property Info */}
        <Grid columns="2" gap="16px">
          <InfoRow label="Property Type" value="Multi-Family" />
          <InfoRow label="Status" value={deal.status.replace(/_/g, " ")} />
          <InfoRow label="Documents" value={deal.document_count || 0} />
          <Flex direction="column" gap="4px">
            <Flex justify="between" align="center">
              <Text size="1" style={{ color: "#666", textTransform: "uppercase" }}>
                Deal Score
              </Text>
              {!scoreData && !isCalculatingScore && (
                <Button
                  size="1"
                  variant="soft"
                  onClick={handleCalculateScore}
                  style={{ cursor: "pointer" }}
                >
                  Calculate
                </Button>
              )}
            </Flex>
            {isCalculatingScore ? (
              <Text size="2" weight="medium" style={{ color: "#999" }}>
                Calculating...
              </Text>
            ) : scoreData && scoreData.score !== null ? (
              isEditingDealScore ? (
                <Flex gap="8px" align="center">
                  <TextField.Root
                    value={dealScoreValue}
                    onChange={(e) => setDealScoreValue(e.target.value)}
                    placeholder="Enter score"
                    style={{ width: "80px" }}
                    autoFocus
                    type="number"
                    min="0"
                    max="100"
                    onKeyDown={async (e) => {
                      if (e.key === "Enter") {
                        const score = parseInt(dealScoreValue);
                        if (!isNaN(score) && score >= 0 && score <= 100) {
                          const tier = determineTierFromScore(score);
                          setScoreData({
                            score,
                            tier,
                          });
                          // Persist to deal
                          try {
                            await updateDealScore(deal.deal_id, score, tier);
                          } catch (error) {
                            console.error('Error updating deal score:', error);
                          }
                          setIsEditingDealScore(false);
                        }
                      }
                      if (e.key === "Escape") {
                        setDealScoreValue(scoreData.score?.toString() || "—");
                        setIsEditingDealScore(false);
                      }
                    }}
                    onBlur={async () => {
                      const score = parseInt(dealScoreValue);
                      if (!isNaN(score) && score >= 0 && score <= 100) {
                        const tier = determineTierFromScore(score);
                        setScoreData({
                          score,
                          tier,
                        });
                        // Persist to deal
                        try {
                          await updateDealScore(deal.deal_id, score, tier);
                        } catch (error) {
                          console.error('Error updating deal score:', error);
                        }
                      } else {
                        setDealScoreValue(scoreData.score?.toString() || "—");
                      }
                      setIsEditingDealScore(false);
                    }}
                  />
                </Flex>
              ) : (
                <Flex gap="8px" align="center">
                  <Text
                    size="2"
                    weight="medium"
                    onClick={() => setIsEditingDealScore(true)}
                    style={{
                      cursor: "pointer",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      transition: "background-color 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#f0f0f0";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    {scoreData.score}
                  </Text>
                  {scoreData.tier && (
                    <Text
                      size="1"
                      style={{
                        padding: "2px 8px",
                        borderRadius: "12px",
                        backgroundColor: 
                          scoreData.tier === "strong" ? "#d4edda" :
                          scoreData.tier === "good" ? "#fff3cd" :
                          scoreData.tier === "risky" ? "#f8d7da" : "#e2e3e5",
                        color:
                          scoreData.tier === "strong" ? "#155724" :
                          scoreData.tier === "good" ? "#856404" :
                          scoreData.tier === "risky" ? "#721c24" : "#383d41",
                      }}
                    >
                      {scoreData.tier}
                    </Text>
                  )}
                </Flex>
              )
            ) : (
              isEditingDealScore ? (
                <Flex gap="8px" align="center">
                  <TextField.Root
                    value={dealScoreValue}
                    onChange={(e) => setDealScoreValue(e.target.value)}
                    placeholder="Enter score"
                    style={{ width: "80px" }}
                    autoFocus
                    type="number"
                    min="0"
                    max="100"
                    onKeyDown={async (e) => {
                      if (e.key === "Enter") {
                        const score = parseInt(dealScoreValue);
                        if (!isNaN(score) && score >= 0 && score <= 100) {
                          const tier = determineTierFromScore(score);
                          setScoreData({
                            score,
                            tier,
                          });
                          // Persist to deal
                          try {
                            await updateDealScore(deal.deal_id, score, tier);
                          } catch (error) {
                            console.error('Error updating deal score:', error);
                          }
                          setIsEditingDealScore(false);
                        }
                      }
                      if (e.key === "Escape") {
                        setDealScoreValue("—");
                        setIsEditingDealScore(false);
                      }
                    }}
                    onBlur={async () => {
                      const score = parseInt(dealScoreValue);
                      if (!isNaN(score) && score >= 0 && score <= 100) {
                        const tier = determineTierFromScore(score);
                        setScoreData({
                          score,
                          tier,
                        });
                        // Persist to deal
                        try {
                          await updateDealScore(deal.deal_id, score, tier);
                        } catch (error) {
                          console.error('Error updating deal score:', error);
                        }
                      } else {
                        setDealScoreValue("—");
                      }
                      setIsEditingDealScore(false);
                    }}
                  />
                </Flex>
              ) : (
                <Text
                  size="2"
                  weight="medium"
                  onClick={() => setIsEditingDealScore(true)}
                  style={{
                    color: "#999",
                    cursor: "pointer",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#f0f0f0";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  Not calculated
                </Text>
              )
            )}
          </Flex>
        </Grid>

        {metrics && (
          <>
            <Separator size="4" />

            {/* Financial Metrics */}
            <Flex direction="column" gap="12px">
              <Text size="2" weight="medium" style={{ color: "#666" }}>
                Financial Metrics
              </Text>
              {metrics.grossRent && (
                <MetricRow
                  label="Gross Rent"
                  value={formatCurrency(metrics.grossRent) + "/yr"}
                />
              )}
              {metrics.noi && (
                <MetricRow
                  label="NOI"
                  value={formatCurrency(metrics.noi) + "/yr"}
                />
              )}
              {metrics.dscr && (
                <MetricRow
                  label="DSCR"
                  value={metrics.dscr.toFixed(2) + "x"}
                  highlight
                />
              )}
              {metrics.capRate && (
                <MetricRow
                  label="Cap Rate"
                  value={formatPercentage(metrics.capRate)}
                />
              )}
              {metrics.capSpread && (
                <MetricRow
                  label="Cap Spread"
                  value={`+${Math.round(metrics.capSpread)} bps`}
                />
              )}
            </Flex>

            {capitalRange.max > 0 && (
              <>
                <Separator size="4" />

                {/* Capital Range */}
                <Card
                  style={{
                    background: "linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)",
                    padding: "20px",
                    border: "none",
                  }}
                >
                  <Flex direction="column" gap="8px">
                    <Text size="2" weight="medium" style={{ color: "#1976D2" }}>
                      Supported Capital
                    </Text>
                    <Text size="6" weight="bold" style={{ color: "#1976D2" }}>
                      {formatCurrency(capitalRange.min)} —{" "}
                      {formatCurrency(capitalRange.max)}
                    </Text>
                    <Text size="1" style={{ color: "#1976D2", opacity: 0.8 }}>
                      Based on current property performance
                    </Text>
                  </Flex>
                </Card>
              </>
            )}
          </>
        )}

        {/* Actions */}
        <Flex gap="8px" mt="auto">
          {onViewFullAnalysis && (
            <Button
              size="2"
              onClick={onViewFullAnalysis}
              style={{
                flex: 1,
                backgroundColor: "#1976D2",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              View Full Analysis
            </Button>
          )}
          {onExport && (
            <Button
              size="2"
              variant="soft"
              onClick={onExport}
              style={{
                flex: 1,
                cursor: "pointer",
              }}
            >
              Export
            </Button>
          )}
        </Flex>

        {/* Footer Note */}
        <Text size="1" style={{ color: "#999", textAlign: "center" }}>
          ○ All values verified with source citations
        </Text>
      </Flex>
    </Card>
  );
}

