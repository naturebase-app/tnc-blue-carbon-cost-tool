import { List } from "@/components/ui/list";

export const projectSizeAssumptionsData = {
  headers: {
    project: "Project",
    projectSize: "Project Size",
    restorationSize: "Restoration size in ha",
    conservationSize: "Conservation size in ha (avoided loss area in ha)",
  },
  rows: [
    {
      id: "project-size-assumptions-mangroves-small",
      project: "Mangroves",
      projectSize: "Small",
      restorationSize: 100,
      conservationSize: "4,000 (~100)",
    },
    {
      id: "project-size-assumptions-salt-marshes-small",
      project: "Salt Marshes",
      projectSize: "Small",
      restorationSize: 100,
      conservationSize: "800 (~100)",
    },
    {
      id: "project-size-assumptions-seagrass-small",
      project: "Seagrass",
      projectSize: "Small",
      restorationSize: 100,
      conservationSize: "400 (~100)",
    },
    {
      id: "project-size-assumptions-mangroves-medium",
      project: "Mangroves",
      projectSize: "Medium",
      restorationSize: 500,
      conservationSize: "20,000 (~500)",
    },
    {
      id: "project-size-assumptions-salt-marshes-medium",
      project: "Salt Marshes",
      projectSize: "Medium",
      restorationSize: 500,
      conservationSize: "4,000 (~500)",
    },
    {
      id: "project-size-assumptions-seagrass-medium",
      project: "Seagrass",
      projectSize: "Medium",
      restorationSize: 500,
      conservationSize: "2,000  (~500)",
    },
    {
      id: "project-size-assumptions-mangroves-large",
      project: "Mangroves",
      projectSize: "Large",
      restorationSize: 1000,
      conservationSize: "40,000 (~1,000)",
    },
    {
      id: "project-size-assumptions-salt-marshes-large",
      project: "Salt Marshes",
      projectSize: "Large",
      restorationSize: 1000,
      conservationSize: "8,000 (~1,000)",
    },
    {
      id: "project-size-assumptions-seagrass-large",
      project: "Seagrass",
      projectSize: "Large",
      restorationSize: 1000,
      conservationSize: "4,000 (~1,000)",
    },
  ],
};

