import { useState } from "react";
import { Flex, Text, Card, Slider } from "@radix-ui/themes";

interface StressTestPanelProps {
  onScenarioChange: (scenario: {
    rentAdjustment: number;
    expenseAdjustment: number;
    interestRateAdjustment: number;
  }) => void;
}

const StressTestPanel = ({ onScenarioChange }: StressTestPanelProps) => {
  const [rentAdjustment, setRentAdjustment] = useState(0);
  const [expenseAdjustment, setExpenseAdjustment] = useState(0);
  const [interestRateAdjustment, setInterestRateAdjustment] = useState(0);

  const handleRentChange = (value: number[]) => {
    setRentAdjustment(value[0]);
    onScenarioChange({
      rentAdjustment: value[0],
      expenseAdjustment,
      interestRateAdjustment,
    });
  };

  const handleExpenseChange = (value: number[]) => {
    setExpenseAdjustment(value[0]);
    onScenarioChange({
      rentAdjustment,
      expenseAdjustment: value[0],
      interestRateAdjustment,
    });
  };

  const handleInterestRateChange = (value: number[]) => {
    setInterestRateAdjustment(value[0]);
    onScenarioChange({
      rentAdjustment,
      expenseAdjustment,
      interestRateAdjustment: value[0],
    });
  };

  const getRiskColor = () => {
    const totalStress =
      Math.abs(rentAdjustment) +
      Math.abs(expenseAdjustment) +
      Math.abs(interestRateAdjustment) / 100;

    if (totalStress === 0) return "#gray";
    if (totalStress < 10) return "#16a34a"; // green
    if (totalStress < 20) return "#eab308"; // yellow
    return "#dc2626"; // red
  };

  return (
    <Card>
      <Flex direction="column" gap="4">
        <Flex justify="between" align="center">
          <Text size="4" weight="bold">
            Stress Test Scenarios
          </Text>
          <div
            style={{
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              background: getRiskColor(),
            }}
          />
        </Flex>

        <Text size="2" color="gray">
          Adjust sliders to test how changes impact key metrics
        </Text>

        {/* Rent Adjustment */}
        <Flex direction="column" gap="2">
          <Flex justify="between" align="center">
            <Text size="3" weight="medium">
              Rent Adjustment
            </Text>
            <Text
              size="3"
              weight="bold"
              color={rentAdjustment < 0 ? "red" : rentAdjustment > 0 ? "green" : "gray"}
            >
              {rentAdjustment > 0 ? "+" : ""}
              {rentAdjustment}%
            </Text>
          </Flex>
          <Slider
            value={[rentAdjustment]}
            onValueChange={handleRentChange}
            min={-30}
            max={30}
            step={1}
            style={{ width: "100%" }}
          />
          <Flex justify="between">
            <Text size="1" color="gray">
              -30% (Worst case)
            </Text>
            <Text size="1" color="gray">
              +30% (Best case)
            </Text>
          </Flex>
        </Flex>

        {/* Expense Adjustment */}
        <Flex direction="column" gap="2">
          <Flex justify="between" align="center">
            <Text size="3" weight="medium">
              Expense Adjustment
            </Text>
            <Text
              size="3"
              weight="bold"
              color={expenseAdjustment > 0 ? "red" : expenseAdjustment < 0 ? "green" : "gray"}
            >
              {expenseAdjustment > 0 ? "+" : ""}
              {expenseAdjustment}%
            </Text>
          </Flex>
          <Slider
            value={[expenseAdjustment]}
            onValueChange={handleExpenseChange}
            min={-20}
            max={50}
            step={1}
            style={{ width: "100%" }}
          />
          <Flex justify="between">
            <Text size="1" color="gray">
              -20% (Cost savings)
            </Text>
            <Text size="1" color="gray">
              +50% (Cost overrun)
            </Text>
          </Flex>
        </Flex>

        {/* Interest Rate Adjustment */}
        <Flex direction="column" gap="2">
          <Flex justify="between" align="center">
            <Text size="3" weight="medium">
              Interest Rate Change
            </Text>
            <Text
              size="3"
              weight="bold"
              color={interestRateAdjustment > 0 ? "red" : interestRateAdjustment < 0 ? "green" : "gray"}
            >
              {interestRateAdjustment > 0 ? "+" : ""}
              {interestRateAdjustment} bps
            </Text>
          </Flex>
          <Slider
            value={[interestRateAdjustment]}
            onValueChange={handleInterestRateChange}
            min={-200}
            max={300}
            step={25}
            style={{ width: "100%" }}
          />
          <Flex justify="between">
            <Text size="1" color="gray">
              -200 bps (Rate decrease)
            </Text>
            <Text size="1" color="gray">
              +300 bps (Rate increase)
            </Text>
          </Flex>
        </Flex>
      </Flex>
    </Card>
  );
};

export default StressTestPanel;

