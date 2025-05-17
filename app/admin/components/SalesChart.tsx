"use client";

import { Chart, registerables } from "chart.js";
import { useEffect, useRef } from "react";

Chart.register(...registerables);

export default function SalesChart() {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (chartRef.current) {
      // Destroy existing chart if it exists
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      // Sample data - replace with actual API data in real implementation
      const salesData = {
        labels: [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ],
        datasets: [
          {
            label: "Sales",
            data: [
              2300, 1900, 3000, 5100, 4200, 6100, 5400, 6800, 7300, 8200, 7800,
              9100,
            ],
            borderColor: "#3b82f6",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            fill: true,
            tension: 0.3,
          },
          {
            label: "Orders",
            data: [45, 38, 55, 65, 58, 75, 68, 80, 91, 98, 87, 105],
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
  }, []);

  return (
    <div className="h-80">
      <canvas ref={chartRef}></canvas>
    </div>
  );
}
