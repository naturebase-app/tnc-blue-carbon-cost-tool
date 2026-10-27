import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { useMemo } from "react";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";

import { INITIAL_FILTERS_STATE } from "@/app/(overview)/constants";
import { columns } from "@/containers/overview/table/view/overview/columns";
import { PROJECT_PRICE_TYPE } from "@shared/entities/projects.entity";

const getBreakEvenValue = (creditsIssued: string) => {
  const breakEvenColumn = columns(INITIAL_FILTERS_STATE).find(
    (column) =>
      column.id === "breakEvenCostPerTCO2e" && "accessorFn" in column,
  );

  if (!breakEvenColumn || !("accessorFn" in breakEvenColumn)) {
    throw new Error("Break-even column accessor was not found");
  }

  return breakEvenColumn.accessorFn(
    { creditsIssued, opexNPV: 100 } as unknown as Parameters<
      typeof breakEvenColumn.accessorFn
    >[0],
    0,
  );
};

describe("overview table break-even column", () => {
  it("returns null when credits issued is the string zero", () => {
    expect(getBreakEvenValue("0")).toBeNull();
  });

  it("calculates break-even cost when credits issued is a positive string", () => {
    expect(getBreakEvenValue("4")).toBe(25);
  });

  it("recalculates the same row when the break-even price type changes", () => {
    const project = {
      projectName: "Australia Salt marsh Conservation Large",
      creditsIssued: 362897.6487546232,
      opexNPV: 2213929.6809903407,
      totalCostNPV: 3783778.4150595283,
    };
    const data = [project];

    const TableProbe = ({ priceType }: { priceType: PROJECT_PRICE_TYPE }) => {
      const filters = { ...INITIAL_FILTERS_STATE, priceType };
      const tableColumns = useMemo(() => columns(filters), [filters]);
      const tableData = useMemo(
        () => data.map((item) => ({ ...item, priceType })),
        [priceType],
      );
      const table = useReactTable({
        data: tableData,
        columns: tableColumns,
        getCoreRowModel: getCoreRowModel(),
      });

      return (
        <span>
          {table
            .getRowModel()
            .rows[0].getValue<number>("breakEvenCostPerTCO2e")}
        </span>
      );
    };

    const { rerender } = render(
      <TableProbe priceType={PROJECT_PRICE_TYPE.OPEX_BREAKEVEN} />,
    );
    expect(Number(screen.getByText(/\d+\.\d+/).textContent)).toBeCloseTo(
      6.1007,
      4,
    );

    rerender(
      <TableProbe priceType={PROJECT_PRICE_TYPE.TOTAL_COST_BREAKEVEN} />,
    );
    expect(Number(screen.getByText(/\d+\.\d+/).textContent)).toBeCloseTo(
      10.4266,
      4,
    );
  });
});
