import { SubHeader } from "@/containers/methodology/header";
import { MethodologySection } from "@/containers/methodology/sections";
import MethodologyTable from "@/containers/methodology/table";
import { projectCostsAssumptionsAndMethodologyData } from "@/containers/methodology/table/data";
import ContentWrapper from "@/containers/methodology/wrapper";

import { List } from "@/components/ui/list";

const ProjectCostsAssumptionsAndMethodology: MethodologySection = {
  id: "project-costs-assumptions-and-methodology",
  title: "Project costs – assumptions and methodology",
  href: "#project-costs-assumptions-and-methodology",
  Content: (
    <div className="space-y-4">
      <ContentWrapper>
        <SubHeader
          title="Cost default values"
          description="Cost were divided into separate project components, based on expert consultations. Default values are provided for each cost component. These default values serve as a baseline, but users have the flexibility to customize the output by overwriting specific cost components."
        />
        <p>
          <strong>
            Below are detailed descriptions of each cost component.
          </strong>
        </p>
        <List>
          <li>
            <strong>Feasibility analysis:</strong> The production of a
            feasibility assessment, evaluating GHG mitigation potential and
            financial and non-financial considerations (e.g., legal, social).
          </li>
          <li>
            <strong>Conservation planning and administration:</strong>{" "}
            Activities involved in the project start-up phase, such as project
            management, vendor coordination, fundraising, research, and travel.
          </li>
          <li>
            <strong>Data collection/field costs:</strong> The expenses
            associated with onsite and field sampling to gather necessary data
            for baseline and monitoring (e.g., carbon stock, vegetation and soil
            characteristics, hydrological data).
          </li>
          <li>
            <strong>Community representation work:</strong> Efforts aimed at
            supporting a free, prior and informed consent process with
            communities who are involved with or may be impacted by the project.
            This can include assessing community needs, conducting stakeholder
            surveys and trainings, providing education about blue carbon market
            projects, and supporting a community-led design.
          </li>
          <li>
            <strong>Blue carbon project planning and administration:</strong>{" "}
            The preparation of the project design document (PD), which may
            include contracted services.
          </li>
          <li>
            <strong>Cost of establishing carbon rights:</strong> Legal expenses
            related to clarifying carbon rights, establishing conservation and
            community agreements, and packaging carbon benefits for legally
            valid sales.
          </li>
          <li>
            <strong>Validation:</strong> The fee or price associated with the
            validation of the PD (e.g., by an approved third-party).
          </li>
          <li>
            <strong>Conservation activity:</strong> The implementation costs for
            conservation, such as adding signage to designate the area as
            conservation land. These costs have been included in other cost
            buckets (e.g., community representation work, and long-term project
            operation and admin)
          </li>
          <li>
            Implementation labor: Only applicable to restoration. The costs
            associated with labor and materials required for rehabilitating the
            degraded area (hydrology, planting or hybrid).{" "}
            <span className="underline">Note:</span> Certain countries,
            ecosystems and activity types don&apos;t have implementation labor
            estimates.
          </li>
        </List>
        <p>
          <strong>
            Ongoing project cost (Operational Expenditures, OPEX):
          </strong>
        </p>
        <List>
          <li>
            <strong>Monitoring:</strong> The expenses related to individuals
            moving throughout the project site to prevent degradation and report
            necessary actions/changes.
          </li>
          <li>
            <strong>Maintenance:</strong> Only applicable to restoration. The
            costs associated with the physical upkeep of the original
            implementation, such as pest control, removing blockages, and
            rebuilding small portions.
          </li>
          <li>
            <strong>Landowner/community benefit share:</strong> Each active
            year, 10% of carbon revenue is included in OPEX. When revenue is at
            least OPEX including this 10% share, an additional 50% of profit
            (revenue minus other OPEX) is allocated to the landowner/community.
            The combined share can reach 60% when other OPEX is zero. Benefits
            may support the community&apos;s priorities through goods, services,
            infrastructure, or cash.
          </li>
          <li>
            <strong>Baseline reassessment:</strong> The costs associated with a
            third-party assessment to ensure the initial GHG emission/reduction
            estimates are accurate and remain so over time. Most standards
            require baseline reassessment every 6 or 10 years.{" "}
          </li>
          <li>
            <strong>Measuring, reporting, and verification (MRV):</strong> The
            costs associated with measuring, reporting, and verifying GHG
            emissions that occur post-implementation to enable carbon benefit
            sales through a third party. Most standards require this at least
            every 5 years.
          </li>
          <li>
            <strong>Long-term project operation and administration:</strong> The
            expenses related to project oversight, vendor coordination,
            community engagement, stakeholder management, etc., during the
            ongoing operating years of the project.
          </li>
          <li>
            <strong>Carbon standard fees:</strong> Administrative fees charged
            by the carbon standard (e.g., Verra).
          </li>
        </List>
        <p>
          <strong>Financing cost:</strong>
        </p>
        <List>
          <li>
            <strong>Financing cost:</strong> The time, effort, and cost
            associated with securing financing for the set-up phase of the
            project.
          </li>
        </List>
        <p>
          Sources used to calculate cost components can be found in Sources.
        </p>
        <p>
          The below table provides the assumptions and methodologies used to
          estimate the cost components of a blue carbon project.
        </p>
      </ContentWrapper>
      <MethodologyTable
        data={projectCostsAssumptionsAndMethodologyData}
        categorized
      />
    </div>
  ),
};

export default ProjectCostsAssumptionsAndMethodology;
