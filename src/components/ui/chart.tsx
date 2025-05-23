import type React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

import { cn } from "../../lib/utils";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

interface ChartProps {
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string;
    }[];
  };
  options?: any;
  className?: string;
}

const Chart: React.FC<ChartProps> = ({ data, options, className }) => {
  const defaultOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Chart",
      },
    },
  };

  const mergedOptions = { ...defaultOptions, ...options };

  return (
    <div className={cn("w-full", className)}>
      <Bar options={mergedOptions} data={data} />
    </div>
  );
};

export default Chart;
