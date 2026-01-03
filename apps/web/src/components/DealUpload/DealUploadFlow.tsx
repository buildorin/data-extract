import { useState } from "react";
import { Flex, Text, Button, Select, Card } from "@radix-ui/themes";
import { useMutation, useQueryClient } from "react-query";
import { uploadDealDocuments } from "../../services/dealApi";
import toast from "react-hot-toast";
import "./DealUploadFlow.css";

interface DealUploadFlowProps {
  dealId: string;
  onComplete?: () => void;
}

const DealUploadFlow = ({ dealId, onComplete }: DealUploadFlowProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [documentType, setDocumentType] = useState<string>("rent_roll");
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: (data: { dealId: string; files: File[]; documentType: string }) =>
      uploadDealDocuments(data.dealId, data.files, data.documentType),
    onSuccess: () => {
      toast.success("Documents uploaded successfully");
      queryClient.invalidateQueries({ queryKey: ["deals"] });
      queryClient.invalidateQueries({ queryKey: ["deal", dealId] });
      setFiles([]);
      if (onComplete) onComplete();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to upload documents");
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = () => {
    if (files.length === 0) {
      toast.error("Please select at least one file");
      return;
    }

    if (!documentType) {
      toast.error("Please select a document type");
      return;
    }

    uploadMutation.mutate({ dealId, files, documentType });
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  return (
    <Flex direction="column" gap="4" p="24px" className="deal-upload-flow">
      <Text size="6" weight="bold">
        Upload Deal Documents
      </Text>

      <Card>
        <Flex direction="column" gap="4">
          <div>
            <Text size="3" weight="medium" mb="2">
              Document Type
            </Text>
            <Select.Root value={documentType} onValueChange={setDocumentType}>
              <Select.Trigger style={{ width: "100%" }} />
              <Select.Content>
                <Select.Item value="other">Other</Select.Item>
                <Select.Item value="tax_document">Tax Document</Select.Item>
                <Select.Item value="bank_statement">Bank Statement</Select.Item>
                <Select.Item value="property_deed">Property Deed</Select.Item>
                <Select.Item value="insurance_policy">
                  Insurance Policy
                </Select.Item>
                <Select.Item value="mortgage_statement">
                  Mortgage Statement
                </Select.Item>
                <Select.Item value="profit_and_loss">Profit & Loss</Select.Item>
                <Select.Item value="rent_roll">Rent Roll</Select.Item>
              </Select.Content>
            </Select.Root>
          </div>

          <div>
            <Text size="3" weight="medium" mb="2">
              Select Files
            </Text>
            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #e0e0e0",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            />
            <Text size="2" color="gray" mt="2">
              Supported: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG
            </Text>
          </div>

          {files.length > 0 && (
            <div>
              <Text size="3" weight="medium" mb="2">
                Selected Files ({files.length})
              </Text>
              <Flex direction="column" gap="2">
                {files.map((file, index) => (
                  <Flex
                    key={index}
                    justify="between"
                    align="center"
                    p="2"
                    style={{
                      border: "1px solid #e0e0e0",
                      borderRadius: "4px",
                      background: "#f8f8f8",
                    }}
                  >
                    <Flex direction="column" gap="1">
                      <Text size="2" weight="medium">
                        {file.name}
                      </Text>
                      <Text size="1" color="gray">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </Text>
                    </Flex>
                    <Button
                      size="1"
                      variant="ghost"
                      color="red"
                      onClick={() => removeFile(index)}
                    >
                      Remove
                    </Button>
                  </Flex>
                ))}
              </Flex>
            </div>
          )}

          <Flex gap="2" justify="end">
            <Button
              size="3"
              onClick={handleUpload}
              disabled={uploadMutation.isLoading || files.length === 0}
            >
              {uploadMutation.isLoading ? "Uploading..." : "Upload Documents"}
            </Button>
          </Flex>
        </Flex>
      </Card>
    </Flex>
  );
};

export default DealUploadFlow;