export const projectCostsAssumptionsAndMethodologyData = {
  headers: {
    costComponent: "Cost component",
    costAssumption: "Cost assumption",
    duration: "Duration",
    whatDrivesTheCost: "What drives the cost",
  },
  rows: [
    {
      id: "project-costs-assumptions-and-methodology-feasibility-analysis",
      costComponent: <p className="font-bold">Feasibility analysis</p>,
      costAssumption: (
        <List>
          <li>US: ~$100k</li>
          <li>AUS/ BHS: ~$70k</li>
          <li>Others: ~$50k</li>
        </List>
      ),
      duration: "One off cost",
      whatDrivesTheCost: (
        <List>
          <li>Providers typically have minimum fees</li>
          <li>Location accessibility</li>
        </List>
      ),
      category: "capex",
    },
    {
      id: "project-costs-assumptions-and-methodology-conservation-activity-planning-and-admin",
      costComponent: (
        <p className="font-bold">Conservation activity planning & admin</p>
      ),
      costAssumption: <p>~$167k/ year</p>,
      duration: "4 years (start up time)",
      whatDrivesTheCost: (
        <List>
          <li>Conservation professional salary</li>
          <li>Duration of project start up phase</li>
        </List>
      ),
      category: "capex",
    },
    {
      id: "project-costs-assumptions-and-methodology-data-collection-and-field-costs",
      costComponent: (
        <p className="font-bold">Data collection and field costs</p>
      ),
      costAssumption: <p>~$27k/ year</p>,
      duration: "3 years",
      whatDrivesTheCost: (
        <List>
          <li>Location accessibility</li>
          <li>Number, remoteness, and homogeneity of habitats</li>
          <li>Vendor costs</li>
        </List>
      ),
      category: "capex",
    },
    {
      id: "project-costs-assumptions-and-methodology-community-representation-liaison",
      costComponent: (
        <p className="font-bold">Community representation/ liaison</p>
      ),
      costAssumption: <p>Between ~$65-126k /year, depending on country</p>,
      duration: "4 years (start up time)",
      whatDrivesTheCost: (
        <List>
          <li>Number of communities and their remoteness</li>
          <li>Duration of project start up phase</li>
        </List>
      ),
      category: "capex",
    },
    {
      id: "project-costs-assumptions-and-methodology-blue-carbon-project-planning",
      costComponent: <p className="font-bold">Blue carbon project planning</p>,
      costAssumption: (
        <List>
          <li>AUS: ~$115k</li>
          <li>BHS: ~$125k</li>
          <li>Others: ~$100k</li>
        </List>
      ),
      duration: "3 years",
      whatDrivesTheCost: (
        <List>
          <li>Providers have minimums for costs of doing validation</li>
          <li>Location accessibility</li>
        </List>
      ),
      category: "capex",
    },
    {
      id: "project-costs-assumptions-and-methodology-validations",
      costComponent: <p className="font-bold">Validation</p>,
      costAssumption: <p>~$50k</p>,
      duration: "One off cost",
      whatDrivesTheCost: (
        <List>
          <li>Providers have minimums for costs of</li>
          <li>doing validation</li>
          <li>Location accessibility</li>
        </List>
      ),

      category: "capex",
    },
    {
      id: "project-costs-assumptions-and-methodology-establishing-carbon-rights",
      costComponent: <p className="font-bold">Conservation activity</p>,
      costAssumption: <p>~0</p>,
      duration: "N/A",
      whatDrivesTheCost: "N/A",
      category: "capex",
    },
    {
      id: "project-costs-assumptions-and-methodology-implementation-labor-and-engineering-activity",
      costComponent: (
        <p className="font-bold">
          Implementation labor and engineering activity
        </p>
      ),
      costAssumption: (
        <p>Highly dependent per ha cost by country and ecosystem</p>
      ),
      duration: "Dependent on restoration plan",
      whatDrivesTheCost: (
        <List>
          <li>Type and severity of intervention necessary</li>
          <li>Location accessibility</li>
          <li>Labor costs within country</li>
        </List>
      ),
      category: "capex",
    },
    {
      id: "project-costs-assumptions-and-methodology-monitoring-guarding-surveilling",
      costComponent: (
        <p className="font-bold">Monitoring/ Guarding/ Surveilling</p>
      ),
      costAssumption: <p>Highly dependent on salaries in country</p>,
      duration: "Every year after project set up",
      whatDrivesTheCost: (
        <List>
          <li>Project size</li>
          <li>Degradation driver</li>
          <li>Desire to employ more community members hired for this role</li>
        </List>
      ),
      category: "opex",
    },
    {
      id: "project-costs-assumptions-and-methodology-maintenance",
      costComponent: <p className="font-bold">Maintenance</p>,
      costAssumption: (
        <p>8% of implementation cost, for 3 years after the implementation</p>
      ),
      duration: "Three years after implementation",
      whatDrivesTheCost: (
        <List>
          <li>Scale of original implementation</li>
        </List>
      ),
      category: "opex",
    },
    {
      id: "project-costs-assumptions-and-methodology-landowner/community-benefit-share",
      costComponent: (
        <p className="font-bold">Landowner/community benefit share</p>
      ),
      costAssumption: (
        <p>
          10% of annual revenue; plus 50% of profit when revenue covers OPEX
          including the 10% share
        </p>
      ),
      duration: "Each year with carbon credit revenues",
      whatDrivesTheCost: (
        <List>
          <li>Value of other opportunities from land</li>
          <li>
            Degree of economic contribution to community from ecosystem
            degradation
          </li>
        </List>
      ),
      category: "opex",
    },
    {
      id: "project-costs-assumptions-and-methodology-baseline-reassessment",
      costComponent: <p className="font-bold">Baseline Reassessment</p>,
      costAssumption: <p>$40,000 / baseline reassessment</p>,
      duration: "Every 10 years",
      whatDrivesTheCost: (
        <List>
          <li>
            Providers have minimums for costs of doing a baseline reassessment
          </li>
          <li>Location accessibility</li>
        </List>
      ),
      category: "opex",
    },
    {
      id: "project-costs-assumptions-and-methodology-measurement-reporting-and-verification-mrv",
      costComponent: (
        <p className="font-bold">
          Measurement, Reporting and Verification (MRV)
        </p>
      ),
      costAssumption: <p>$100k (US, AUS, BA) $75k (others)</p>,
      duration: "Every 5 years",
      whatDrivesTheCost: (
        <List>
          <li>Providers have minimums for costs of doing an MRV</li>
          <li>Location accessibility</li>
        </List>
      ),
      category: "opex",
    },
    {
      id: "project-costs-assumptions-and-methodology-long-term-project-operating-admin",
      costComponent: (
        <p className="font-bold">Long term project operating admin</p>
      ),
      costAssumption: <p>$17k-130k (depending on country)</p>,
      duration: "Every year",
      whatDrivesTheCost: (
        <List>
          <li>Number of communities and their remoteness</li>
          <li>Number, remoteness, and homogeneity of habitats</li>
        </List>
      ),
      category: "opex",
    },
    {
      id: "project-costs-assumptions-and-methodology-carbon-standard-fees",
      costComponent: <p className="font-bold">Carbon standard fees</p>,
      costAssumption: <p>$0.2 per Verified Carbon Unit (VCU)</p>,
      duration: "Each year when credits are issued",
      whatDrivesTheCost: (
        <List>
          <li>
            Fee is set by third parties and has breakpoints based on credits
            sold
          </li>
        </List>
      ),
      category: "opex",
    },
    {
      id: "project-costs-assumptions-and-methodology-financing-cost",
      costComponent: <p className="font-bold">Financing cost</p>,
      costAssumption: <p>5% of CAPEX</p>,
      duration: "One off cost",
      whatDrivesTheCost: (
        <List>
          <li>Cost of doing business in the project country</li>
          <li>Magnitude of the funding gap</li>
        </List>
      ),
      category: "financing",
    },
  ],
};

