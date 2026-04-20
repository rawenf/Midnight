import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Pin } from '../types';

interface NeuralActivityChartProps {
  pins: Pin[];
}

export default function NeuralActivityChart({ pins }: NeuralActivityChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || pins.length === 0) return;

    // Clear previous SVG contents
    d3.select(svgRef.current).selectAll("*").remove();

    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const width = 600 - margin.left - margin.right;
    const height = 150 - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Process data: count pins per day for the last 30 days
    const now = new Date();
    const last30Days = d3.range(30).map(d => {
      const date = new Date(now);
      date.setDate(date.getDate() - d);
      date.setHours(0, 0, 0, 0);
      return date;
    }).reverse();

    const data = last30Days.map(date => {
      const count = pins.filter(pin => {
        const pinDate = pin.createdAt?.toDate ? pin.createdAt.toDate() : new Date(pin.createdAt);
        pinDate.setHours(0, 0, 0, 0);
        return pinDate.getTime() === date.getTime();
      }).length;
      return { date, count };
    });

    const x = d3.scaleTime()
      .domain(d3.extent(data, d => d.date) as [Date, Date])
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.count) || 1])
      .range([height, 0]);

    // Area generator for neural waves
    const area = d3.area<{ date: Date; count: number }>()
      .x(d => x(d.date))
      .y0(height)
      .y1(d => y(d.count))
      .curve(d3.curveMonotoneX);

    // Gradient definition
    const gradient = svg.append("defs")
      .append("linearGradient")
      .attr("id", "neural-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");

    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "rgba(255, 255, 255, 0.4)")
      .attr("stop-opacity", 0.4);

    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "rgba(255, 255, 255, 0)")
      .attr("stop-opacity", 0);

    // Draw the neural wave
    svg.append("path")
      .datum(data)
      .attr("fill", "url(#neural-gradient)")
      .attr("d", area);

    // Line generator
    const line = d3.line<{ date: Date; count: number }>()
      .x(d => x(d.date))
      .y(d => y(d.count))
      .curve(d3.curveMonotoneX);

    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "rgba(255, 255, 255, 0.6)")
      .attr("stroke-width", 1.5)
      .attr("d", line);

    // Dots for activity days
    svg.selectAll(".dot")
      .data(data.filter(d => d.count > 0))
      .enter().append("circle")
      .attr("class", "dot")
      .attr("cx", d => x(d.date))
      .attr("cy", d => y(d.count))
      .attr("r", 3)
      .attr("fill", "#FFFFFF")
      .attr("filter", "drop-shadow(0 0 5px rgba(255,255,255,0.5))");

    // X-axis (minimalism)
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(5).tickSize(0).tickPadding(10))
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll("text")
        .attr("fill", "rgba(255, 255, 255, 0.2)")
        .attr("font-size", "8px")
        .attr("font-weight", "700")
        .attr("text-transform", "uppercase")
        .attr("letter-spacing", "1px")
      );

  }, [pins]);

  return (
    <div className="w-full overflow-hidden flex flex-col items-center">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[10px] uppercase font-bold tracking-[3px] text-text-muted opacity-40">Neural Activity Flow</span>
        <div className="h-px w-20 bg-white/5" />
      </div>
      <svg ref={svgRef} className="overflow-visible"></svg>
    </div>
  );
}
