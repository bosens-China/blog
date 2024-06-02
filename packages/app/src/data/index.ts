import label from "@blog/rear-end/json/labelsData";
import issuesData from "@blog/rear-end/json/issuesData";
import type { Label } from "@blog/rear-end/types/labels";
import type { IssuesTypes } from "@blog/rear-end/types/issues";

type labelsDataType = [Label | "unknown", IssuesTypes][];

const labelsData = label as { data: labelsDataType };

export { labelsData, issuesData };
