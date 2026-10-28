import {
  ACTIVITY,
  RESTORATION_ACTIVITY_SUBTYPE,
} from "@shared/entities/activity.enum";
import { CARBON_REVENUES_TO_COVER } from "@shared/entities/custom-project.entity";
import { ECOSYSTEM } from "@shared/entities/ecosystem.enum";
import { render, screen } from "@testing-library/react";

import ProjectDetails, {
  ProjectDetailsProps,
} from "@/containers/projects/custom-project/details";

vi.mock("next/navigation", () => ({
  useParams: vi.fn().mockReturnValue({ id: undefined }),
}));

describe("projects/custom-projects/details/project-details", () => {
  const defaultProps: ProjectDetailsProps = {
    data: {
      country: { code: "US", name: "United States" },
      ecosystem: ECOSYSTEM.MANGROVE,
      carbonRevenuesToCover: CARBON_REVENUES_TO_COVER.OPEX,
      projectSize: 10000,
      activity: ACTIVITY.CONSERVATION,
      projectLength: 10,
      initialCarbonPrice: {
        label: "Initial carbon price",
        value: 10,
      },
    },
  };

  const checkDefaultProps = () => {
    const { data } = defaultProps;

    const country = screen.getByRole("heading", { name: "Country" });
    expect(country).toBeInTheDocument();
    expect(country.nextSibling).toHaveTextContent(data.country.name);

    const ecosystem = screen.getByRole("heading", { name: "Ecosystem" });
    expect(ecosystem).toBeInTheDocument();
    expect(ecosystem.nextSibling).toHaveTextContent(data.ecosystem);

    const carbonRevenuesToCover = screen.getByRole("heading", {
      name: "Carbon revenues to cover",
    });
    expect(carbonRevenuesToCover).toBeInTheDocument();
    expect(carbonRevenuesToCover.nextSibling).toHaveTextContent(
      data.carbonRevenuesToCover as string,
    );

    const projectSize = screen.getByRole("heading", { name: "Project size" });
    expect(projectSize).toBeInTheDocument();
    expect(projectSize.nextSibling).toHaveTextContent("10,000hectares");

    const activity = screen.getByRole("heading", { name: "Activity type" });
    expect(activity).toBeInTheDocument();
    expect(activity.nextSibling).toHaveTextContent(data.activity);

    const projectLength = screen.getByRole("heading", {
      name: "Project length",
    });
    expect(projectLength).toBeInTheDocument();
    expect(projectLength.nextSibling).toHaveTextContent(
      data.projectLength.toString(),
    );
  };

  const getEmissionFactorElement = () => {
    const emissionFactor = screen.getByRole("heading", {
      name: "Emission factor",
    });
    expect(emissionFactor).toBeInTheDocument();
    return emissionFactor.nextSibling;
  };

  it("renders correctly with the minimum required data", () => {
    render(<ProjectDetails {...defaultProps} />);
    checkDefaultProps();
  });

  it("renders total credit generation when provided", () => {
    render(
      <ProjectDetails
        data={{ ...defaultProps.data, totalCreditsIssued: 717556.226 }}
      />,
    );

    const totalCreditGeneration = screen.getByRole("heading", {
      name: "Total credit generation",
    });
    expect(totalCreditGeneration.nextSibling).toHaveTextContent(
      "717,556.226tCO2e",
    );
  });

  it("renders default values + any optional data when provided", () => {
    const data = {
      ...defaultProps.data,
      lossRate: 10,
      restorationActivity: RESTORATION_ACTIVITY_SUBTYPE.HYBRID,
      sequestrationRate: 10,
    };

    render(<ProjectDetails data={data} />);

    checkDefaultProps();

    const lossRate = screen.getByRole("heading", { name: "Loss rate" });
    expect(lossRate).toBeInTheDocument();
    expect(lossRate.nextSibling).toHaveTextContent("10.00%");

    const restorationActivity = screen.getByRole("heading", {
      name: "Restoration activity type",
    });
    expect(restorationActivity).toBeInTheDocument();
    expect(restorationActivity.nextSibling).toHaveTextContent(
      data.restorationActivity,
    );

    const sequestrationRate = screen.getByRole("heading", {
      name: "Sequestration rate",
    });
    expect(sequestrationRate).toBeInTheDocument();
    expect(sequestrationRate.nextSibling).toHaveTextContent("10tCO2e/ha/yr");
  });

  it("renders emission factor components correctly when agb and soc are provided", () => {
    const data = {
      ...defaultProps.data,
      emissionFactors: {
        emissionFactor: null,
        emissionFactorAgb: 10,
        emissionFactorSoc: 10,
      },
    };

    render(<ProjectDetails data={data} />);

    const emissionFactorElement = getEmissionFactorElement();
    expect(emissionFactorElement).toHaveTextContent("");

    // Test AGB section
    const agbContainer = screen.getByText("AGB").closest("p");
    expect(agbContainer).toBeInTheDocument();
    expect(agbContainer).toHaveClass("space-x-1", "font-normal");

    const [labelSpan, valueSpan, unitSpan] = Array.from(
      agbContainer!.querySelectorAll("span"),
    );

    expect(labelSpan).toHaveClass("text-xs", "text-muted-foreground");
    expect(labelSpan).toHaveTextContent("AGB");

    expect(valueSpan).toHaveClass("text-xl");
    expect(valueSpan).toHaveTextContent("10");

    expect(unitSpan).toHaveClass("text-xs", "text-muted-foreground");
    expect(unitSpan).toHaveTextContent("tCO2e/ha/yr");

    // Test SOC section
    expect(screen.getByText("SOC")).toBeInTheDocument();
  });

  it("prioritizes emissionFactor when all emission factor properties are present", () => {
    const data = {
      ...defaultProps.data,
      emissionFactors: {
        emissionFactor: 15,
        emissionFactorAgb: 10,
        emissionFactorSoc: 10,
      },
    };

    render(<ProjectDetails data={data} />);

    const emissionFactorElement = getEmissionFactorElement();
    expect(emissionFactorElement).toHaveTextContent("15");

    expect(screen.queryByText("AGB")).not.toBeInTheDocument();
    expect(screen.queryByText("SOC")).not.toBeInTheDocument();
  });
});