export const qualitativeScoreCardData = {
  headers: {
    metric: "Metric",
    description: "Description",
    weight: "Weight",
  },
  rows: [
    {
      id: "qualitative-scorecard-economic-feasibility",
      metric: <span className="font-bold">Economic feasibility</span>,
      description:
        "Evaluation of the forecasted costs, revenues, and potential break-even price for carbon credits",
      weight: 20,
      category: "Economic",
    },
    {
      id: "qualitative-scorecard-abatement-potential",
      metric: <span className="font-bold">Abatement potential</span>,
      description:
        "The estimated annual abatement potential (tCO2e/year) for each country, ecosystem, and activity (conservation/ restoration)",
      weight: 18,
      category: "Abatement",
    },
    {
      id: "qualitative-scorecard-legal-feasibility",
      metric: <span className="font-bold">Legal feasibility</span>,
      description:
        "Evaluation of whether a country has the legal protection, government infrastructure, and political support that is required for a project to successfully produce carbon credits. Focus will also be on community aspects and benefits for community",
      weight: 12,
      category: "Non-economic",
    },
    {
      id: "qualitative-scorecard-implementation-risk",
      metric: <span className="font-bold">Implementation risk score</span>,
      description:
        "Assessment of the permanence risk a project faces due to deforestation and natural disasters. Used to determine whether a project will achieve the estimated abatement and approval for credit issuance",
      weight: 12,
      category: "Non-economic",
    },
    {
      id: "qualitative-scorecard-social-feasibility",
      metric: <span className="font-bold">Social feasibility</span>,
      description:
        "Assessment of the leakage risk a project faces from communities reverting to previous activities that degraded or destroyed ecosystems (e.g., deforestation, walling off shrimp ponds, etc.)",
      weight: 12,
      category: "Non-economic",
    },
    {
      id: "qualitative-scorecard-availability-of-experienced-labor",
      metric: (
        <span className="font-bold">Availability of experienced labor</span>
      ),
      description:
        "Assessment of whether a country has a pre-existing labor pool with experience in conservation or restoration work, based on the number of blue carbon or AFOLU carbon projects completed or in development",
      weight: 10,
      category: "Non-economic",
    },
    {
      id: "qualitative-scorecard-security-rating",
      metric: <span className="font-bold">Security rating</span>,
      description:
        "Assessment of the safety threat to individuals entering the country. Used to determine the physical risk posed to on-the-ground teams",
      weight: 5,
      category: "Non-economic",
    },
    {
      id: "qualitative-scorecard-availability-of-alternative-funding",
      metric: (
        <span className="font-bold">Availability of alternative funding</span>
      ),
      description:
        "Assessment of the possibility a project could access revenues outside of carbon credits (e.g., biodiversity credits, resilience credits, grants) to cover gaps between costs and carbon pricing",
      weight: 5,
      category: "Non-economic",
    },
    {
      id: "qualitative-scorecard-coastal-protection-benefit",
      metric: <span className="font-bold">Coastal protection benefit</span>,
      description:
        "Estimation of a project’s ability to reduce community risk through improved coastal resilience, to inform likelihood of achieving higher credit price",
      weight: 3,
      category: "Non-economic",
    },
    {
      id: "qualitative-scorecard-biodiversity-benefit",
      metric: <span className="font-bold">Biodiversity benefit</span>,
      description:
        "Estimation of a project’s impact on biodiversity, to inform likelihood of achieving higher credit price",
      weight: 3,
      category: "Non-economic",
    },
  ],
};

