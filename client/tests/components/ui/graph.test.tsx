import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { GraphWithLegend } from "@/components/ui/graph";

describe("GraphWithLegend", () => {
  it("renders graph with correct total, segments and legend items", () => {
    const testData = {
      total: 1000,
      items: [
        {
          value: 400,
          label: "CapEx",
          circleClassName: "bg-sky-blue-200",
          labelClassName: "text-sky-blue-200",
        },
        {
          value: 600,
          label: "Opex",
          circleClassName: "bg-sky-blue-500",
          labelClassName: "text-sky-blue-500",
        },
      ],
    };

    render(<GraphWithLegend {...testData} />);

    // Check if total amount is displayed
    const totalAmount = screen.getByText("1,000");
    expect(totalAmount).toBeInTheDocument();
    expect(totalAmount.previousSibling).toHaveTextContent("$");

    // Check if legend items are rendered
    expect(screen.getByText("Total")).toBeInTheDocument();
    expect(screen.getByText("CapEx")).toBeInTheDocument();
    expect(screen.getByText("Opex")).toBeInTheDocument();

    // Check if segment values are displayed (using the Currency component format)
    const capExAmount = screen.getByText("400.0");
    expect(capExAmount).toBeInTheDocument();
    expect(capExAmount.previousSibling).toHaveTextContent("$");

    const opExAmount = screen.getByText("600.0");
    expect(opExAmount).toBeInTheDocument();
    expect(opExAmount.previousSibling).toHaveTextContent("$");
  });

  it("keeps revenue and cost bars aligned when net revenue is zero", () => {
    const { container } = render(
      <GraphWithLegend
        total={2_300_000}
        leftover={0}
        items={[
          {
            value: 2_300_000,
            label: "OpEx",
            circleClassName: "bg-sky-blue-200",
            labelClassName: "text-sky-blue-200",
          },
        ]}
      />,
    );

    expect(screen.getByText("0", { exact: true })).toBeInTheDocument();
    expect(container.querySelectorAll(".border-dashed")).toHaveLength(1);

    const barHeights = Array.from(
      container.querySelectorAll<HTMLElement>("[style]"),
    )
      .map((element) => element.style.height)
      .filter(Boolean);

    expect(barHeights).toEqual(["100%", "100%"]);
  });

  it.each([
    { total: 0, leftover: 0, segmentValue: 0 },
    { total: 0.00000000001, leftover: -0.00000000001, segmentValue: -1 },
    { total: -100, leftover: -25, segmentValue: -10 },
  ])(
    "keeps split graph heights valid for total $total and leftover $leftover",
    ({ total, leftover, segmentValue }) => {
      const { container } = render(
        <GraphWithLegend
          total={total}
          leftover={leftover}
          items={[
            {
              value: segmentValue,
              label: "Segment",
              circleClassName: "bg-sky-blue-500",
              labelClassName: "text-sky-blue-500",
            },
          ]}
        />,
      );

      const heights = Array.from(
        container.querySelectorAll<HTMLElement>("[style]"),
      )
        .map((element) => element.style.height)
        .filter(Boolean);

      expect(heights.length).toBeGreaterThan(0);
      expect(heights.every((height) => /^\d+(\.\d+)?%$/.test(height))).toBe(
        true,
      );
    },
  );
});
