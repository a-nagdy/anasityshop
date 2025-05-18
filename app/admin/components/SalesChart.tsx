"use client";

import { Chart, registerables } from "chart.js";
import { useEffect, useRef } from "react";

Chart.register(...registerables);

interface StatsData {
  totalOrders: number;
  totalRevenue: number;
  totalProducts?: number;
  totalUsers?: number;
}

export default function SalesChart({ data }: { data: StatsData }) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (chartRef.current) {
      // Destroy existing chart if it exists
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      // Days of the week for weekly data
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

      // Generate random data that adds up to total values
      const generateWeeklyData = (total: number) => {
        const result = Array(7)
          .fill(0)
          .map(() => Math.floor(Math.random() * (total / 2)));
        const sum = result.reduce((a, b) => a + b, 0);

        // Scale to ensure the sum equals the total
        return result.map((val) => Math.round((val / (sum || 1)) * total) || 0);
      };

      // Generate random weekly data that adds up to totals
      const revenueWeekly = generateWeeklyData(data.totalRevenue || 100);
      const ordersWeekly = generateWeeklyData(data.totalOrders || 10);

      const salesData = {
        labels: days,
        datasets: [
          {
            label: "Revenue",
            data: revenueWeekly,
            borderColor: "#3b82f6",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            fill: true,
            tension: 0.3,
          },
          {
            label: "Orders",
            data: ordersWeekly,
            borderColor: "#10b981",
            backgroundColor: "transparent",
            borderDash: [5, 5],
            tension: 0.3,
          },
        ],
      };

      const ctx = chartRef.current.getContext("2d");

      if (ctx) {
        chartInstance.current = new Chart(ctx, {
          type: "line",
          data: salesData,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: "top",
                labels: {
                  font: {
                    size: 12,
                  },
                },
              },
              tooltip: {
                mode: "index",
                intersect: false,
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: {
                  color: "rgba(0, 0, 0, 0.05)",
                },
              },
              x: {
                grid: {
                  display: false,
                },
              },
            },
            interaction: {
              mode: "nearest",
              axis: "x",
              intersect: false,
            },
            animation: {
              duration: 1000,
              easing: "easeOutQuart",
            },
          },
        });
      }
    }

    // Clean up chart instance on unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data]); // Add data dependency

  return (
    <div className="h-80">
      <canvas ref={chartRef}></canvas>
    </div>
  );
}