export const qualitativeScorecardDetailsAndSourcesData = {
  headers: {
    metric: "Metric",
    weighting: "Weighting",
    whatWeCanMeasure: "What we can measure",
    howWeWillMeasure: "How we will measure",
    variesBy: "Varies by",
    sources: "Sources",
  },
  rows: [
    {
      id: "qualitative-scorecard-details-and-sources-legal-feasibility",
      metric: <span className="font-bold">Legal feasibility</span>,
      weighting: 12,
      whatWeCanMeasure: (
        <List>
          <li>Country stability, ability to protect legal rights</li>
          <li>Government’s climate commitment</li>
        </List>
      ),
      howWeWillMeasure: (
        <>
          <p className="mb-2 font-semibold">
            Weighted average (of percentile):
          </p>
          <List>
            <li>
              Count of blue carbon projects (all) or AFOLU projects (only in
              development or completed)
            </li>
            <li>Index of Economic Freedom</li>
            <li>-NDC Commitment Strength</li>
          </List>
        </>
      ),
      variesBy: "Country",
      sources: (
        <List>
          <li>Verra & Plan Vivo Registries</li>
          <li>World Bank</li>
          <li>Climate Watch</li>
        </List>
      ),
    },
    {
      id: "qualitative-scorecard-details-and-sources-implementation-risk-score",
      metric: <span className="font-bold">Implementation risk score</span>,
      weighting: 12,
      whatWeCanMeasure: (
        <p>Permanence risk from mangrove deforestation, or natural disasters</p>
      ),
      howWeWillMeasure: (
        <>
          <p className="mb-2 font-semibold">
            Weighted average (of percentile):
          </p>
          <List>
            <li>Mangrove loss rate</li>
            <li>
              Disaster risk exposure rating (layered with specific info for key
              countries)
            </li>
          </List>
        </>
      ),
      variesBy: "Country",
      sources: (
        <List>
          <li>Global Mangrove Watch</li>
          <li>World Risk Report (RUB, IFHV)</li>
        </List>
      ),
    },
    {
      id: "qualitative-scorecard-details-and-sources-social-feasibility",
      metric: <span className="font-bold">Social feasibility</span>,
      weighting: 12,
      whatWeCanMeasure: (
        <p>
          Leakage risk from community activities (e.g., deforestation for shrimp
          farming)
        </p>
      ),
      howWeWillMeasure: (
        <>
          <p className="mb-2 font-semibold">
            Qualitative analysis by ecosystem:
          </p>
          <List>
            <li>
              Likelihood communities will return to the destructive activities
              that led to initial degradation
            </li>
          </List>
        </>
      ),
      variesBy: "Country / Ecosystem",
      sources: (
        <List>
          <li>Independent research</li>
          <li>Expert interviews</li>
        </List>
      ),
    },
    {
      id: "qualitative-scorecard-details-and-sources-availability-of-experienced-labor",
      metric: (
        <span className="font-bold">Availability of experienced labor</span>
      ),
      weighting: 10,
      whatWeCanMeasure: (
        <p>
          Size of labor pool experienced in restoration or conservation work
        </p>
      ),
      howWeWillMeasure: (
        <>
          <p className="mb-2 font-semibold">Percentile:</p>
          <List>
            <li>
              Count of blue carbon projects (all) or AFOLU projects (only in
              development or completed)
            </li>
          </List>
        </>
      ),
      variesBy: "Country",
      sources: (
        <List>
          <li>Verra & Plan Vivo Registries</li>
        </List>
      ),
    },
    {
      id: "qualitative-scorecard-details-and-sources-security-rating",
      metric: <span className="font-bold">Security rating</span>,
      weighting: 5,
      whatWeCanMeasure: <p>Safety threat to on-the-ground team</p>,
      howWeWillMeasure: (
        <>
          <p className="mb-2 font-semibold">
            Weighted average (of percentile):
          </p>
          <List>
            <li>Global Peace Index</li>
            <li>US Travel Risk Rating</li>
          </List>
        </>
      ),
      variesBy: "Country",
      sources: (
        <List>
          <li>Institute for Economics & Peace</li>
          <li>US Travel Risk Rating</li>
        </List>
      ),
    },
    {
      id: "qualitative-scorecard-details-and-sources-availability-of-alternative-funding",
      metric: (
        <span className="font-bold">Availability of alternative funding</span>
      ),
      weighting: 5,
      whatWeCanMeasure: (
        <p>
          Countries providing funds to / or receiving funds from UNFCCC Green
          Climate Fund
        </p>
      ),
      howWeWillMeasure: (
        <>
          <p className="mb-2 font-semibold">Percentile:</p>
          <List>
            <li>Contribution amount (for contributing nations)</li>
            <li>Financing amount (for recipient nations)</li>
          </List>
        </>
      ),
      variesBy: "Country",
      sources: (
        <List>
          <li>UNFCCC</li>
          <li>Expert interviews</li>
        </List>
      ),
    },
    {
      id: "qualitative-scorecard-details-and-sources-coastal-protection-benefit",
      metric: <span className="font-bold">Coastal protection benefit</span>,
      weighting: 3,
      whatWeCanMeasure: (
        <>
          <p className="mb-2 font-semibold">Percentile:</p>
          <List>
            <li>
              Count of individuals receiving coastal resiliency benefit over
              country population in low coastal zones
            </li>
          </List>
        </>
      ),
      howWeWillMeasure: (
        <>
          <p className="mb-2 font-semibold">Percentile:</p>
          <List>
            <li>Contribution amount (for contributing nations)</li>
            <li>Financing amount (for recipient nations)</li>
          </List>
        </>
      ),
      variesBy: "Country / Eco",
      sources: (
        <List>
          <li>TNC Naturebase co-benefit study</li>
        </List>
      ),
    },
    {
      id: "qualitative-scorecard-details-and-sources-biodiversity-benefit",
      metric: <span className="font-bold">Biodiversity benefit</span>,
      weighting: 3,
      whatWeCanMeasure: (
        <p>
          Typical biodiversity co-benefits delivered by projects with same
          ecosystem characteristics
        </p>
      ),
      howWeWillMeasure: (
        <>
          <p className="mb-2 font-semibold">Percentile:</p>
          <List>
            <li>
              Size of overlap between top priority Marine Protected Areas (MPAs)
              and country Exclusive Economic Zone (EEZs)
            </li>
          </List>
        </>
      ),
      variesBy: "Country",
      sources: (
        <List>
          <li>
            Priority Areas for Marine Biodiversity Conservation – University of
            Auckland
          </li>
        </List>
      ),
    },
  ],
};

export const sourcesHeaders = {
  modelComponent: "Model component",
  sources: "Sources",
};

export const versionsHeaders = {
  versionName: "Version Name",
  createdAt: "Date of update",
  versionNotes: "Notes",
};
